// Newsletter plumbing: Resend client, self-contained signed tokens
// (double opt-in + unsubscribe without a database), and the weekly
// digest email builders.

import { createHmac, timingSafeEqual } from "node:crypto";
import { Resend } from "resend";
import type { StoryCluster } from "./types";

let resend: Resend | null = null;

/** Lazily-created Resend client. Throws when the key isn't configured. */
export function getResend(): Resend {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY is not configured");
  if (!resend) resend = new Resend(key);
  return resend;
}

export const NEWSLETTER_FROM =
  process.env.NEWSLETTER_FROM ?? "The Wider Lens <newsletter@news.thewiderlens.info>";

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://thewiderlens.info"
).replace(/\/$/, "");

export const OWNER_EMAIL = process.env.NEWSLETTER_OWNER_EMAIL ?? "";

export function isValidEmail(email: string): boolean {
  if (typeof email !== "string" || email.length > 254) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

function getSecret(): string {
  const s = process.env.NEWSLETTER_SECRET;
  if (!s) throw new Error("NEWSLETTER_SECRET is not configured");
  return s;
}

// ─── Self-contained signed tokens ──────────────────────────────────────────
// token = base64url(JSON {…payload, exp}).base64url(HMAC_SHA256(secret, body))
// No database: the confirm link carries the contact id + expiry, signed.

export function signToken(payload: Record<string, unknown>, ttlMs = 7 * 24 * 3_600_000): string {
  const body = { ...payload, exp: Date.now() + ttlMs };
  const b64 = Buffer.from(JSON.stringify(body)).toString("base64url");
  const sig = createHmac("sha256", getSecret()).update(b64).digest("base64url");
  return `${b64}.${sig}`;
}

export function verifyToken(token: string): Record<string, unknown> | null {
  try {
    const [b64, sig] = token.split(".");
    if (!b64 || !sig) return null;
    const expected = createHmac("sha256", getSecret()).update(b64).digest();
    const actual = Buffer.from(sig, "base64url");
    if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;
    const body = JSON.parse(Buffer.from(b64, "base64url").toString("utf8"));
    if (typeof body.exp !== "number" || body.exp < Date.now()) return null;
    return body;
  } catch {
    return null;
  }
}

// ─── Digest building ───────────────────────────────────────────────────────

function decodeHtml(s: string): string {
  return s
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, n) => String.fromCharCode(parseInt(n, 16)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#0?39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&");
}

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function trimSummary(s: string, n = 220): string {
  const t = decodeHtml(s).replace(/\s+/g, " ").trim();
  return t.length > n ? `${t.slice(0, n).trimEnd()}…` : t;
}

export interface Digest {
  subject: string;
  html: string;
  text: string;
  weekLabel: string;
  storyCount: number;
}

export function buildDigest(stories: StoryCluster[]): Digest {
  const now = new Date();
  const weekLabel = now.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "America/New_York",
  });
  const topHeadline = trimSummary(stories[0].primary.title, 60);
  const subject = `This week in AI: ${topHeadline}`;

  const storyHtml = stories
    .map((s, i) => {
      const headline = esc(decodeHtml(s.primary.title));
      const summary = esc(trimSummary(s.primary.description));
      const category = esc(s.category);
      const sourceLinks = s.sources
        .slice(0, 4)
        .map((a) => `<a href="${esc(a.url)}" style="color:#7c3aed;text-decoration:none;">${esc(a.source)}</a>`)
        .join(" · ");
      return `
        <div style="margin:0 0 28px 0;padding:0 0 24px 0;border-bottom:1px solid #e4e4e7;">
          <p style="margin:0 0 6px 0;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#7c3aed;">${i + 1}. ${category}</p>
          <h2 style="margin:0 0 8px 0;font-size:19px;line-height:1.35;color:#18181b;">
            <a href="${esc(s.primary.url)}" style="color:#18181b;text-decoration:none;">${headline}</a>
          </h2>
          <p style="margin:0 0 10px 0;font-size:14px;line-height:1.6;color:#52525b;">${summary}</p>
          <p style="margin:0;font-size:12px;color:#71717a;">Sources: ${sourceLinks}</p>
        </div>`;
    })
    .join("\n");

  const postal = process.env.NEWSLETTER_POSTAL_ADDRESS;
  const postalLine = postal
    ? `<p style="margin:6px 0 0 0;">${esc(postal)}</p>`
    : "";

  const html = `<!doctype html>
<html><body style="margin:0;padding:0;background:#f4f4f5;">
<div style="max-width:600px;margin:0 auto;padding:32px 20px;font-family:ui-sans-serif,system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;color:#18181b;">
  <div style="margin-bottom:24px;">
    <p style="margin:0 0 4px 0;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#7c3aed;">The Wider Lens · Weekly Brief</p>
    <h1 style="margin:0;font-size:26px;line-height:1.25;">The week's biggest AI stories</h1>
    <p style="margin:8px 0 0 0;font-size:14px;color:#52525b;">Week of ${esc(weekLabel)} — every story verified by at least two independent outlets.</p>
  </div>
  ${storyHtml}
  <div style="margin-top:8px;padding-top:20px;border-top:1px solid #e4e4e7;font-size:12px;line-height:1.7;color:#71717a;">
    <p style="margin:0;">You're receiving this because you subscribed at <a href="${esc(SITE_URL)}" style="color:#7c3aed;text-decoration:none;">${esc(SITE_URL.replace(/^https?:\/\//, ""))}</a>.</p>
    <p style="margin:6px 0 0 0;"><a href="{{{RESEND_UNSUBSCRIBE_URL}}}" style="color:#7c3aed;text-decoration:none;">Unsubscribe</a> · <a href="${esc(SITE_URL)}" style="color:#7c3aed;text-decoration:none;">Read online</a></p>
    ${postalLine}
  </div>
</div>
</body></html>`;

  const storyText = stories
    .map((s, i) => {
      const headline = decodeHtml(s.primary.title);
      const summary = trimSummary(s.primary.description);
      const sources = s.sources.slice(0, 4).map((a) => `${a.source}: ${a.url}`).join("\n  ");
      return `${i + 1}. ${headline}\n${summary}\nRead: ${s.primary.url}\nSources:\n  ${sources}`;
    })
    .join("\n\n---\n\n");

  const text = `THE WIDER LENS — WEEKLY BRIEF (week of ${weekLabel})

The week's biggest AI stories. Every story verified by at least two independent outlets.

${storyText}

---
You're receiving this because you subscribed at ${SITE_URL}.
Unsubscribe: {{{RESEND_UNSUBSCRIBE_URL}}}`;

  return { subject, html, text, weekLabel, storyCount: stories.length };
}

/** Confirmation email sent for double opt-in. */
export function buildConfirmEmail(confirmUrl: string): { subject: string; html: string; text: string } {
  const subject = "Confirm your The Wider Lens newsletter subscription";
  const html = `<!doctype html>
<html><body style="margin:0;padding:0;background:#f4f4f5;">
<div style="max-width:600px;margin:0 auto;padding:32px 20px;font-family:ui-sans-serif,system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;color:#18181b;">
  <p style="margin:0 0 4px 0;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#7c3aed;">The Wider Lens · Weekly Brief</p>
  <h1 style="margin:0 0 12px 0;font-size:24px;">One more step</h1>
  <p style="margin:0 0 20px 0;font-size:15px;line-height:1.6;color:#52525b;">Click below to confirm your subscription to The Wider Lens weekly newsletter — the week's biggest AI stories, every Monday morning.</p>
  <a href="${esc(confirmUrl)}" style="display:inline-block;padding:12px 28px;background:#18181b;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;border-radius:10px;">Confirm subscription</a>
  <p style="margin:20px 0 0 0;font-size:12px;color:#71717a;">If you didn't request this, just ignore this email.</p>
</div>
</body></html>`;
  const text = `Confirm your The Wider Lens newsletter subscription:\n\n${confirmUrl}\n\nIf you didn't request this, just ignore this email.`;
  return { subject, html, text };
}

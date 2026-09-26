// Contact form endpoint. Validates input, drops bot submissions via a
// honeypot, and forwards the message to the owner's inbox through Resend.
// The recipient address lives only here, server-side — it never appears
// in client code or rendered HTML (spam bots harvest printed addresses).

import { NextResponse } from "next/server";
import { getResend, isValidEmail } from "@/lib/newsletter";

// NOTE: news.thewiderlens.info is still pending Resend domain verification,
// so the from-address below uses the verified news.hackzgaming.com domain.
// Once news.thewiderlens.info verifies, switch CONTACT_FROM to
// "The Wider Lens <contact@news.thewiderlens.info>".
const CONTACT_FROM = "The Wider Lens <contact@news.hackzgaming.com>";
const OWNER_INBOX = "news@thewiderlens.info";

const MAX_NAME = 80;
const MAX_SUBJECT = 120;
const MAX_MESSAGE = 5000;

// Best-effort per-instance throttle (serverless instances don't share
// memory, so this only blunts the simplest abuse).
const hits = new Map<string, number[]>();
function throttled(ip: string): boolean {
  const now = Date.now();
  const arr = (hits.get(ip) ?? []).filter((t) => now - t < 10 * 60_000);
  arr.push(now);
  hits.set(ip, arr);
  if (hits.size > 5000) hits.clear();
  return arr.length > 5;
}

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function POST(req: Request) {
  let resend;
  try {
    resend = getResend();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Contact form is not configured yet." },
      { status: 503 },
    );
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (throttled(ip)) {
    return NextResponse.json(
      { ok: false, error: "Too many messages. Please try again later." },
      { status: 429 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid request." },
      { status: 400 },
    );
  }

  // Honeypot: bots fill it, humans don't. Silently accept so bots learn nothing.
  if (typeof body.website === "string" && body.website.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim().toLowerCase();
  const subject = String(body.subject ?? "").trim();
  const message = String(body.message ?? "").trim();

  if (name.length < 1 || name.length > MAX_NAME) {
    return NextResponse.json(
      { ok: false, error: "Please enter your name." },
      { status: 400 },
    );
  }
  if (!isValidEmail(email)) {
    return NextResponse.json(
      { ok: false, error: "Please enter a valid email address." },
      { status: 400 },
    );
  }
  if (subject.length > MAX_SUBJECT) {
    return NextResponse.json(
      { ok: false, error: "Subject is too long." },
      { status: 400 },
    );
  }
  if (message.length < 1 || message.length > MAX_MESSAGE) {
    return NextResponse.json(
      { ok: false, error: "Please enter a message (up to 5000 characters)." },
      { status: 400 },
    );
  }

  const subjectLine = `[Contact] ${subject || "Website message"} — ${name}`;
  const text = `Name: ${name}\nEmail: ${email}\n\n${message}`;
  const html = `<p><strong>Name:</strong> ${esc(name)}<br/><strong>Email:</strong> ${esc(email)}</p><p>${esc(message).replace(/\n/g, "<br/>")}</p>`;

  const { error } = await resend.emails.send({
    from: CONTACT_FROM,
    to: OWNER_INBOX,
    replyTo: email,
    subject: subjectLine,
    text,
    html,
  });

  if (error) {
    return NextResponse.json(
      { ok: false, error: "Couldn't send your message. Please try again." },
      { status: 502 },
    );
  }
  return NextResponse.json({ ok: true });
}

export async function GET() {
  return NextResponse.json(
    { ok: false, error: "Method not allowed." },
    { status: 405 },
  );
}

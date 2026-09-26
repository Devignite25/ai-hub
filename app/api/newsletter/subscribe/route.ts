// Newsletter signup with double opt-in. No database: the pending
// contact is created in Resend as unsubscribed, and the confirmation
// link carries a signed token with the contact id.

import { NextResponse } from "next/server";
import {
  getResend,
  isValidEmail,
  signToken,
  buildConfirmEmail,
  NEWSLETTER_FROM,
  SITE_URL,
} from "@/lib/newsletter";

// Best-effort per-instance throttle (serverless instances don't share
// memory, so this only blunts the simplest abuse).
const hits = new Map<string, number[]>();
function throttled(ip: string): boolean {
  const now = Date.now();
  const arr = (hits.get(ip) ?? []).filter((t) => now - t < 60_000);
  arr.push(now);
  hits.set(ip, arr);
  if (hits.size > 5000) hits.clear();
  return arr.length > 10;
}

export async function POST(req: Request) {
  let resend;
  try {
    resend = getResend();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Newsletter signup is not configured yet." },
      { status: 503 },
    );
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (throttled(ip)) {
    return NextResponse.json(
      { ok: false, error: "Too many requests. Try again in a minute." },
      { status: 429 },
    );
  }

  let email = "";
  try {
    email = String((await req.json()).email ?? "").trim().toLowerCase();
  } catch {
    /* fall through to invalid */
  }
  if (!isValidEmail(email)) {
    return NextResponse.json(
      { ok: false, error: "Please enter a valid email address." },
      { status: 400 },
    );
  }

  // Create as unsubscribed — the confirmation click flips it on.
  const { data, error } = await resend.contacts.create({
    email,
    unsubscribed: true,
  });

  if (error) {
    const msg = String((error as { message?: string }).message ?? "");
    const code = (error as { statusCode?: number }).statusCode;
    if (code === 409 || /already exists/i.test(msg)) {
      // The contact exists. If they're stuck waiting on a lost confirmation
      // email, re-send it with a fresh token instead of stranding them.
      try {
        const { data: contact } = await resend.contacts.get(email);
        const contactId = (contact as { id?: string } | null)?.id;
        const subscribed =
          (contact as { unsubscribed?: boolean } | null)?.unsubscribed === false;
        if (subscribed) {
          return NextResponse.json({
            ok: true,
            already: true,
            message: "You're already subscribed — see you Monday.",
          });
        }
        if (contactId) {
          const token = signToken({ c: contactId });
          const confirmUrl = `${SITE_URL}/api/newsletter/confirm?token=${token}`;
          const mail = buildConfirmEmail(confirmUrl);
          const { error: resendError } = await resend.emails.send({
            from: NEWSLETTER_FROM,
            to: email,
            subject: mail.subject,
            html: mail.html,
            text: mail.text,
          });
          if (!resendError) {
            return NextResponse.json({
              ok: true,
              already: true,
              resent: true,
              message:
                "You're already on the list — we've re-sent the confirmation email. Check your inbox.",
            });
          }
        }
      } catch {
        /* fall through to the generic message */
      }
      return NextResponse.json({
        ok: true,
        already: true,
        message:
          "This email is already on the list — check your inbox for the confirmation email.",
      });
    }
    console.error(`[newsletter] contacts.create failed: ${msg}`);
    return NextResponse.json(
      { ok: false, error: "Something went wrong. Please try again later." },
      { status: 500 },
    );
  }

  const token = signToken({ c: data!.id });
  const confirmUrl = `${SITE_URL}/api/newsletter/confirm?token=${token}`;
  const mail = buildConfirmEmail(confirmUrl);
  const { error: sendError } = await resend.emails.send({
    from: NEWSLETTER_FROM,
    to: email,
    subject: mail.subject,
    html: mail.html,
    text: mail.text,
  });
  if (sendError) {
    console.error(
      `[newsletter] confirm email failed: ${String((sendError as { message?: string }).message ?? sendError)}`,
    );
    return NextResponse.json(
      {
        ok: false,
        error:
          "We saved your signup but couldn't send the confirmation email. Please try again later.",
      },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}

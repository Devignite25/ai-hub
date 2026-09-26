// Weekly newsletter cron: builds the week's top verified stories into
// a Resend broadcast. Runs every Monday morning via Vercel Cron.
//
// Safety: broadcasts are created as DRAFTS by default (NEWSLETTER_AUTO_SEND
// is unset) — a human reviews and clicks Send in the Resend dashboard.
// Set NEWSLETTER_AUTO_SEND=true to send automatically. The owner always
// gets a status email either way.

import { NextResponse } from "next/server";
import { getStoriesForDays } from "@/lib/data";
import {
  getResend,
  buildDigest,
  NEWSLETTER_FROM,
  OWNER_EMAIL,
} from "@/lib/newsletter";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const STORY_COUNT = 8;

async function notifyOwner(subject: string, text: string) {
  if (!OWNER_EMAIL) {
    console.log(`[newsletter] owner notify skipped (no NEWSLETTER_OWNER_EMAIL): ${subject}`);
    return;
  }
  try {
    await getResend().emails.send({
      from: NEWSLETTER_FROM,
      to: OWNER_EMAIL,
      subject: `[AI Hub newsletter] ${subject}`,
      text,
    });
  } catch (e) {
    console.error(`[newsletter] owner notify failed: ${String(e)}`);
  }
}

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let resend;
  try {
    resend = getResend();
  } catch {
    return NextResponse.json(
      { error: "RESEND_API_KEY is not configured" },
      { status: 503 },
    );
  }

  const segmentId = process.env.RESEND_NEWSLETTER_SEGMENT_ID;
  if (!segmentId) {
    return NextResponse.json(
      { error: "RESEND_NEWSLETTER_SEGMENT_ID is not configured" },
      { status: 503 },
    );
  }

  const stories = (await getStoriesForDays(7))
    .filter((s) => s.sources.length >= 2)
    .slice(0, STORY_COUNT);

  if (stories.length === 0) {
    await notifyOwner(
      "skipped — no qualified stories this week",
      "The weekly cron ran but found no stories verified by 2+ outlets in the last 7 days. No broadcast was created.",
    );
    return NextResponse.json({ ok: true, skipped: true });
  }

  const digest = buildDigest(stories);
  const autoSend = process.env.NEWSLETTER_AUTO_SEND === "true";

  const base = {
    segmentId,
    from: NEWSLETTER_FROM,
    subject: digest.subject,
    html: digest.html,
    text: digest.text,
    name: `Weekly Brief — ${digest.weekLabel}`,
  };
  // NOTE: the SDK types `send` as `true` or omits it (draft) — no boolean.
  const { data, error } = autoSend
    ? await resend.broadcasts.create({ ...base, send: true })
    : await resend.broadcasts.create(base);

  if (error || !data) {
    const msg = String((error as { message?: string })?.message ?? error ?? "unknown");
    console.error(`[newsletter] broadcast.create failed: ${msg}`);
    await notifyOwner("broadcast FAILED", `The weekly broadcast failed to create:\n\n${msg}`);
    return NextResponse.json({ error: "broadcast creation failed" }, { status: 500 });
  }

  if (autoSend) {
    await notifyOwner(
      `sent to subscribers (${digest.storyCount} stories)`,
      `Subject: ${digest.subject}\nBroadcast id: ${data.id}\n\nTop story: ${stories[0].primary.title}`,
    );
  } else {
    await notifyOwner(
      "draft ready for review",
      `This week's broadcast is saved as a DRAFT (not sent).\n\nSubject: ${digest.subject}\nBroadcast id: ${data.id}\nStories: ${digest.storyCount}\n\nReview and send it in the Resend dashboard: https://resend.com/broadcasts\n\nTo send automatically in the future, set NEWSLETTER_AUTO_SEND=true.`,
    );
  }

  return NextResponse.json({ ok: true, broadcastId: data.id, draft: !autoSend });
}

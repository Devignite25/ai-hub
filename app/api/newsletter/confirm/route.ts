// Double opt-in confirmation: verifies the signed token, flips the
// Resend contact to subscribed, redirects to a friendly page.

import { NextResponse } from "next/server";
import { getResend, verifyToken } from "@/lib/newsletter";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const ok = (params = "") =>
    NextResponse.redirect(new URL(`/newsletter/confirmed${params}`, url));

  const token = url.searchParams.get("token") ?? "";
  const body = verifyToken(token);
  const contactId = body?.c;
  if (typeof contactId !== "string" || !contactId) {
    return ok("?error=invalid");
  }

  try {
    const resend = getResend();
    const { error } = await resend.contacts.update({
      id: contactId,
      unsubscribed: false,
    });
    if (error) throw new Error(String((error as { message?: string }).message ?? error));
  } catch (e) {
    console.error(`[newsletter] confirm failed: ${String(e)}`);
    return ok("?error=failed");
  }

  return ok();
}

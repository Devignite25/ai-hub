import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy",
  description: "The Wider Lens privacy policy: no accounts, no tracking; the optional weekly newsletter stores only your email with our email provider.",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-black tracking-tight">Privacy</h1>
      <div className="mt-4 space-y-4 leading-relaxed text-zinc-700 dark:text-zinc-300">
        <p>
          The Wider Lens collects no personal data by default. There are no accounts, no comments, no
          bookmarks, and no analytics beacons in the application code.
        </p>
        <p>
          <strong>Weekly newsletter (optional).</strong> If you subscribe, your email address is
          stored by our email provider (Resend) for the sole purpose of sending the newsletter.
          Subscription uses double opt-in: you must click the confirmation link in the email we
          send you before you receive anything. Every issue includes a one-click unsubscribe
          link. Your address is never sold or shared.
        </p>
        <p>
          Your theme preference (light/dark) is stored only in your own browser&apos;s local storage
          and is never sent anywhere. Search queries are URL parameters processed on the server to
          render results; they are not stored.
        </p>
        <p>
          Outbound links open original publishers (news sites, arXiv, GitHub, Hugging Face) in a new
          tab — those sites have their own privacy policies. If you deploy The Wider Lens with a hosting
          provider such as Vercel, that provider&apos;s standard request logging applies.
        </p>
      </div>
    </div>
  );
}

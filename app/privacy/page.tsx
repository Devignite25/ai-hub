import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy",
  description: "AI Hub privacy policy: no accounts, no tracking, no personal data collection.",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-black tracking-tight">Privacy</h1>
      <div className="mt-4 space-y-4 leading-relaxed text-zinc-700 dark:text-zinc-300">
        <p>
          AI Hub collects no personal data. There are no accounts, no comments, no bookmarks, no
          newsletters, and no analytics beacons in the application code.
        </p>
        <p>
          Your theme preference (light/dark) is stored only in your own browser&apos;s local storage
          and is never sent anywhere. Search queries are URL parameters processed on the server to
          render results; they are not stored.
        </p>
        <p>
          Outbound links open original publishers (news sites, arXiv, GitHub, Hugging Face) in a new
          tab — those sites have their own privacy policies. If you deploy AI Hub with a hosting
          provider such as Vercel, that provider&apos;s standard request logging applies.
        </p>
      </div>
    </div>
  );
}

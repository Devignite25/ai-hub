import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Subscription confirmed",
  description: "Your AI Hub weekly newsletter subscription is confirmed.",
  robots: { index: false, follow: false },
};

export default function ConfirmedPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const failed = searchParams.error === "failed";
  const invalid = searchParams.error === "invalid";
  return (
    <div className="mx-auto max-w-xl py-16 text-center">
      {failed || invalid ? (
        <>
          <h1 className="text-3xl font-black tracking-tight">
            {invalid ? "Link expired or invalid" : "Something went wrong"}
          </h1>
          <p className="mt-4 leading-relaxed text-zinc-600 dark:text-zinc-400">
            {invalid
              ? "This confirmation link is invalid or has expired. Please subscribe again and use the newest email we sent you."
              : "We couldn't confirm your subscription just now. Please try the link again, or subscribe once more."}
          </p>
          <Link
            href="/"
            className="mt-6 inline-block rounded-xl bg-zinc-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Back to AI Hub
          </Link>
        </>
      ) : (
        <>
          <h1 className="text-3xl font-black tracking-tight">You&apos;re in!</h1>
          <p className="mt-4 leading-relaxed text-zinc-600 dark:text-zinc-400">
            Your subscription is confirmed. Every Monday morning you&apos;ll get
            the week&apos;s biggest AI stories — verified by at least two
            independent outlets, summarized in minutes.
          </p>
          <Link
            href="/latest"
            className="mt-6 inline-block rounded-xl bg-zinc-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Catch up on the latest
          </Link>
        </>
      )}
    </div>
  );
}

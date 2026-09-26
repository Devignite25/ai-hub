"use client";

import { useState } from "react";

type Status = "idle" | "sending" | "done" | "already" | "error";

export function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "sending") return;
    setStatus("sending");
    setMessage("");
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const body = await res.json();
      if (body.ok) {
        setStatus(body.already ? "already" : "done");
        // Tell the newsletter popup never to show again for this browser.
        try {
          localStorage.setItem("aihub-newsletter-subscribed", "1");
        } catch {
          /* ignore */
        }
        setMessage(
          body.already
            ? body.message
            : "You're almost in — check your inbox and click the confirmation link.",
        );
      } else {
        setStatus("error");
        setMessage(body.error ?? "Something went wrong. Please try again.");
      }
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    }
  }

  if (status === "done" || status === "already") {
    return (
      <p className="max-w-sm text-sm font-medium text-emerald-700 dark:text-emerald-400">
        {message}
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="w-full max-w-sm">
      <div className="flex gap-2">
        <label htmlFor="newsletter-email" className="sr-only">
          Email address
        </label>
        <input
          id="newsletter-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          disabled={status === "sending"}
          className="min-w-0 flex-1 rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-violet-500 focus:outline-none disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        />
        <button
          type="submit"
          disabled={status === "sending"}
          className="shrink-0 rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-700 disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {status === "sending" ? "…" : "Subscribe"}
        </button>
      </div>
      {status === "error" && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{message}</p>
      )}
      <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-500">
        One email a week. Unsubscribe anytime.
      </p>
    </form>
  );
}

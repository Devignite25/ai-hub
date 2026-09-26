"use client";

import { useEffect, useRef, useState } from "react";

const DISMISSED_KEY = "thewiderlens-newsletter-popup-dismissed";
const SUBSCRIBED_KEY = "thewiderlens-newsletter-subscribed";
const SUPPRESS_DAYS = 14;
const DWELL_DELAY_MS = 40000; // 40s dwell before showing (when no exit intent)
const RETRY_DELAY_MS = 15000; // wait this long if another popup is open
const MAX_RETRIES = 3;

type Status = "idle" | "sending" | "done" | "error";

function wasRecentlyDismissed(): boolean {
  try {
    const raw = localStorage.getItem(DISMISSED_KEY);
    if (!raw) return false;
    return Date.now() - Number(raw) < SUPPRESS_DAYS * 24 * 3600 * 1000;
  } catch {
    return false;
  }
}

function markDismissed() {
  try {
    localStorage.setItem(DISMISSED_KEY, String(Date.now()));
  } catch {
    /* storage unavailable — popup may show again next visit */
  }
}

function isSubscribed(): boolean {
  try {
    return localStorage.getItem(SUBSCRIBED_KEY) === "1";
  } catch {
    return false;
  }
}

function markSubscribed() {
  try {
    localStorage.setItem(SUBSCRIBED_KEY, "1");
  } catch {
    /* ignore */
  }
}

/** True while another popup (e.g. the affiliate one) is on screen. */
function anotherPopupOpen(): boolean {
  return Boolean(document.body.dataset.thewiderlensPopup);
}

export function NewsletterPopup() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const firedRef = useRef(false);
  const retriesRef = useRef(0);

  useEffect(() => {
    // Never bother someone who subscribed, recently dismissed, or just confirmed.
    if (isSubscribed() || wasRecentlyDismissed()) return;
    if (window.location.pathname.startsWith("/newsletter")) return;

    const tryOpen = () => {
      if (firedRef.current) return;
      if (anotherPopupOpen()) {
        // Don't stack popups — try again shortly, then give up for this session.
        if (retriesRef.current < MAX_RETRIES) {
          retriesRef.current += 1;
          setTimeout(tryOpen, RETRY_DELAY_MS);
        }
        return;
      }
      firedRef.current = true;
      setOpen(true);
    };

    const dwellTimer = setTimeout(tryOpen, DWELL_DELAY_MS);

    // Desktop exit intent: mouse heading for the tab bar / back button.
    const onMouseOut = (e: MouseEvent) => {
      if (e.relatedTarget !== null) return;
      if (e.clientY > 0) return;
      if (!window.matchMedia("(pointer: fine)").matches) return;
      tryOpen();
    };
    document.addEventListener("mouseout", onMouseOut);

    return () => {
      clearTimeout(dwellTimer);
      document.removeEventListener("mouseout", onMouseOut);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    document.body.dataset.thewiderlensPopup = "open";
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      delete document.body.dataset.thewiderlensPopup;
      document.body.style.overflow = prev;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open ]);

  if (!open) return null;

  const close = () => {
    markDismissed();
    setOpen(false);
  };

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
        markSubscribed();
        setStatus("done");
        setMessage(
          body.already
            ? String(body.message ?? "You're already subscribed.")
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Subscribe to The Wider Lens newsletter"
    >
      <button
        aria-label="Dismiss"
        onClick={close}
        className="absolute inset-0 cursor-default bg-black/60 backdrop-blur-[2px]"
      />
      <div className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
        <div className="h-1.5 bg-gradient-to-r from-sky-500 via-violet-500 to-fuchsia-500" />
        <button
          onClick={close}
          aria-label="Close popup"
          className="absolute right-3 top-4 rounded-full p-1.5 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
        <div className="px-6 pb-5 pt-5">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-violet-600 dark:text-violet-400">
            The Wider Lens Newsletter
          </p>
          <h2 className="mt-2 text-xl font-bold leading-snug text-zinc-900 dark:text-zinc-50">
            The week's verified AI news, in one email
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            Every Monday: the top AI stories, each confirmed by two or more
            outlets. No hype, no spin. Free.
          </p>
          {status === "done" ? (
            <p className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              {message}
            </p>
          ) : (
            <form onSubmit={submit} className="mt-4">
              <label htmlFor="newsletter-popup-email" className="sr-only">
                Email address
              </label>
              <input
                id="newsletter-popup-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                disabled={status === "sending"}
                autoFocus
                className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-violet-500 focus:outline-none disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
              <button
                type="submit"
                disabled={status === "sending"}
                className="mt-2 w-full rounded-xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-zinc-700 disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                {status === "sending" ? "Subscribing…" : "Subscribe"}
              </button>
              {status === "error" && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">{message}</p>
              )}
            </form>
          )}
          <p className="mt-3 text-center text-[11px] text-zinc-400 dark:text-zinc-500">
            One email a week. Unsubscribe anytime.
          </p>
        </div>
      </div>
    </div>
  );
}

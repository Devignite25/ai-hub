"use client";

import { useEffect, useState } from "react";

const AFFILIATE_URL = "https://try.elevenlabs.io/0108u1ziky63";
const STORAGE_KEY = "aihub-elevenlabs-popup-dismissed";
const SUPPRESS_DAYS = 7;
const SHOW_CHANCE = 0.65; // 65% of sessions see the popup
const MIN_DELAY_MS = 8000;
const MAX_DELAY_MS = 22000;

type Variant = {
  eyebrow: string;
  headline: string;
  body: string;
  cta: string;
};

const VARIANTS: Variant[] = [
  {
    eyebrow: "For creators",
    headline: "Give your videos a voice",
    body: "ElevenLabs turns any script into natural, studio-quality narration — 32 languages, rendered in seconds. Free to try.",
    cta: "Try ElevenLabs free",
  },
  {
    eyebrow: "AI tool pick",
    headline: "The AI voices behind viral explainers",
    body: "Wondered how creators make those lifelike AI voiceovers? This is the tool they reach for. Free to try.",
    cta: "Try ElevenLabs free",
  },
];

function wasRecentlyDismissed(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    return Date.now() - Number(raw) < SUPPRESS_DAYS * 24 * 3600 * 1000;
  } catch {
    return false;
  }
}

function markDismissed() {
  try {
    localStorage.setItem(STORAGE_KEY, String(Date.now()));
  } catch {
    /* storage unavailable — popup may show again next visit */
  }
}

export function AffiliatePopup() {
  const [open, setOpen] = useState(false);
  const [variant, setVariant] = useState<Variant>(VARIANTS[0]);

  useEffect(() => {
    if (wasRecentlyDismissed()) return;
    if (Math.random() > SHOW_CHANCE) return;
    const delay = MIN_DELAY_MS + Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS);
    const timer = setTimeout(() => {
      setVariant(VARIANTS[Math.floor(Math.random() * VARIANTS.length)]);
      setOpen(true);
    }, delay);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    // Signal to other popups (e.g. the newsletter one) that we're on screen
    // so they don't stack on top of each other.
    document.body.dataset.aihubPopup = "open";
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      delete document.body.dataset.aihubPopup;
      document.body.style.overflow = prev;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open ]);

  if (!open) return null;

  const close = () => {
    markDismissed();
    setOpen(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Sponsored: ElevenLabs"
    >
      <button
        aria-label="Dismiss"
        onClick={close}
        className="absolute inset-0 cursor-default bg-black/60 backdrop-blur-[2px]"
      />
      <div className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
        <div className="h-1.5 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-orange-400" />
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
          <p className="text-[11px] font-semibold uppercase tracking-widest text-fuchsia-600 dark:text-fuchsia-400">
            {variant.eyebrow}
          </p>
          <h2 className="mt-2 text-xl font-bold leading-snug text-zinc-900 dark:text-zinc-50">
            {variant.headline}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            {variant.body}
          </p>
          <a
            href={AFFILIATE_URL}
            target="_blank"
            rel="noopener noreferrer sponsored"
            onClick={markDismissed}
            className="mt-4 block rounded-xl bg-zinc-900 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {variant.cta}
          </a>
          <p className="mt-3 text-center text-[11px] text-zinc-400 dark:text-zinc-500">
            Sponsored — affiliate link, I may earn a commission at no cost to you.
          </p>
        </div>
      </div>
    </div>
  );
}

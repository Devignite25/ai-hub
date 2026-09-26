"use client";

// Footer "Contact" link + modal. Opens a contact form that POSTs to
// /api/contact. The owner's email address never appears in this file or
// in the rendered HTML — the server route knows the recipient.

import { useEffect, useState } from "react";

const SENT_KEY = "thewiderlens-contact-sent";
const COOLDOWN_MS = 60_000; // no resubmits for 60s after a send

type Status = "idle" | "sending" | "done" | "error";

function cooldownRemainingMs(): number {
  try {
    const raw = localStorage.getItem(SENT_KEY);
    if (!raw) return 0;
    return Math.max(0, COOLDOWN_MS - (Date.now() - Number(raw)));
  } catch {
    return 0;
  }
}

const inputCls =
  "w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-violet-500 focus:outline-none disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100";

const labelCls =
  "mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400";

export function ContactUsLink() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="hover:text-zinc-900 hover:underline dark:hover:text-white"
      >
        Contact
      </button>
      {open && <ContactModal onClose={() => setOpen(false)} />}
    </>
  );
}

function ContactModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [cooldownMs, setCooldownMs] = useState(0);

  useEffect(() => {
    setCooldownMs(cooldownRemainingMs());
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Tick the cooldown countdown once a second while it runs.
  useEffect(() => {
    if (cooldownMs <= 0) return;
    const t = setTimeout(() => setCooldownMs(cooldownRemainingMs()), 1000);
    return () => clearTimeout(t);
  }, [cooldownMs]);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "sending" || cooldownMs > 0) return;
    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!message.trim()) {
      setError("Please enter a message.");
      return;
    }
    if (message.length > 5000) {
      setError("Message is too long (5000 characters max).");
      return;
    }
    setStatus("sending");
    setError("");
    try {
      const honeypot =
        (new FormData(e.currentTarget).get("website") as string) ?? "";
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          subject: subject.trim(),
          message: message.trim(),
          website: honeypot,
        }),
      });
      const body = await res.json();
      if (body.ok) {
        try {
          localStorage.setItem(SENT_KEY, String(Date.now()));
        } catch {
          /* storage unavailable — cooldown just won't persist */
        }
        setStatus("done");
      } else {
        setStatus("error");
        setError(body.error ?? "Something went wrong. Please try again.");
      }
    } catch {
      setStatus("error");
      setError("Something went wrong. Please try again.");
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Contact The Wider Lens"
    >
      <button
        aria-label="Dismiss"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-black/60 backdrop-blur-[2px]"
      />
      <div className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
        <div className="h-1.5 bg-gradient-to-r from-sky-500 via-violet-500 to-fuchsia-500" />
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-4 rounded-full p-1.5 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
        <div className="px-6 pb-6 pt-5">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-violet-600 dark:text-violet-400">
            Contact
          </p>
          <h2 className="mt-2 text-xl font-bold leading-snug text-zinc-900 dark:text-zinc-50">
            Write to us
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            News tip, correction, or feedback — we read everything.
          </p>
          {status === "done" ? (
            <p className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              Message sent. Thanks for writing in — we&apos;ll get back to you if needed.
            </p>
          ) : cooldownMs > 0 ? (
            <p className="mt-4 rounded-xl bg-zinc-100 px-4 py-3 text-sm text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
              You just sent a message — you can send another in{" "}
              {Math.ceil(cooldownMs / 1000)}s.
            </p>
          ) : (
            <form onSubmit={submit} className="mt-4 space-y-3">
              {/* Honeypot: invisible to humans; bots that fill it are ignored. */}
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="absolute h-px w-px overflow-hidden opacity-0"
              />
              <div>
                <label htmlFor="contact-name" className={labelCls}>
                  Name
                </label>
                <input
                  id="contact-name"
                  type="text"
                  required
                  maxLength={80}
                  value={name}
                  onChange={(ev) => setName(ev.target.value)}
                  placeholder="Your name"
                  disabled={status === "sending"}
                  autoFocus
                  className={inputCls}
                />
              </div>
              <div>
                <label htmlFor="contact-email" className={labelCls}>
                  Email
                </label>
                <input
                  id="contact-email"
                  type="email"
                  required
                  value={email}
                  onChange={(ev) => setEmail(ev.target.value)}
                  placeholder="you@example.com"
                  disabled={status === "sending"}
                  className={inputCls}
                />
              </div>
              <div>
                <label htmlFor="contact-subject" className={labelCls}>
                  Subject <span className="font-normal">(optional)</span>
                </label>
                <input
                  id="contact-subject"
                  type="text"
                  maxLength={120}
                  value={subject}
                  onChange={(ev) => setSubject(ev.target.value)}
                  placeholder="What's this about?"
                  disabled={status === "sending"}
                  className={inputCls}
                />
              </div>
              <div>
                <label htmlFor="contact-message" className={labelCls}>
                  Message
                </label>
                <textarea
                  id="contact-message"
                  required
                  rows={5}
                  maxLength={5000}
                  value={message}
                  onChange={(ev) => setMessage(ev.target.value)}
                  placeholder="Your message…"
                  disabled={status === "sending"}
                  className={inputCls}
                />
              </div>
              {error && (
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              )}
              <button
                type="submit"
                disabled={status === "sending"}
                className="w-full rounded-xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-zinc-700 disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                {status === "sending" ? "Sending…" : "Send message"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

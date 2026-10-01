/** A built-in card for our own app, Clara. Never interrupts; lives in the page like any other block. */
export function ClaraCard({ placement = "home" }: { placement?: string }) {
  const url = `https://clara.thewiderlens.info/beta?utm_source=thewiderlens&utm_medium=card&utm_content=${placement}`;
  return (
    <aside aria-label="Clara, from The Wider Lens" className="mt-6 overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-50">
      <div className="h-1 bg-gradient-to-r from-sky-400 via-violet-500 to-fuchsia-500" />
      <div className="p-4">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/clara-logo.png" alt="" width={40} height={40} className="h-10 w-10 rounded-lg" />
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-sky-400">From The Wider Lens</p>
            <p className="font-bold leading-tight">Clara</p>
          </div>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-zinc-400">
          A private AI assistant that runs on your own PC. Free and open source. Beta testers wanted for the Android app!
        </p>
        <a
          href={url}
          className="mt-3 block rounded-md bg-gradient-to-r from-sky-500 via-violet-500 to-fuchsia-500 px-3 py-2 text-center text-sm font-semibold text-white transition hover:opacity-90"
        >
          Join the beta
        </a>
      </div>
    </aside>
  );
}

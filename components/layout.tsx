import Link from "next/link";
import { CATEGORIES, type CategorySlug } from "@/lib/types";
import { COMPANIES } from "@/lib/companies";
import { NewsletterSignup } from "@/components/newsletter-signup";
import { ContactUsLink } from "@/components/contact-modal";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/90 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/90">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-bold tracking-tight">
          <img
            src="/logo.jpg"
            alt="The Wider Lens logo"
            className="h-8 w-8 rounded-full object-cover"
          />
          <span className="text-lg">The Wider Lens</span>
        </Link>
        <nav className="hidden items-center gap-1 text-sm lg:flex" aria-label="Primary">
          <NavLink href="/latest">Latest</NavLink>
          <NavLink href="/models">Models</NavLink>
          <NavLink href="/research">Research</NavLink>
          <NavLink href="/open-source">Open Source</NavLink>
          <NavLink href="/learn">Learn</NavLink>
          <NavLink href="/sources">Sources</NavLink>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/search"
            className="rounded-md border border-zinc-200 px-3 py-1.5 text-sm text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
          >
            Search
          </Link>
          <ThemeToggle />
        </div>
      </div>
      <div className="overflow-x-auto border-t border-zinc-100 dark:border-zinc-900 lg:hidden">
        <nav className="mx-auto flex max-w-7xl gap-1 px-4 py-2 text-sm" aria-label="Mobile">
          <NavLink href="/latest">Latest</NavLink>
          <NavLink href="/models">Models</NavLink>
          <NavLink href="/research">Research</NavLink>
          <NavLink href="/open-source">Open Source</NavLink>
          <NavLink href="/learn">Learn</NavLink>
        </nav>
      </div>
    </header>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="whitespace-nowrap rounded-md px-3 py-1.5 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white"
    >
      {children}
    </Link>
  );
}

export function Footer() {
  return (
    <footer className="mt-16 border-t border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="border-b border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 sm:px-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-bold">The Weekly Brief</p>
            <p className="mt-1 max-w-md text-sm text-zinc-600 dark:text-zinc-400">
              The week&apos;s biggest AI stories — verified, summarized, every Monday morning.
            </p>
          </div>
          <NewsletterSignup />
        </div>
      </div>
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-4 sm:px-6">
        <div>
          <p className="font-bold">The Wider Lens</p>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Real-time AI news, research, models, and open source — aggregated from public sources.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold">Sections</p>
          <ul className="mt-2 space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
            <li><FooterLink href="/latest">Latest</FooterLink></li>
            <li><FooterLink href="/models">Model Tracker</FooterLink></li>
            <li><FooterLink href="/research">Research</FooterLink></li>
            <li><FooterLink href="/open-source">Open Source</FooterLink></li>
            <li><FooterLink href="/learn">Learn AI</FooterLink></li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold">Categories</p>
          <ul className="mt-2 space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
            {CATEGORIES.slice(0, 5).map((c) => (
              <li key={c.slug}><FooterLink href={`/category/${c.slug}`}>{c.label}</FooterLink></li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold">About</p>
          <ul className="mt-2 space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
            <li><FooterLink href="/sources">Sources</FooterLink></li>
            <li><FooterLink href="/methodology">Methodology</FooterLink></li>
            <li><FooterLink href="/about">About</FooterLink></li>
            <li><FooterLink href="/toolkit">AI Toolkit</FooterLink></li>
            <li><ContactUsLink /></li>
            <li><FooterLink href="/privacy">Privacy</FooterLink></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-zinc-200 px-4 py-4 dark:border-zinc-800">
        <p className="mx-auto max-w-7xl text-xs text-zinc-500 dark:text-zinc-500">
          The Wider Lens aggregates headlines and excerpts and links to original publishers. All content belongs to its
          respective owners.
        </p>
      </div>
    </footer>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return <Link href={href} className="hover:text-zinc-900 hover:underline dark:hover:text-white">{children}</Link>;
}

export function ThemeToggle() {
  return (
    <button
      id="theme-toggle"
      type="button"
      aria-label="Toggle dark mode"
      className="rounded-md border border-zinc-200 p-1.5 text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
    >
      <svg className="hidden h-4 w-4 dark:block" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </svg>
      <svg className="h-4 w-4 dark:hidden" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
      </svg>
    </button>
  );
}

export function CategoryChips() {
  return (
    <div className="flex flex-wrap gap-2">
      {CATEGORIES.map((c) => (
        <Link
          key={c.slug}
          href={`/category/${c.slug}`}
          className="rounded-full border border-zinc-200 px-3 py-1 text-xs font-medium text-zinc-600 hover:border-zinc-400 hover:text-zinc-900 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-zinc-500 dark:hover:text-white"
        >
          {c.label}
        </Link>
      ))}
    </div>
  );
}

export function CompanyChips() {
  return (
    <div className="flex flex-wrap gap-2">
      {COMPANIES.map((c) => (
        <Link
          key={c.slug}
          href={`/companies/${c.slug}`}
          className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
        >
          {c.name}
        </Link>
      ))}
    </div>
  );
}

export function categoryLabel(slug: CategorySlug): string {
  return CATEGORIES.find((c) => c.slug === slug)?.label ?? slug;
}

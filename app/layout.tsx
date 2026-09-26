import type { Metadata } from "next";
import "./globals.css";
import { Header, Footer } from "@/components/layout";
import { AffiliatePopup } from "@/components/affiliate-popup";
import { NewsletterPopup } from "@/components/newsletter-popup";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://thewiderlens.info";
const SITE_NAME = "The Wider Lens";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Real-Time AI News, Research & Discovery`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "The Wider Lens is a real-time hub for AI news, model releases, research papers, open-source projects, tools, and learning resources — aggregated from public sources.",
  keywords: ["AI news", "artificial intelligence", "AI models", "machine learning", "AI research", "open source AI"],
  authors: [{ name: SITE_NAME }],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Real-Time AI News, Research & Discovery`,
    description:
      "Follow AI news, model releases, research, open source, and tools — all in one place.",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Real-Time AI News, Research & Discovery`,
    description: "Follow AI news, model releases, research, open source, and tools — all in one place.",
  },
  robots: { index: true, follow: true },
};

// Runs before paint: applies saved theme (or OS preference) to avoid a flash.
const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem('thewiderlens-theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark');}}catch(e){}})();`;

// Minimal progressive enhancement: theme toggle + "View N sources" expanders.
const UI_SCRIPT = `(function(){
document.addEventListener('click',function(e){
var t=e.target.closest('#theme-toggle');
if(t){var d=document.documentElement.classList.toggle('dark');try{localStorage.setItem('thewiderlens-theme',d?'dark':'light');}catch(x){}return;}
var x=e.target.closest('[data-toggle]');
if(x){var el=document.getElementById(x.getAttribute('data-toggle'));if(el){el.classList.toggle('hidden');}return;}
});
})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="flex min-h-screen flex-col bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
        <Header />
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">{children}</main>
        <Footer />
        <AffiliatePopup />
        <NewsletterPopup />
        <script dangerouslySetInnerHTML={{ __html: UI_SCRIPT }} />
      </body>
    </html>
  );
}

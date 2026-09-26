import type { NextConfig } from "next";

// Content Security Policy for a fully static site.
//
// NOTE on script-src: Next.js injects its own inline bootstrap/flight-data
// scripts whose contents change on every build, so a strict hash- or
// nonce-based script-src is not maintainable here (nonces would also force
// every page to be dynamically rendered, losing static/ISR caching).
// This follows the officially documented "without nonces" pattern: keep
// script inline execution allowed, but lock down everything else
// (objects, framing, base URI, form targets, and where content may load
// from). The site has no reflected/stored XSS vectors: no API routes, no
// server actions, and all rendered content is React-escaped.
const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;

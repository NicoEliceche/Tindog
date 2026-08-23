/** @type {import('next').NextConfig} */
const isGitHubPages = process.env.NEXT_PUBLIC_DEPLOY_TARGET === 'github-pages';
const isDevelopment = process.env.NODE_ENV !== 'production';
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? (isGitHubPages ? '/Tindog' : '');
const scriptSources = [
  "'self'",
  "'unsafe-inline'",
  ...(isDevelopment ? ["'unsafe-eval'"] : []),
  'https://accounts.google.com',
].join(' ');

const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  `script-src ${scriptSources}`,
  "style-src 'self' 'unsafe-inline' https://accounts.google.com",
  "img-src 'self' data: blob: https://images.unsplash.com https://lh3.googleusercontent.com",
  // Los videos de las mascotas se sirven desde el propio sitio. Sin esta
  // linea caian en default-src y el reproductor quedaba en negro.
  "media-src 'self' blob:",
  "font-src 'self' data:",
  "connect-src 'self' https://accounts.google.com https://*.onrender.com",
  "frame-src https://accounts.google.com https://www.google.com",
  "upgrade-insecure-requests",
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: contentSecurityPolicy },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' },
  { key: 'Permissions-Policy', value: 'camera=(self), geolocation=(self), microphone=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
];

const nextConfig = {
  compiler: {
    styledComponents: true,
  },
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  ...(isGitHubPages
    ? {
        output: 'export',
        basePath,
        assetPrefix: `${basePath}/`,
        trailingSlash: true,
        images: {
          unoptimized: true,
        },
      }
    : {
        async headers() {
          return [{ source: '/(.*)', headers: securityHeaders }];
        },
      }),
};

export default nextConfig;

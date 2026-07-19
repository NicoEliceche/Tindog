/** @type {import('next').NextConfig} */
const isGitHubPages = process.env.NEXT_PUBLIC_DEPLOY_TARGET === 'github-pages';
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? (isGitHubPages ? '/Tindog' : '');

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
    : {}),
};

export default nextConfig;

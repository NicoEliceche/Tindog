export function isGitHubPagesStaticBuild(): boolean {
  return process.env.NEXT_PUBLIC_DEPLOY_TARGET === 'github-pages';
}

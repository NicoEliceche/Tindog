export class GoogleSignInFailure extends Error {
  constructor(
    message: string,
    readonly code:
      | 'cancelled'
      | 'configuration'
      | 'development-build-required'
      | 'in-progress'
      | 'play-services'
      | 'unknown',
  ) {
    super(message);
    this.name = 'GoogleSignInFailure';
  }
}

export function getGoogleSignInConfigurationError(): string | null {
  return 'El acceso web se realiza desde la aplicación web de Tindog.';
}

export async function signInWithGoogle(): Promise<string | null> {
  throw new GoogleSignInFailure(
    'El acceso web se realiza desde la aplicación web de Tindog.',
    'configuration',
  );
}

export async function signOutFromGoogle(): Promise<void> {}

// Expo Web uses the backend's HttpOnly session cookie. JavaScript never receives
// or persists bearer credentials in browser storage.
export async function getStoredAuthToken(): Promise<string | null> { return null; }
export async function storeAuthToken(_token: string): Promise<void> { return; }
export async function clearStoredAuthToken(): Promise<void> { return; }

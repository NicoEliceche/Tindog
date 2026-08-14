export async function requestPushPermission(): Promise<boolean> {
  if (!('Notification' in globalThis)) return false;
  return (await globalThis.Notification.requestPermission()) === 'granted';
}

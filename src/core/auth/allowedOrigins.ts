/**
 * Orígenes autorizados para las peticiones de autenticación.
 *
 * Vive en `core` y no junto a las rutas de la API porque `requestAuth` lo
 * necesita, y el build estático del sitio aparta el directorio de rutas: si
 * la función quedara ahí, ese build fallaría al resolver el import.
 */
export function getAllowedAuthOrigins(): string[] {
  return [
    process.env.CORS_ORIGIN,
    process.env.NEXT_PUBLIC_WEB_ORIGIN,
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://nicoeliceche.github.io',
  ]
    .flatMap((value) => value?.split(',') ?? [])
    .map((value) => value.trim())
    .filter(Boolean);
}

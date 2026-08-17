#!/usr/bin/env node
/**
 * Build del sitio estático para GitHub Pages.
 *
 * `output: 'export'` genera archivos sin servidor, así que no puede incluir
 * las rutas de `src/app/api`: son código que corre por petición y varias
 * usan segmentos dinámicos que el export exige resolver de antemano.
 *
 * Esas rutas viven en el backend de Render, que el sitio estático consume
 * vía `NEXT_PUBLIC_API_BASE_URL`. Acá se apartan del árbol de páginas
 * mientras dura el build y se devuelven al terminar, pase lo que pase.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, renameSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const apiDir = join(root, 'src', 'app', 'api');
/** Fuera de `src/app` para que Next no lo mire, y con punto para ignorarlo. */
const parkedDir = join(root, '.api-durante-export');

if (existsSync(parkedDir)) {
  console.error(
    `Existe ${parkedDir}, probablemente de un build interrumpido.\n` +
    'Revisá su contenido y movelo de vuelta a src/app/api antes de seguir.',
  );
  process.exit(1);
}

const hasApi = existsSync(apiDir);
if (hasApi) renameSync(apiDir, parkedDir);

// Los tipos que Next genera por ruta quedan del build anterior y apuntan a
// las rutas apartadas, así que el chequeo de tipos falla buscándolas.
rmSync(join(root, '.next', 'types'), { recursive: true, force: true });
rmSync(join(root, '.next', 'dev', 'types'), { recursive: true, force: true });

try {
  execFileSync('npx', ['next', 'build'], {
    cwd: root,
    stdio: 'inherit',
    shell: process.platform === 'win32',
    env: { ...process.env, NEXT_PUBLIC_DEPLOY_TARGET: 'github-pages' },
  });
} finally {
  // El restore va en `finally`: si el build falla, dejar el proyecto sin
  // sus rutas API sería mucho peor que el error original.
  if (hasApi && existsSync(parkedDir)) renameSync(parkedDir, apiDir);
}

#!/usr/bin/env node
/**
 * Genera los secretos propios de Tindog con el formato que exige
 * `src/core/security/readiness.ts`.
 *
 * Los valores se crean en tu máquina y se imprimen sólo en tu terminal: no
 * viajan a ningún lado. Copiá el resultado a tu `.env` local y al panel de
 * Render.
 *
 *   node scripts/generar-secretos.mjs           # imprime en pantalla
 *   node scripts/generar-secretos.mjs --env     # formato para pegar en .env
 *   node scripts/generar-secretos.mjs --render  # una por línea, para Render
 *
 * No guarda nada en disco a propósito: un archivo con secretos es fácil de
 * commitear sin querer.
 */
import { randomBytes } from 'node:crypto';

/**
 * Cuatro claves de propósito general. La verificación las rechaza si miden
 * menos de 32 bytes, así que se generan holgadamente por encima.
 */
const GENERAL = [
  ['JWT_SECRET', 'Firma de las sesiones'],
  ['AUDIT_HASH_SECRET', 'Encadenado del registro de auditoría'],
  ['WORKER_SECRET', 'Autenticación de los procesos internos'],
  ['ADMIN_API_ACCESS_KEY', 'Acceso a las rutas de administración'],
];

const secrets = GENERAL.map(([name, purpose]) => [
  name,
  randomBytes(48).toString('base64url'),
  purpose,
]);

/**
 * Esta va aparte: tiene que medir exactamente 32 bytes al decodificar, o
 * la verificación la marca como inválida aunque esté presente.
 */
secrets.push([
  'MODERATION_EVIDENCE_KEY',
  randomBytes(32).toString('base64'),
  'Cifrado de la evidencia de moderación (32 bytes exactos)',
]);

const mode = process.argv[2];

if (mode === '--env' || mode === '--render') {
  for (const [name, value] of secrets) {
    console.log(`${name}=${value}`);
  }
} else {
  console.log('\nSecretos generados. Copiálos a tu .env y al panel de Render.\n');
  for (const [name, value, purpose] of secrets) {
    console.log(`  ${name}`);
    console.log(`  ${purpose}`);
    console.log(`  ${value}\n`);
  }
  console.log('Estos valores no se guardaron en ningún archivo.');
  console.log('Si perdés uno, volvé a generarlo: cambiar JWT_SECRET cierra');
  console.log('todas las sesiones abiertas, nada más.\n');
  console.log('Para pegar directo en un archivo .env:');
  console.log('  node scripts/generar-secretos.mjs --env\n');
}

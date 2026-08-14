const baseUrl = process.env.TINDOG_INTERNAL_API_URL?.replace(/\/$/, '');
const secret = process.env.WORKER_SECRET;
if (!baseUrl || !secret || Buffer.byteLength(secret) < 32) throw new Error('TINDOG_INTERNAL_API_URL and a 32-byte WORKER_SECRET are required');

for (const worker of ['push', 'retention']) {
  const response = await fetch(`${baseUrl}/api/internal/workers/${worker}`, { method: 'POST', headers: { 'x-worker-secret': secret } });
  if (!response.ok) throw new Error(`${worker} worker failed with HTTP ${response.status}`);
  process.stdout.write(`${worker}: ${await response.text()}\n`);
}

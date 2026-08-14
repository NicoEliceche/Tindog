import { PrismaClient } from '@prisma/client';

if (process.env.CONFIRM_REVOKE_ALL !== 'REVOKE_ALL_TINDOG_SESSIONS') {
  throw new Error('Set CONFIRM_REVOKE_ALL=REVOKE_ALL_TINDOG_SESSIONS to confirm global session revocation.');
}
const prisma = new PrismaClient();
try {
  const result = await prisma.authSession.deleteMany();
  process.stdout.write(`Revoked ${result.count} sessions. Rotate JWT_SECRET immediately after this command.\n`);
} finally {
  await prisma.$disconnect();
}

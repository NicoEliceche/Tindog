import { runRetentionWorker } from '@core/security/accountLifecycle';
import { assertWorkerAuthorization } from '@core/security/workerAuth';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export async function POST(request: NextRequest) {
  try { assertWorkerAuthorization(request); return NextResponse.json(await runRetentionWorker()); }
  catch { return NextResponse.json({ error: 'Worker authorization failed' }, { status: 401 }); }
}

import { NextResponse } from 'next/server';
import { getVapidPublicKey } from '@/lib/vapid';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const publicKey = getVapidPublicKey();
    return NextResponse.json({ publicKey });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Failed to retrieve VAPID public key', details: err?.message },
      { status: 500 }
    );
  }
}

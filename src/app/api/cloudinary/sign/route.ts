import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { isAuthorizedAdmin } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: NextRequest) {
  try {
    if (!await isAuthorizedAdmin(request)) {
      return NextResponse.json(
        { error: 'Unauthorized. Only logged-in administrators can generate upload signatures.' },
        { status: 401 }
      );
    }
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET || process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    let body: any = {};
    try {
      body = await request.json();
    } catch {
      body = {};
    }

    const folder = body.folder || 'mili_universe_memories';

    if (!cloudName) {
      return NextResponse.json(
        { error: 'Cloudinary Cloud Name is not configured.' },
        { status: 400 }
      );
    }

    // If API Key & Secret are available, create a secure cryptographic signature for direct client upload
    if (apiKey && apiSecret) {
      const timestamp = Math.round(new Date().getTime() / 1000).toString();
      // Parameters must be sorted alphabetically
      const paramsToSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
      const signature = crypto.createHash('sha1').update(paramsToSign).digest('hex');

      return NextResponse.json({
        signed: true,
        cloudName,
        apiKey,
        timestamp,
        signature,
        folder,
      });
    }

    // Fallback: Return unsigned preset if secret is not set
    return NextResponse.json({
      signed: false,
      cloudName,
      uploadPreset: uploadPreset || 'ml_default',
      folder,
    });
  } catch (error: any) {
    console.error('Cloudinary sign error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to generate signature' },
      { status: 500 }
    );
  }
}

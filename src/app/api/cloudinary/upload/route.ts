import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { isAuthorizedAdmin } from '@/lib/admin-auth';
import { checkRateLimit, getClientIp, sanitizeText } from '@/lib/security';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rateCheck = await checkRateLimit(`cloudinary_upload_${ip}`, 15, 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json({ error: 'Too many upload attempts. Please wait a moment.' }, { status: 429 });
    }

    if (!await isAuthorizedAdmin(request)) {
      return NextResponse.json(
        { error: 'Unauthorized. Only logged-in administrators can upload media.' },
        { status: 401 }
      );
    }
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET || process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const rawResourceType = (formData.get('resourceType') as string) || 'auto';
    const resourceType = rawResourceType === 'video' ? 'video' : rawResourceType === 'image' ? 'image' : 'auto';
    const rawFolder = (formData.get('folder') as string) || 'mili_universe_memories';
    const folder = sanitizeText(rawFolder, 100).replace(/[^a-zA-Z0-9_\-\/]/g, '') || 'mili_universe_memories';

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    if (!cloudName) {
      return NextResponse.json(
        {
          error: 'Cloudinary is not configured yet. Please add NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME in .env.local',
          fallback: true,
        },
        { status: 400 }
      );
    }

    // Direct Binary Blob transfer (avoiding 33% Base64 size expansion)
    const arrayBuffer = await file.arrayBuffer();
    const mimeType = file.type || (resourceType === 'video' ? 'video/mp4' : 'image/jpeg');
    const blob = new Blob([arrayBuffer], { type: mimeType });

    const uploadFormData = new FormData();
    uploadFormData.append('file', blob, file.name || 'upload');
    uploadFormData.append('folder', folder);

    if (apiSecret && apiKey) {
      // Signed Cloudinary Upload
      const timestamp = Math.round(new Date().getTime() / 1000).toString();
      const paramsToSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
      const signature = crypto.createHash('sha1').update(paramsToSign).digest('hex');

      uploadFormData.append('api_key', apiKey);
      uploadFormData.append('timestamp', timestamp);
      uploadFormData.append('signature', signature);
    } else if (uploadPreset) {
      // Unsigned Cloudinary Upload
      uploadFormData.append('upload_preset', uploadPreset);
    } else {
      // Default unsigned upload attempt
      uploadFormData.append('upload_preset', 'ml_default');
    }

    const cloudinaryEndpoint = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;
    const response = await fetch(cloudinaryEndpoint, {
      method: 'POST',
      body: uploadFormData,
    });

    const data = await response.json();

    if (!response.ok) {
      console.warn('Cloudinary upload error response:', data);
      return NextResponse.json(
        { error: data?.error?.message || 'Failed to upload to Cloudinary' },
        { status: response.status }
      );
    }

    // Determine thumbnail URL
    let thumbnailUrl = data.secure_url;
    if (data.resource_type === 'video') {
      // Generate automatic jpg poster thumbnail from Cloudinary video
      thumbnailUrl = data.secure_url.replace(/\.[^/.]+$/, '.jpg');
    }

    return NextResponse.json({
      success: true,
      url: data.secure_url,
      thumbnailUrl: thumbnailUrl,
      resourceType: data.resource_type === 'video' ? 'video' : 'photo',
      publicId: data.public_id,
      format: data.format,
      width: data.width,
      height: data.height,
      duration: data.duration,
    });
  } catch (error: any) {
    console.error('Upload route error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal Server Error during upload' },
      { status: 500 }
    );
  }
}

import { compressImage, formatFileSize, CompressionResult } from './imageCompression';

export interface UploadProgressEvent {
  stage: 'compressing' | 'signing' | 'uploading' | 'processing' | 'done';
  percent: number;
  message: string;
  savedStats?: {
    originalSizeStr: string;
    finalSizeStr: string;
    savedPercent: number;
  };
}

export interface UploadResult {
  url: string;
  thumbnailUrl: string;
  resourceType: 'photo' | 'video';
  publicId?: string;
  width?: number;
  height?: number;
  duration?: number;
  format?: string;
  stats?: {
    originalSize: number;
    finalSize: number;
    savedPercent: number;
  };
}

export interface UploadOptions {
  folder?: string;
  onProgress?: (event: UploadProgressEvent) => void;
  signal?: AbortSignal;
}

/**
 * Super-fast direct upload with auto image compression, real-time XHR progress tracking,
 * and seamless fallback.
 */
export async function uploadMediaWithProgress(
  rawFile: File,
  options: UploadOptions = {}
): Promise<UploadResult> {
  const { folder = 'mili_universe_memories', onProgress, signal } = options;

  let fileToUpload = rawFile;
  const isImage = rawFile.type.startsWith('image/');
  const isVideo = rawFile.type.startsWith('video/');
  const resourceType = isVideo ? 'video' : 'image';

  let compressionStats: { originalSize: number; finalSize: number; savedPercent: number } = {
    originalSize: rawFile.size,
    finalSize: rawFile.size,
    savedPercent: 0,
  };

  // 1. Client-Side Image Compression (Instant)
  if (isImage) {
    onProgress?.({
      stage: 'compressing',
      percent: 5,
      message: `Optimizing image (${formatFileSize(rawFile.size)})...`,
    });

    try {
      const compRes: CompressionResult = await compressImage(rawFile, {
        maxWidth: 2560,
        maxHeight: 2560,
        quality: 0.85,
      });

      fileToUpload = compRes.file;
      compressionStats = {
        originalSize: compRes.originalSize,
        finalSize: compRes.compressedSize,
        savedPercent: compRes.savedPercent,
      };

      if (compRes.savedPercent > 5) {
        onProgress?.({
          stage: 'compressing',
          percent: 15,
          message: `Optimized from ${formatFileSize(compRes.originalSize)} to ${formatFileSize(compRes.compressedSize)} (${compRes.savedPercent}% lighter)!`,
          savedStats: {
            originalSizeStr: formatFileSize(compRes.originalSize),
            finalSizeStr: formatFileSize(compRes.compressedSize),
            savedPercent: compRes.savedPercent,
          },
        });
      }
    } catch (compErr) {
      console.warn('Image compression skipped due to error, using raw file:', compErr);
      fileToUpload = rawFile;
    }
  } else if (isVideo) {
    onProgress?.({
      stage: 'uploading',
      percent: 5,
      message: `Preparing video (${formatFileSize(rawFile.size)})...`,
    });
  }

  // 2. Obtain Signed Credentials from Backend
  onProgress?.({
    stage: 'signing',
    percent: 20,
    message: 'Establishing secure high-speed upload channel...',
  });

  let signData: any = null;
  try {
    const signRes = await fetch('/api/cloudinary/sign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ folder }),
      signal,
    });
    if (signRes.ok) {
      signData = await signRes.json();
    }
  } catch (err) {
    console.warn('Sign endpoint fetch error, will attempt standard direct/fallback:', err);
  }

  const cloudName =
    signData?.cloudName ||
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

  if (!cloudName) {
    throw new Error(
      'Cloudinary Cloud Name is not configured. ' +
      'Please set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME in your environment variables.'
    );
  }

  // 3. Direct Cloudinary Upload with Real-time XHR Progress
  const performDirectUpload = (): Promise<any> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;

      const formData = new FormData();
      formData.append('file', fileToUpload);
      formData.append('folder', folder);

      if (signData?.signed && signData.apiKey && signData.signature && signData.timestamp) {
        // Direct Signed Upload
        formData.append('api_key', signData.apiKey);
        formData.append('timestamp', signData.timestamp);
        formData.append('signature', signData.signature);
      } else {
        // Unsigned Upload
        const preset =
          signData?.uploadPreset ||
          process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ||
          'mili_preset';
        formData.append('upload_preset', preset);
      }

      // Live XHR Progress Tracking
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          // Map progress from 25% to 95%
          const uploadPercent = Math.round((e.loaded / e.total) * 70) + 25;
          const loadedStr = formatFileSize(e.loaded);
          const totalStr = formatFileSize(e.total);
          onProgress?.({
            stage: 'uploading',
            percent: uploadPercent,
            message: `Uploading: ${loadedStr} / ${totalStr} (${Math.round((e.loaded / e.total) * 100)}%)`,
            savedStats: compressionStats.savedPercent > 5 ? {
              originalSizeStr: formatFileSize(compressionStats.originalSize),
              finalSizeStr: formatFileSize(compressionStats.finalSize),
              savedPercent: compressionStats.savedPercent,
            } : undefined,
          });
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const resData = JSON.parse(xhr.responseText);
            resolve(resData);
          } catch {
            reject(new Error('Invalid JSON response from Cloudinary'));
          }
        } else {
          try {
            const errData = JSON.parse(xhr.responseText);
            reject(new Error(errData?.error?.message || `Cloudinary returned status ${xhr.status}`));
          } catch {
            reject(new Error(`Cloudinary upload failed (${xhr.status})`));
          }
        }
      };

      xhr.onerror = () => reject(new Error('Network error during Cloudinary direct upload'));
      xhr.ontimeout = () => reject(new Error('Cloudinary upload timed out'));

      if (signal) {
        signal.addEventListener('abort', () => {
          xhr.abort();
          reject(new Error('Upload aborted by user'));
        });
      }

      xhr.open('POST', endpoint);
      xhr.send(formData);
    });
  };

  let cloudinaryData: any = null;

  try {
    onProgress?.({
      stage: 'uploading',
      percent: 25,
      message: 'Uploading to Cloudinary...',
    });
    cloudinaryData = await performDirectUpload();
  } catch (directError: any) {
    console.warn('Direct upload failed or blocked, falling back to Next.js API route:', directError);

    // 4. Server Route Fallback with Next.js API
    onProgress?.({
      stage: 'uploading',
      percent: 50,
      message: 'Switching to secure server gateway...',
    });

    const fallbackFormData = new FormData();
    fallbackFormData.append('file', fileToUpload);
    fallbackFormData.append('resourceType', resourceType);
    fallbackFormData.append('folder', folder);

    const fallbackRes = await fetch('/api/cloudinary/upload', {
      method: 'POST',
      body: fallbackFormData,
      signal,
    });

    if (!fallbackRes.ok) {
      const errJson = await fallbackRes.json().catch(() => null);
      throw new Error(errJson?.error || `Upload failed (Status ${fallbackRes.status})`);
    }

    cloudinaryData = await fallbackRes.json();
  }

  onProgress?.({
    stage: 'processing',
    percent: 98,
    message: 'Finalizing and generating instant HD preview...',
  });

  // Calculate secure URL & thumbnail URL
  const secureUrl = cloudinaryData.secure_url || cloudinaryData.url;
  let thumbUrl = cloudinaryData.thumbnailUrl || secureUrl;

  if (resourceType === 'video' || cloudinaryData.resource_type === 'video') {
    // Generate automatic jpg poster thumbnail from Cloudinary video
    thumbUrl = secureUrl.replace(/\.[^/.]+$/, '.jpg');
  }

  onProgress?.({
    stage: 'done',
    percent: 100,
    message: 'Upload completed successfully! ✨',
  });

  return {
    url: secureUrl,
    thumbnailUrl: thumbUrl,
    resourceType: resourceType === 'video' || cloudinaryData.resource_type === 'video' ? 'video' : 'photo',
    publicId: cloudinaryData.public_id || cloudinaryData.publicId,
    width: cloudinaryData.width,
    height: cloudinaryData.height,
    duration: cloudinaryData.duration,
    format: cloudinaryData.format,
    stats: compressionStats,
  };
}

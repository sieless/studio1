/**
 * Cloudinary Server Configuration
 * Used for server-side image uploads and transformations
 *
 * NOTE: Validation happens at runtime (when Cloudinary is actually used),
 * not at build time. This allows the build to succeed in CI/CD environments.
 */

import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary with credentials from environment variables
// Empty strings are fine for build - will fail gracefully at runtime if needed
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '',
  api_key: process.env.CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || '',
});

export default cloudinary;

/**
 * Validates Cloudinary configuration
 * Call this in API routes before using Cloudinary
 */
export function validateCloudinaryConfig(): void {
  if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) {
    throw new Error('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is not configured');
  }
  if (!process.env.CLOUDINARY_API_KEY) {
    throw new Error('CLOUDINARY_API_KEY is not configured');
  }
  if (!process.env.CLOUDINARY_API_SECRET) {
    throw new Error('CLOUDINARY_API_SECRET is not configured');
  }
}

/**
 * Generate optimized Cloudinary URL with transformations
 * @param publicId - Cloudinary public ID of the image
 * @param options - Transformation options
 * @returns Optimized image URL
 */
export function getOptimizedImageUrl(
  publicId: string,
  options: {
    width?: number;
    height?: number;
    crop?: 'fill' | 'fit' | 'scale' | 'thumb';
    quality?: 'auto' | number;
    format?: 'auto' | 'jpg' | 'png' | 'webp';
  } = {}
): string {
  const {
    width,
    height,
    crop = 'fill',
    quality = 'auto',
    format = 'auto',
  } = options;

  const transformations: string[] = [];

  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  transformations.push(`c_${crop}`);
  transformations.push(`f_${format}`);
  transformations.push(`q_${quality}`);

  const transformString = transformations.join(',');

  return cloudinary.url(publicId, {
    transformation: transformString,
  });
}

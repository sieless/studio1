/**
 * Cloudinary Server Configuration
 * Used for server-side image uploads and transformations
 *
 * NOTE: Validation happens at runtime (when Cloudinary is actually used),
 * not at build time. This allows the build to succeed in CI/CD environments.
 */

import { v2 as cloudinary } from 'cloudinary';

const CLOUD_NAME =
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
  process.env.CLOUDINARY_CLOUD_NAME ||
  '';

const API_KEY =
  process.env.CLOUDINARY_API_KEY || process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || '';

const API_SECRET = process.env.CLOUDINARY_API_SECRET || '';

// Configure Cloudinary with credentials from environment variables
// Empty strings are fine for build - will fail gracefully at runtime if needed
cloudinary.config({
  cloud_name: CLOUD_NAME,
  api_key: API_KEY,
  api_secret: API_SECRET,
});

export default cloudinary;

/**
 * Validates Cloudinary configuration
 * Call this in API routes before using Cloudinary
 */
export function validateCloudinaryConfig(): void {
  const missingVars: string[] = [];

  if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME && !process.env.CLOUDINARY_CLOUD_NAME) {
    missingVars.push('Cloudinary cloud name (NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME or CLOUDINARY_CLOUD_NAME)');
  }

  if (!process.env.CLOUDINARY_API_KEY && !process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY) {
    missingVars.push('CLOUDINARY_API_KEY');
  }

  if (!process.env.CLOUDINARY_API_SECRET) {
    missingVars.push('CLOUDINARY_API_SECRET');
  }

  if (missingVars.length > 0) {
    throw new Error(`Missing Cloudinary environment variables: ${missingVars.join(', ')}`);
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

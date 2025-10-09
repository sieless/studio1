/**
 * Cloudinary Server Configuration
 * Used for server-side image uploads and transformations
 */

import { v2 as cloudinary } from 'cloudinary';

// Validate required environment variables
if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) {
  throw new Error(
    'Missing required environment variable: NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME\n' +
    'Please ensure all Cloudinary environment variables are set in .env.local\n' +
    'See .env.example for the required variables.'
  );
}

if (!process.env.CLOUDINARY_API_KEY) {
  throw new Error(
    'Missing required environment variable: CLOUDINARY_API_KEY\n' +
    'Please ensure all Cloudinary environment variables are set in .env.local\n' +
    'See .env.example for the required variables.'
  );
}

if (!process.env.CLOUDINARY_API_SECRET) {
  throw new Error(
    'Missing required environment variable: CLOUDINARY_API_SECRET\n' +
    'Please ensure all Cloudinary environment variables are set in .env.local\n' +
    'See .env.example for the required variables.'
  );
}

// Configure Cloudinary with credentials from environment variables
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;

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

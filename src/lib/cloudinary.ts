/**
 * Cloudinary Server Configuration
 * Used for server-side image uploads and transformations
 *
 * NOTE: Validation happens at runtime (when Cloudinary is actually used),
 * not at build time. This allows the build to succeed in CI/CD environments.
 */

import { v2 as cloudinary } from 'cloudinary';

interface ParsedCloudinaryUrl {
  cloudName?: string;
  apiKey?: string;
  apiSecret?: string;
}

function parseCloudinaryUrl(url: string | undefined): ParsedCloudinaryUrl {
  if (!url) return {};

  const pattern = /^cloudinary:\/\/([^:]+):([^@]+)@([^/?#]+)/i;
  const match = pattern.exec(url.trim());

  if (!match) {
    console.warn(
      'Invalid CLOUDINARY_URL format. Expected cloudinary://<api_key>:<api_secret>@<cloud_name>'
    );
    return {};
  }

  const [, rawKey, rawSecret, rawCloudName] = match;

  return {
    apiKey: decodeURIComponent(rawKey),
    apiSecret: decodeURIComponent(rawSecret),
    cloudName: decodeURIComponent(rawCloudName),
  };
}

function pickEnv(...keys: string[]): string | undefined {
  for (const key of keys) {
    const value = process.env[key];
    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim();
    }
  }
  return undefined;
}

const parsedFromUrl = parseCloudinaryUrl(process.env.CLOUDINARY_URL);

const CLOUD_NAME =
  pickEnv(
    'CLOUDINARY_CLOUD_NAME',
    'NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME',
    'CLOUD_NAME',
    'NEXT_PUBLIC_CLOUD_NAME'
  ) ||
  parsedFromUrl.cloudName ||
  '';

const API_KEY =
  pickEnv(
    'CLOUDINARY_API_KEY',
    'NEXT_PUBLIC_CLOUDINARY_API_KEY',
    'CLOUDINARY_KEY',
    'NEXT_PUBLIC_CLOUDINARY_KEY'
  ) ||
  parsedFromUrl.apiKey ||
  '';

const API_SECRET =
  pickEnv('CLOUDINARY_API_SECRET', 'NEXT_PUBLIC_CLOUDINARY_API_SECRET', 'CLOUDINARY_SECRET') ||
  parsedFromUrl.apiSecret ||
  '';

if (!process.env.CLOUDINARY_API_SECRET && process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET) {
  console.warn(
    'Warning: Using NEXT_PUBLIC_CLOUDINARY_API_SECRET. Move this value to CLOUDINARY_API_SECRET to keep it private.'
  );
}

// Configure Cloudinary with credentials from environment variables
// Empty strings are fine for build - will fail gracefully at runtime if needed
cloudinary.config({
  cloud_name: CLOUD_NAME,
  api_key: API_KEY,
  api_secret: API_SECRET,
  secure: true,
});

export default cloudinary;

/**
 * Validates Cloudinary configuration
 * Call this in API routes before using Cloudinary
 */
export function validateCloudinaryConfig(): void {
  const missingVars: string[] = [];

  if (!CLOUD_NAME) {
    missingVars.push(
      'Cloudinary cloud name (CLOUDINARY_CLOUD_NAME, NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, CLOUD_NAME, NEXT_PUBLIC_CLOUD_NAME, or CLOUDINARY_URL)'
    );
  }

  if (!API_KEY) {
    missingVars.push(
      'Cloudinary API key (CLOUDINARY_API_KEY, NEXT_PUBLIC_CLOUDINARY_API_KEY, CLOUDINARY_KEY, NEXT_PUBLIC_CLOUDINARY_KEY, or CLOUDINARY_URL)'
    );
  }

  if (!API_SECRET) {
    missingVars.push(
      'Cloudinary API secret (CLOUDINARY_API_SECRET, NEXT_PUBLIC_CLOUDINARY_API_SECRET, CLOUDINARY_SECRET, or CLOUDINARY_URL)'
    );
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

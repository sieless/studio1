/**
 * File Upload Security Validator
 * Validates file types, sizes, and security
 */

import { logError } from '@/lib/error-logger';

export interface FileValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Allowed file types
 */
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
];

export const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
];

export const ALLOWED_ALL_TYPES = [
  ...ALLOWED_IMAGE_TYPES,
  ...ALLOWED_DOCUMENT_TYPES,
];

/**
 * File size limits (in bytes)
 */
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
export const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_TOTAL_UPLOAD_SIZE = 50 * 1024 * 1024; // 50MB for batch uploads

/**
 * Dangerous file extensions to reject
 */
const DANGEROUS_EXTENSIONS = [
  'exe',
  'bat',
  'cmd',
  'com',
  'pif',
  'scr',
  'vbs',
  'js',
  'jar',
  'zip',
  'rar',
  '7z',
  'tar',
  'gz',
  'sh',
  'app',
  'deb',
  'rpm',
];

/**
 * Validate image file
 */
export function validateImageFile(file: File): FileValidationResult {
  const errors: string[] = [];

  // Check file type
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    errors.push(`Invalid file type: ${file.type}. Allowed types: JPEG, PNG, WebP, HEIC`);
  }

  // Check file extension
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (extension && DANGEROUS_EXTENSIONS.includes(extension)) {
    errors.push(`Dangerous file extension detected: ${extension}`);
  }

  // Check file size
  if (file.size > MAX_IMAGE_SIZE) {
    errors.push(`File too large: ${formatBytes(file.size)}. Maximum size: ${formatBytes(MAX_IMAGE_SIZE)}`);
  }

  // Check for empty files
  if (file.size === 0) {
    errors.push('File is empty');
  }

  // Check filename for suspicious patterns
  if (/[\x00-\x1f\x80-\x9f]/.test(file.name)) {
    errors.push('Filename contains invalid characters');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate PDF document
 */
export function validateDocumentFile(file: File): FileValidationResult {
  const errors: string[] = [];

  // Check file type
  if (!ALLOWED_DOCUMENT_TYPES.includes(file.type)) {
    errors.push(`Invalid file type: ${file.type}. Only PDF files are allowed`);
  }

  // Check file extension
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (extension !== 'pdf') {
    errors.push(`Invalid file extension: ${extension}. Only .pdf files are allowed`);
  }

  // Check file size
  if (file.size > MAX_DOCUMENT_SIZE) {
    errors.push(`File too large: ${formatBytes(file.size)}. Maximum size: ${formatBytes(MAX_DOCUMENT_SIZE)}`);
  }

  // Check for empty files
  if (file.size === 0) {
    errors.push('File is empty');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate multiple files (batch upload)
 */
export function validateMultipleFiles(
  files: File[],
  type: 'image' | 'document'
): FileValidationResult {
  const errors: string[] = [];

  // Check total number of files
  if (files.length > 20) {
    errors.push(`Too many files: ${files.length}. Maximum: 20 files per upload`);
  }

  // Check total size
  const totalSize = files.reduce((sum, file) => sum + file.size, 0);
  if (totalSize > MAX_TOTAL_UPLOAD_SIZE) {
    errors.push(
      `Total upload size too large: ${formatBytes(totalSize)}. Maximum: ${formatBytes(MAX_TOTAL_UPLOAD_SIZE)}`
    );
  }

  // Validate each file
  files.forEach((file, index) => {
    const validation =
      type === 'image' ? validateImageFile(file) : validateDocumentFile(file);
    if (!validation.isValid) {
      errors.push(`File ${index + 1} (${file.name}): ${validation.errors.join(', ')}`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Sanitize filename
 */
export function sanitizeFilename(filename: string): string {
  // Remove directory traversal attempts
  let sanitized = filename.replace(/\.\.\//g, '');

  // Remove special characters except dots, dashes, underscores
  sanitized = sanitized.replace(/[^a-zA-Z0-9._-]/g, '_');

  // Limit length
  const maxLength = 100;
  if (sanitized.length > maxLength) {
    const extension = sanitized.split('.').pop();
    const nameWithoutExt = sanitized.substring(0, sanitized.lastIndexOf('.'));
    sanitized = nameWithoutExt.substring(0, maxLength - extension!.length - 1) + '.' + extension;
  }

  return sanitized;
}

/**
 * Check if file appears to be an image by reading file header
 */
export async function verifyImageHeader(file: File): Promise<boolean> {
  try {
    const buffer = await file.slice(0, 12).arrayBuffer();
    const bytes = new Uint8Array(buffer);

    // Check magic numbers for common image formats
    // JPEG: FF D8 FF
    if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
      return true;
    }

    // PNG: 89 50 4E 47 0D 0A 1A 0A
    if (
      bytes[0] === 0x89 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x4e &&
      bytes[3] === 0x47 &&
      bytes[4] === 0x0d &&
      bytes[5] === 0x0a &&
      bytes[6] === 0x1a &&
      bytes[7] === 0x0a
    ) {
      return true;
    }

    // WebP: RIFF .... WEBP
    if (
      bytes[0] === 0x52 &&
      bytes[1] === 0x49 &&
      bytes[2] === 0x46 &&
      bytes[3] === 0x46 &&
      bytes[8] === 0x57 &&
      bytes[9] === 0x45 &&
      bytes[10] === 0x42 &&
      bytes[11] === 0x50
    ) {
      return true;
    }

    return false;
  } catch (error) {
    logError(error as Error, { category: 'UPLOAD', severity: 'MEDIUM' });
    return false;
  }
}

/**
 * Format bytes to human readable string
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Strip EXIF data from image (for privacy)
 * Note: This requires canvas processing in the browser
 */
export async function stripImageMetadata(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const newFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
            resolve(newFile);
          } else {
            reject(new Error('Failed to strip metadata'));
          }
        },
        file.type,
        0.95
      );
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

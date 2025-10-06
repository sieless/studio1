/**
 * Image utility functions for compression and validation
 */

export interface ImageCompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

/**
 * Compresses an image file while maintaining aspect ratio
 */
export async function compressImage(
  file: File,
  options: ImageCompressionOptions = {}
): Promise<File> {
  const { maxWidth = 1920, maxHeight = 1080, quality = 0.85 } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new window.Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        // Calculate new dimensions while maintaining aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Canvas to Blob conversion failed'));
              return;
            }
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = () => reject(new Error('Image load failed'));
    };
    reader.onerror = () => reject(new Error('File read failed'));
  });
}

/**
 * Validates image dimensions
 */
export async function validateImageDimensions(
  file: File,
  minWidth = 400,
  minHeight = 300
): Promise<{ valid: boolean; message?: string }> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new window.Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        if (img.width < minWidth || img.height < minHeight) {
          resolve({
            valid: false,
            message: `Image must be at least ${minWidth}x${minHeight}px. Current: ${img.width}x${img.height}px`,
          });
        } else {
          resolve({ valid: true });
        }
      };
      img.onerror = () => resolve({ valid: false, message: 'Could not load image' });
    };
    reader.onerror = () => resolve({ valid: false, message: 'Could not read file' });
  });
}

/**
 * Creates a thumbnail from an image file
 */
export async function createThumbnail(file: File, size = 200): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new window.Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        // Center crop
        const scale = Math.max(size / img.width, size / img.height);
        const scaledWidth = img.width * scale;
        const scaledHeight = img.height * scale;
        const x = (size - scaledWidth) / 2;
        const y = (size - scaledHeight) / 2;

        ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.onerror = () => reject(new Error('Image load failed'));
    };
    reader.onerror = () => reject(new Error('File read failed'));
  });
}

/**
 * Batch processes multiple images with progress tracking
 */
export async function batchProcessImages(
  files: File[],
  onProgress?: (current: number, total: number) => void
): Promise<File[]> {
  const processed: File[] = [];

  for (let i = 0; i < files.length; i++) {
    try {
      const compressedFile = await compressImage(files[i]);
      processed.push(compressedFile);
      onProgress?.(i + 1, files.length);
    } catch (error) {
      console.error(`Failed to process image ${files[i].name}:`, error);
      // Keep original file if compression fails
      processed.push(files[i]);
      onProgress?.(i + 1, files.length);
    }
  }

  return processed;
}

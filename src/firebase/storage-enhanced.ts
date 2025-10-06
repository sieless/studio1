'use client';

import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { initializeFirebase } from '@/firebase';
import { compressImage } from '@/lib/image-utils';

const { firebaseApp } = initializeFirebase();
const storage = getStorage(firebaseApp);

type UploadProgressCallback = (progress: number) => void;

/**
 * Enhanced image upload with compression and retry logic
 */
export const uploadImageWithRetry = async (
  file: File,
  userId: string,
  listingId: string,
  onProgress: UploadProgressCallback,
  maxRetries = 3
): Promise<string> => {
  let attempt = 0;
  let lastError: Error | null = null;

  while (attempt < maxRetries) {
    try {
      // Compress image before upload
      const compressedFile = await compressImage(file, {
        maxWidth: 1920,
        maxHeight: 1080,
        quality: 0.85,
      });

      const fileId = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const storageRef = ref(storage, `listings/${userId}/${listingId}/${fileId}`);
      const uploadTask = uploadBytesResumable(storageRef, compressedFile);

      return await new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            onProgress(progress);
          },
          (error) => {
            console.error('Upload failed:', error);
            reject(error);
          },
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadURL);
          }
        );
      });
    } catch (error) {
      lastError = error as Error;
      attempt++;

      if (attempt < maxRetries) {
        // Exponential backoff
        const delay = Math.min(1000 * Math.pow(2, attempt), 5000);
        await new Promise((resolve) => setTimeout(resolve, delay));
        console.log(`Retrying upload (attempt ${attempt + 1}/${maxRetries})...`);
      }
    }
  }

  throw new Error(
    `Upload failed after ${maxRetries} attempts: ${lastError?.message || 'Unknown error'}`
  );
};

/**
 * Upload multiple images with progress tracking
 */
export const uploadMultipleImages = async (
  files: File[],
  userId: string,
  listingId: string,
  onOverallProgress?: (current: number, total: number, percentage: number) => void
): Promise<string[]> => {
  const uploadedUrls: string[] = [];
  const failedUploads: { file: string; error: string }[] = [];

  for (let i = 0; i < files.length; i++) {
    try {
      const url = await uploadImageWithRetry(
        files[i],
        userId,
        listingId,
        (progress) => {
          // Individual file progress
          const overallPercentage = ((i + progress / 100) / files.length) * 100;
          onOverallProgress?.(i + 1, files.length, overallPercentage);
        }
      );
      uploadedUrls.push(url);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      failedUploads.push({ file: files[i].name, error: errorMessage });
      console.error(`Failed to upload ${files[i].name}:`, error);
    }
  }

  if (failedUploads.length > 0) {
    console.warn('Some images failed to upload:', failedUploads);
  }

  return uploadedUrls;
};

/**
 * Delete an image from storage
 */
export const deleteImage = async (imageUrl: string): Promise<void> => {
  try {
    const imageRef = ref(storage, imageUrl);
    await deleteObject(imageRef);
  } catch (error) {
    console.error('Failed to delete image:', error);
    throw error;
  }
};

/**
 * Delete multiple images from storage
 */
export const deleteMultipleImages = async (imageUrls: string[]): Promise<void> => {
  const deletePromises = imageUrls.map((url) => deleteImage(url));
  await Promise.allSettled(deletePromises);
};

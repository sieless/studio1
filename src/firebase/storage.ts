'use client';

import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from 'firebase/storage';
import { app } from '@/lib/firebase'; // Assuming you have this from your initial setup

const storage = getStorage(app);

type UploadProgressCallback = (progress: number) => void;

export const uploadImage = (
  file: File,
  userId: string,
  onProgress: UploadProgressCallback
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const fileId = `${userId}/${Date.now()}_${file.name}`;
    const storageRef = ref(storage, `listings/${fileId}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      snapshot => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress(progress);
      },
      error => {
        console.error('Upload failed:', error);
        reject(error);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then(downloadURL => {
          resolve(downloadURL);
        });
      }
    );
  });
};

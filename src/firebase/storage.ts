'use client';

import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from 'firebase/storage';
import { initializeFirebase } from '@/firebase';

const { firebaseApp } = initializeFirebase();
const storage = getStorage(firebaseApp);

type UploadProgressCallback = (progress: number) => void;

export const uploadImage = (
  file: File,
  userId: string,
  listingId: string,
  onProgress: UploadProgressCallback
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const fileId = `${Date.now()}_${file.name}`;
    const storageRef = ref(storage, `listings/${userId}/${listingId}/${fileId}`);
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

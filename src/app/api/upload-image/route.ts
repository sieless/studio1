/**
 * Image Upload API Route
 * Handles image uploads to Cloudinary
 */

import { NextRequest, NextResponse } from 'next/server';
import cloudinary, { validateCloudinaryConfig } from '@/lib/cloudinary';

export async function POST(request: NextRequest) {
  try {
    // Validate Cloudinary configuration first
    validateCloudinaryConfig();
    // Parse the form data
    const formData = await request.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type (images and PDFs)
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPG, PNG, WebP, and PDF are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 5MB.' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary using upload_stream
    const uploadResult = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'key-2-rent/listings',
          transformation: [
            { quality: 'auto', fetch_format: 'auto' }
          ],
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            reject(error);
          } else {
            resolve(result);
          }
        }
      );

      // Write buffer to stream
      uploadStream.end(buffer);
    });

    // Return the secure URL
    return NextResponse.json(
      {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        width: uploadResult.width,
        height: uploadResult.height,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Image upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload image. Please try again.' },
      { status: 500 }
    );
  }
}

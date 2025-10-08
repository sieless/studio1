'use client';

import { ChangeEvent, DragEvent, useState } from 'react';
import Image from 'next/image';
import { X, UploadCloud, GripVertical, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import {
  validateImageFile,
  validateMultipleFiles,
  verifyImageHeader,
  stripImageMetadata,
} from '@/lib/security/file-validator';
import { logUploadError } from '@/lib/error-logger';

interface ImageUploadProps {
  images: string[]; // Array of Cloudinary URLs
  onChange: (images: string[]) => void;
  maxImages?: number;
  className?: string;
}

/**
 * Image upload component with Cloudinary integration
 * Uploads images immediately when selected and stores URLs
 */
export function ImageUpload({
  images,
  onChange,
  maxImages = 10,
  className,
}: ImageUploadProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const { toast } = useToast();

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;

    const files = Array.from(event.target.files);
    const remainingSlots = maxImages - images.length;
    const filesToUpload = files.slice(0, remainingSlots);

    if (files.length > remainingSlots) {
      toast({
        title: 'Too many images',
        description: `You can only upload ${remainingSlots} more image(s)`,
        variant: 'destructive',
      });
    }

    // Validate all files before uploading
    const validation = validateMultipleFiles(filesToUpload, 'image');
    if (!validation.isValid) {
      toast({
        title: 'Invalid files',
        description: validation.errors[0],
        variant: 'destructive',
      });
      logUploadError(validation.errors.join(', '));
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const uploadPromises = filesToUpload.map(async (file, index) => {
        // Validate individual file
        const fileValidation = validateImageFile(file);
        if (!fileValidation.isValid) {
          toast({
            title: 'Invalid file',
            description: `${file.name}: ${fileValidation.errors[0]}`,
            variant: 'destructive',
          });
          logUploadError(fileValidation.errors.join(', '), file.name, file.size);
          return null;
        }

        // Verify file header to ensure it's actually an image
        const isValidImage = await verifyImageHeader(file);
        if (!isValidImage) {
          toast({
            title: 'Invalid image',
            description: `${file.name} is not a valid image file`,
            variant: 'destructive',
          });
          logUploadError('Invalid image header', file.name, file.size);
          return null;
        }

        // Strip EXIF metadata for privacy
        let processedFile = file;
        try {
          processedFile = await stripImageMetadata(file);
        } catch (error) {
          // If metadata stripping fails, continue with original file
          console.warn('Failed to strip metadata, using original file:', error);
        }

        // Upload to Cloudinary
        const formData = new FormData();
        formData.append('image', processedFile);

        const response = await fetch('/api/upload-image', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Upload failed');
        }

        const data = await response.json();

        // Update progress
        setUploadProgress(((index + 1) / filesToUpload.length) * 100);

        return data.url;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      const validUrls = uploadedUrls.filter((url): url is string => url !== null);

      if (validUrls.length > 0) {
        onChange([...images, ...validUrls]);
        toast({
          title: 'Success',
          description: `${validUrls.length} image(s) uploaded successfully`,
        });
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      logUploadError(error, undefined, undefined);
      toast({
        title: 'Upload failed',
        description: error.message || 'Failed to upload images. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
      // Reset input
      event.target.value = '';
    }
  };

  const handleRemove = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = (e: DragEvent, dropIndex: number) => {
    e.preventDefault();

    if (draggedIndex === null) return;

    const reordered = [...images];
    const [draggedItem] = reordered.splice(draggedIndex, 1);
    reordered.splice(dropIndex, 0, draggedItem);

    onChange(reordered);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className={cn('space-y-2', className)}>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {images.map((url, index) => (
          <div
            key={`${url}-${index}`}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
            className={cn(
              'relative group aspect-square rounded-md overflow-hidden border-2 transition-all cursor-move',
              draggedIndex === index && 'opacity-50',
              dragOverIndex === index && 'border-primary scale-105',
              dragOverIndex !== index && 'border-border'
            )}
          >
            <Image
              src={url}
              alt={`Preview ${index + 1}`}
              fill
              className="object-cover"
              unoptimized
            />

            {/* Drag Handle */}
            <div className="absolute top-1 left-1 bg-black/50 rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <GripVertical className="h-4 w-4 text-white" />
            </div>

            {/* Remove Button */}
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-1 right-1 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => handleRemove(index)}
            >
              <X className="h-4 w-4" />
            </Button>

            {/* Image Number Badge */}
            <div className="absolute bottom-1 left-1 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">
              {index + 1}
            </div>
          </div>
        ))}

        {/* Upload Button */}
        {images.length < maxImages && (
          <label
            htmlFor="image-upload"
            className={cn(
              'flex flex-col items-center justify-center aspect-square rounded-md border-2 border-dashed border-input bg-transparent cursor-pointer hover:bg-accent hover:border-primary transition-all',
              uploading && 'opacity-50 cursor-not-allowed'
            )}
          >
            {uploading ? (
              <>
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
                <span className="mt-2 text-sm text-center text-muted-foreground px-2">
                  Uploading...
                </span>
                <span className="text-xs text-muted-foreground">
                  {Math.round(uploadProgress)}%
                </span>
              </>
            ) : (
              <>
                <UploadCloud className="h-8 w-8 text-muted-foreground" />
                <span className="mt-2 text-sm text-center text-muted-foreground px-2">
                  Add photos
                </span>
                <span className="text-xs text-muted-foreground">
                  {images.length}/{maxImages}
                </span>
              </>
            )}
          </label>
        )}

        <input
          id="image-upload"
          type="file"
          className="sr-only"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          multiple
          onChange={handleFileChange}
          disabled={uploading || images.length >= maxImages}
        />
      </div>

      {images.length > 0 && (
        <p className="text-xs text-muted-foreground">
          Drag images to reorder. First image will be the cover photo.
        </p>
      )}

      {uploading && (
        <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
          <div
            className="bg-primary h-full transition-all duration-300"
            style={{ width: `${uploadProgress}%` }}
          />
        </div>
      )}
    </div>
  );
}

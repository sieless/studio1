'use client';

import { ChangeEvent, DragEvent, useState } from 'react';
import Image from 'next/image';
import { X, UploadCloud, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  images: File[];
  onChange: (images: File[]) => void;
  maxImages?: number;
  className?: string;
}

/**
 * Image upload component with preview grid, drag & drop, and reordering
 */
export function ImageUpload({
  images,
  onChange,
  maxImages = 10,
  className,
}: ImageUploadProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const files = Array.from(event.target.files);
      const newFiles = files.filter(
        (file) => !images.some((existing) => existing.name === file.name)
      );
      const combined = [...images, ...newFiles].slice(0, maxImages);
      onChange(combined);
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
        {images.map((file, index) => (
          <div
            key={`${file.name}-${index}`}
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
              src={URL.createObjectURL(file)}
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
            className="flex flex-col items-center justify-center aspect-square rounded-md border-2 border-dashed border-input bg-transparent cursor-pointer hover:bg-accent hover:border-primary transition-all"
          >
            <UploadCloud className="h-8 w-8 text-muted-foreground" />
            <span className="mt-2 text-sm text-center text-muted-foreground px-2">
              Add photos
            </span>
            <span className="text-xs text-muted-foreground">
              {images.length}/{maxImages}
            </span>
          </label>
        )}

        <input
          id="image-upload"
          type="file"
          className="sr-only"
          accept="image/*"
          multiple
          onChange={handleFileChange}
        />
      </div>

      {images.length > 0 && (
        <p className="text-xs text-muted-foreground">
          Drag images to reorder. First image will be the cover photo.
        </p>
      )}
    </div>
  );
}

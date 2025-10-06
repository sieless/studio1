'use client';

import Image from 'next/image';
import { useState } from 'react';
import { DefaultPlaceholder } from './default-placeholder';

interface OptimizedImageProps {
  src: string | undefined | null;
  alt: string;
  fill?: boolean;
  className?: string;
  sizes?: string;
  priority?: boolean;
  fallbackType?: string;
  width?: number;
  height?: number;
}

/**
 * Optimized Image component with error handling and fallback
 */
export function OptimizedImage({
  src,
  alt,
  fill = true,
  className = '',
  sizes,
  priority = false,
  fallbackType = 'Bedsitter',
  width,
  height,
}: OptimizedImageProps) {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  // If no src or error, show placeholder
  if (!src || error) {
    return (
      <div className={`${fill ? 'absolute inset-0' : ''} ${className} bg-muted flex items-center justify-center min-h-[200px]`}>
        <DefaultPlaceholder type={fallbackType} />
      </div>
    );
  }

  // Ensure Firebase Storage URLs use the correct format
  let cleanSrc = src.includes('firebasestorage.googleapis.com')
    ? src.replace(/^http:/, 'https:') // Force HTTPS
    : src;

  // Handle blob URLs (for preview during upload)
  if (src.startsWith('blob:')) {
    cleanSrc = src;
  }

  return (
    <div className={fill ? 'absolute inset-0' : 'relative'}>
      {loading && (
        <div className={`${fill ? 'absolute inset-0' : ''} ${className} bg-muted animate-pulse min-h-[200px]`} />
      )}
      <Image
        src={cleanSrc}
        alt={alt}
        fill={fill}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        className={`${className} ${loading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        sizes={sizes || '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'}
        priority={priority}
        onLoadingComplete={() => setLoading(false)}
        onError={(e) => {
          console.error('Image load error:', {
            src: cleanSrc,
            alt,
            error: e.currentTarget.error,
          });
          setError(true);
          setLoading(false);
        }}
        unoptimized // Disable Next.js optimization to prevent 400 errors
        loading={priority ? 'eager' : 'lazy'}
      />
    </div>
  );
}

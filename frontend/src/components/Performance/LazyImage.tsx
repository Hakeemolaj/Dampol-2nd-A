import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface LazyImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  sizes?: string;
  fill?: boolean;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  objectPosition?: string;
  loading?: 'lazy' | 'eager';
  onLoad?: () => void;
  onError?: () => void;
  fallbackSrc?: string;
  showLoadingSpinner?: boolean;
  aspectRatio?: string;
}

const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  quality = 75,
  placeholder = 'blur',
  blurDataURL,
  sizes,
  fill = false,
  objectFit = 'cover',
  objectPosition = 'center',
  loading = 'lazy',
  onLoad,
  onError,
  fallbackSrc = '/images/placeholder.png',
  showLoadingSpinner = true,
  aspectRatio,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [imageSrc, setImageSrc] = useState(src);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || isInView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority, isInView]);

  // Generate blur data URL if not provided
  const generateBlurDataURL = (w: number = 8, h: number = 8) => {
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#f3f4f6';
      ctx.fillRect(0, 0, w, h);
    }
    return canvas.toDataURL();
  };

  const defaultBlurDataURL = blurDataURL || generateBlurDataURL();

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
    onLoad?.();
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    if (imageSrc !== fallbackSrc) {
      setImageSrc(fallbackSrc);
    } else {
      onError?.();
    }
  };

  // Calculate responsive sizes if not provided
  const responsiveSizes = sizes || (
    fill 
      ? '100vw'
      : width 
        ? `(max-width: 768px) 100vw, (max-width: 1200px) 50vw, ${width}px`
        : '100vw'
  );

  const containerStyle = aspectRatio ? { aspectRatio } : {};

  return (
    <div
      ref={imgRef}
      className={cn(
        'relative overflow-hidden',
        !fill && 'inline-block',
        className
      )}
      style={containerStyle}
    >
      {/* Loading Spinner */}
      {isLoading && showLoadingSpinner && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Error State */}
      {hasError && imageSrc === fallbackSrc && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-500">
          <div className="text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="mt-2 text-sm">Failed to load image</p>
          </div>
        </div>
      )}

      {/* Image */}
      {(isInView || priority) && (
        <Image
          src={imageSrc}
          alt={alt}
          width={fill ? undefined : width}
          height={fill ? undefined : height}
          fill={fill}
          priority={priority}
          quality={quality}
          placeholder={placeholder}
          blurDataURL={defaultBlurDataURL}
          sizes={responsiveSizes}
          loading={loading}
          className={cn(
            'transition-opacity duration-300',
            isLoading ? 'opacity-0' : 'opacity-100',
            fill && `object-${objectFit}`,
            objectPosition && `object-${objectPosition}`
          )}
          style={{
            objectFit: fill ? objectFit : undefined,
            objectPosition: fill ? objectPosition : undefined,
          }}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}

      {/* Placeholder for non-priority images */}
      {!isInView && !priority && (
        <div 
          className="w-full bg-gray-200 animate-pulse"
          style={{
            height: height || 'auto',
            aspectRatio: aspectRatio || (width && height ? `${width}/${height}` : undefined),
          }}
        />
      )}
    </div>
  );
};

export default LazyImage;

// Optimized Image Gallery Component
interface ImageGalleryProps {
  images: Array<{
    src: string;
    alt: string;
    caption?: string;
  }>;
  className?: string;
  itemClassName?: string;
  columns?: number;
  gap?: number;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  className,
  itemClassName,
  columns = 3,
  gap = 4,
}) => {
  return (
    <div
      className={cn(
        'grid',
        `grid-cols-1 md:grid-cols-${Math.min(columns, 3)} lg:grid-cols-${columns}`,
        `gap-${gap}`,
        className
      )}
    >
      {images.map((image, index) => (
        <div key={index} className={cn('relative group', itemClassName)}>
          <LazyImage
            src={image.src}
            alt={image.alt}
            fill
            className="aspect-square rounded-lg overflow-hidden"
            objectFit="cover"
            priority={index < 6} // Prioritize first 6 images
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {image.caption && (
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 text-sm opacity-0 group-hover:opacity-100 transition-opacity">
              {image.caption}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// Avatar Component with Optimized Loading
interface AvatarProps {
  src?: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fallback?: string;
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  size = 'md',
  fallback,
  className,
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  const sizePixels = {
    sm: 32,
    md: 48,
    lg: 64,
    xl: 96,
  };

  if (!src) {
    return (
      <div
        className={cn(
          'rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-medium',
          sizeClasses[size],
          className
        )}
      >
        {fallback || alt.charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    <div className={cn('rounded-full overflow-hidden', sizeClasses[size], className)}>
      <LazyImage
        src={src}
        alt={alt}
        width={sizePixels[size]}
        height={sizePixels[size]}
        objectFit="cover"
        className="rounded-full"
        priority={size === 'xl'} // Prioritize large avatars
      />
    </div>
  );
};

// Hero Image Component with Optimized Loading
interface HeroImageProps {
  src: string;
  alt: string;
  className?: string;
  overlay?: boolean;
  overlayOpacity?: number;
  children?: React.ReactNode;
}

export const HeroImage: React.FC<HeroImageProps> = ({
  src,
  alt,
  className,
  overlay = false,
  overlayOpacity = 0.4,
  children,
}) => {
  return (
    <div className={cn('relative w-full', className)}>
      <LazyImage
        src={src}
        alt={alt}
        fill
        priority
        quality={90}
        objectFit="cover"
        sizes="100vw"
        className="absolute inset-0"
      />
      {overlay && (
        <div
          className="absolute inset-0 bg-black"
          style={{ opacity: overlayOpacity }}
        />
      )}
      {children && (
        <div className="relative z-10 h-full flex items-center justify-center">
          {children}
        </div>
      )}
    </div>
  );
};

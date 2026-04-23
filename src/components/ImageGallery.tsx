'use client';
import { useState } from 'react';
import { twMerge } from 'tailwind-merge';

interface ImageGalleryProps {
  images: string[];
  altText: string;
}

export default function ImageGallery({ images, altText }: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  // Fallback if no images provided
  const displayImages = images.length > 0 ? images : [''];

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Main Image */}
      <div className="relative aspect-[4/3] bg-neutral-100 w-full overflow-hidden flex items-center justify-center">
        {displayImages[activeIndex] ? (
          <img 
            src={displayImages[activeIndex]} 
            alt={`${altText} - View ${activeIndex + 1}`} 
            className="w-full h-full object-cover transition-opacity duration-300"
          />
        ) : (
          <span className="text-neutral-400">Main Product Image</span>
        )}
      </div>

      {/* Thumbnails */}
      {displayImages.length > 1 && (
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {displayImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={twMerge(
                "relative w-20 h-20 md:w-24 md:h-24 shrink-0 bg-neutral-100 border-2 transition-colors overflow-hidden flex items-center justify-center",
                activeIndex === idx ? "border-black" : "border-transparent hover:border-neutral-300"
              )}
            >
              {img ? (
                <img 
                  src={img} 
                  alt={`Thumbnail ${idx + 1}`} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xs text-neutral-400">Thumb {idx + 1}</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

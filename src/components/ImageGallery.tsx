'use client';
import { useState } from 'react';
import { twMerge } from 'tailwind-merge';

interface ImageGalleryProps {
  images: string[];
  altText: string;
}

export default function ImageGallery({ images, altText }: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Fallback if no images provided
  const displayImages = images.length > 0 ? images : [''];

  const switchImage = (idx: number) => {
    if (idx === activeIndex) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveIndex(idx);
      setIsTransitioning(false);
    }, 150);
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Main Image */}
      <div className="relative aspect-[4/3] bg-neutral-100 dark:bg-neutral-800 w-full overflow-hidden flex items-center justify-center group">
        {displayImages[activeIndex] ? (
          <img 
            src={displayImages[activeIndex]} 
            alt={`${altText} - View ${activeIndex + 1}`} 
            className={twMerge(
              "w-full h-full object-cover transition-all duration-300",
              isTransitioning ? "opacity-0 scale-[1.02]" : "opacity-100 scale-100"
            )}
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        ) : (
          <span className="text-neutral-400 text-sm uppercase tracking-wider">Main Product Image</span>
        )}

        {/* Image counter */}
        {displayImages.filter(Boolean).length > 1 && (
          <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-sm tracking-wider">
            {activeIndex + 1} / {displayImages.filter(Boolean).length}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {displayImages.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {displayImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => switchImage(idx)}
              className={twMerge(
                "relative w-20 h-20 md:w-24 md:h-24 shrink-0 bg-neutral-100 dark:bg-neutral-800 border-2 transition-all duration-200 overflow-hidden flex items-center justify-center hover:opacity-100",
                activeIndex === idx 
                  ? "border-black opacity-100" 
                  : "border-transparent opacity-60 hover:border-neutral-300"
              )}
            >
              {img ? (
                <img 
                  src={img} 
                  alt={`Thumbnail ${idx + 1}`} 
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
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

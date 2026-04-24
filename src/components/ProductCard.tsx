'use client';

import Link from 'next/link';
import { Star, Heart } from 'lucide-react';
import { formatCurrency } from '@/lib/formatCurrency';
import { useWishlistStore } from '@/store/useWishlistStore';
import { useCartStore } from '@/store/useCartStore';
import { useState, useEffect } from 'react';
import { twMerge } from 'tailwind-merge';
import toast from 'react-hot-toast';

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  imageUrl?: string;
  sizes?: Record<string, number | { stock: number; price: number }>;
  rating?: number;
  reviewCount?: number;
}

export default function ProductCard({ id, name, price, originalPrice, imageUrl, sizes, rating = 4.5, reviewCount = 12 }: ProductCardProps) {
  const { toggleItem, hasItem } = useWishlistStore();
  const { addItem } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  // Extract available sizes from JSON object (supports both formats)
  const availableSizes = sizes ? Object.keys(sizes).filter(size => {
    const val = sizes[size];
    return typeof val === 'object' ? val.stock > 0 : (val as number) > 0;
  }) : [];
  const totalStock = sizes ? Object.values(sizes).reduce((a: number, b) => a + (typeof b === 'object' ? b.stock : (b as number)), 0) : 0;

  // Calculate price range for display
  const sizePrices = sizes ? Object.entries(sizes)
    .filter(([, v]) => typeof v === 'object' ? v.stock > 0 : (v as number) > 0)
    .map(([, v]) => typeof v === 'object' ? v.price : price)
    .filter(p => p > 0) : [];
  const minPrice = sizePrices.length > 0 ? Math.min(...sizePrices) : price;
  const maxPrice = sizePrices.length > 0 ? Math.max(...sizePrices) : price;
  const hasPriceRange = minPrice !== maxPrice;

  useEffect(() => {
    setMounted(true);
  }, []);

  const [showSizes, setShowSizes] = useState(false);

  const handleQuickAddClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowSizes(true);
  };

  const handleSizeSelect = (e: React.MouseEvent, size: string) => {
    e.preventDefault();
    e.stopPropagation();
    const sizeVal = sizes?.[size];
    const sizePrice = sizeVal && typeof sizeVal === 'object' ? sizeVal.price : price;
    addItem({
      id: `${id}-${size}`,
      productId: id,
      name,
      price: sizePrice,
      size,
      imageUrl: imageUrl || '',
    });
    toast.success(`Added size ${size} to bag!`);
    setShowSizes(false);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleItem(id);
  };

  const isWishlisted = mounted && hasItem(id);

  return (
    <div className="group relative flex flex-col bg-white dark:bg-neutral-900 border border-transparent hover:border-neutral-200 dark:hover:border-neutral-700 hover:shadow-xl dark:hover:shadow-neutral-900/50 transition-all duration-300 ease-out-expo">
      
      {/* Wishlist Icon */}
      <button 
        onClick={handleWishlist}
        className={twMerge(
          "absolute top-2 right-2 sm:top-3 sm:right-3 z-10 p-1.5 rounded-full bg-white/80 backdrop-blur-sm hover:scale-110 active:scale-95 transition-all duration-200",
          isWishlisted ? "text-[#E63946] shadow-sm" : "text-neutral-400 hover:text-[#E63946]"
        )}
      >
        <Heart size={16} className={twMerge("sm:w-5 sm:h-5", isWishlisted ? "fill-current" : "")} />
      </button>

      {/* Out of stock badge */}
      {totalStock === 0 && (
        <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-10 bg-neutral-900/90 text-white text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-2 py-1 animate-fade-in">
          Sold Out
        </div>
      )}

      {/* Low stock badge */}
      {totalStock > 0 && totalStock <= 3 && (
        <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-10 bg-[#E63946] text-white text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-2 py-1 animate-pulse-fast">
          Only {totalStock} left
        </div>
      )}

      {/* Image Area */}
      <Link href={`/products/${id}`} className="block relative aspect-square bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center text-neutral-400">
          {imageUrl ? (
            <>
              {!imgLoaded && <div className="absolute inset-0 shimmer" />}
              <img 
                src={imageUrl.split(',')[0].trim()} 
                alt={name} 
                className={twMerge(
                  "object-cover w-full h-full group-hover:scale-105 transition-transform duration-500 ease-out",
                  imgLoaded ? "opacity-100" : "opacity-0"
                )}
                onLoad={() => setImgLoaded(true)}
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            </>
          ) : (
            <span className="text-xs uppercase tracking-wider">No Image</span>
          )}
        </div>
        
        {/* Quick Add CTA on Hover */}
        <div className="absolute bottom-0 left-0 w-full p-2 sm:p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out-expo">
          {showSizes ? (
            <div className="bg-white/95 dark:bg-neutral-900/95 backdrop-blur-sm border border-black dark:border-neutral-600 p-2 flex gap-1 sm:gap-2 justify-center flex-wrap animate-scale-in" onClick={(e) => e.preventDefault()}>
              {availableSizes.length > 0 ? availableSizes.map((size) => (
                <button
                  key={size}
                  onClick={(e) => handleSizeSelect(e, size)}
                  className="px-1.5 py-1 sm:px-2 border border-neutral-300 dark:border-neutral-600 text-[10px] sm:text-xs font-bold hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors duration-150 btn-press"
                >
                  {size.replace('UK ', '')}
                </button>
              )) : (
                <span className="text-xs font-bold text-neutral-500 py-1">OUT OF STOCK</span>
              )}
              <button 
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowSizes(false); }}
                className="px-2 py-1 text-xs text-neutral-400 hover:text-black ml-1 transition-colors"
              >
                ✕
              </button>
            </div>
          ) : (
            <button 
              onClick={handleQuickAddClick}
              disabled={availableSizes.length === 0}
              className="w-full bg-white/90 dark:bg-neutral-900/90 backdrop-blur-sm border border-black dark:border-neutral-500 text-black dark:text-white py-2 sm:py-3 text-xs sm:text-sm font-bold uppercase tracking-wider hover:bg-[#E63946] hover:border-[#E63946] hover:text-white transition-all duration-200 disabled:opacity-50 disabled:hover:bg-white/90 dark:disabled:hover:bg-neutral-900/90 disabled:hover:text-black dark:disabled:hover:text-white disabled:hover:border-black dark:disabled:hover:border-neutral-500 btn-press"
            >
              {availableSizes.length === 0 ? 'Sold Out' : 'Quick Add'}
            </button>
          )}
        </div>
      </Link>

      {/* Info Area */}
      <div className="p-3 sm:p-4 flex flex-col gap-0.5 sm:gap-1">
        <div className="flex items-center gap-1 mb-0.5 sm:mb-1 text-neutral-500">
          <Star size={11} className="fill-current text-yellow-400 sm:w-3 sm:h-3" />
          <span className="text-[10px] sm:text-xs">{rating} ({reviewCount})</span>
        </div>
        
        <Link href={`/products/${id}`}>
          <h3 className="font-semibold text-xs sm:text-sm text-black dark:text-neutral-100 truncate group-hover:text-[#E63946] transition-colors duration-200">{name}</h3>
        </Link>
        
        <div className="flex items-center gap-2 mt-0.5 sm:mt-1">
          {hasPriceRange ? (
            <span className="font-bold text-sm sm:text-base">{formatCurrency(minPrice)} – {formatCurrency(maxPrice)}</span>
          ) : (
            <span className="font-bold text-sm sm:text-base">{formatCurrency(price)}</span>
          )}
          {originalPrice && (
            <span className="text-xs sm:text-sm text-neutral-400 line-through">{formatCurrency(originalPrice)}</span>
          )}
        </div>
      </div>
    </div>
  );
}

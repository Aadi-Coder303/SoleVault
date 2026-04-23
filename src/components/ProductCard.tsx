'use client';

import Link from 'next/link';
import { Star, Heart } from 'lucide-react';
import { formatCurrency } from '@/lib/formatCurrency';
import { useWishlistStore } from '@/store/useWishlistStore';
import { useCartStore } from '@/store/useCartStore';
import { useState, useEffect } from 'react';
import { twMerge } from 'tailwind-merge';

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  imageUrl?: string;
  sizes?: Record<string, number>;
  rating?: number;
  reviewCount?: number;
}

export default function ProductCard({ id, name, price, originalPrice, imageUrl, sizes, rating = 4.5, reviewCount = 12 }: ProductCardProps) {
  const { toggleItem, hasItem } = useWishlistStore();
  const { addItem } = useCartStore();
  const [mounted, setMounted] = useState(false);

  // Extract available sizes from JSON object
  const availableSizes = sizes ? Object.keys(sizes).filter(size => sizes[size] > 0) : [];

  useEffect(() => {
    setMounted(true);
  }, []);

  const [showSizes, setShowSizes] = useState(false);

  const handleQuickAddClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowSizes(true);
  };

  const handleSizeSelect = (e: React.MouseEvent, size: string) => {
    e.preventDefault();
    addItem({
      id: `${id}-${size}`,
      productId: id,
      name,
      price,
      size,
      imageUrl: imageUrl || '',
    });
    alert(`Added size ${size} to bag!`);
    setShowSizes(false);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    toggleItem(id);
  };

  const isWishlisted = mounted && hasItem(id);

  return (
    <div className="group relative flex flex-col bg-white border border-transparent hover:border-neutral-200 hover:shadow-lg transition-all duration-300">
      
      {/* Wishlist Icon */}
      <button 
        onClick={handleWishlist}
        className={twMerge(
          "absolute top-3 right-3 z-10 hover:scale-110 transition-transform",
          isWishlisted ? "text-[#E63946]" : "text-neutral-400 hover:text-[#E63946]"
        )}
      >
        <Heart size={20} className={isWishlisted ? "fill-current" : ""} />
      </button>

      {/* Image Area */}
      <Link href={`/products/${id}`} className="block relative aspect-square bg-neutral-100 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center text-neutral-400">
          {imageUrl ? <img src={imageUrl} alt={name} className="object-cover w-full h-full" /> : <span>Image Placeholder</span>}
        </div>
        
        {/* Quick Add CTA on Hover */}
        <div className="absolute bottom-0 left-0 w-full p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out">
          {showSizes ? (
            <div className="bg-white/95 backdrop-blur-sm border border-black p-2 flex gap-2 justify-center" onClick={(e) => e.preventDefault()}>
              {availableSizes.length > 0 ? availableSizes.map((size) => (
                <button
                  key={size}
                  onClick={(e) => handleSizeSelect(e, size)}
                  className="px-2 py-1 border border-neutral-300 text-xs font-bold hover:bg-black hover:text-white transition-colors"
                >
                  {size.replace('UK ', '')}
                </button>
              )) : (
                <span className="text-xs font-bold text-neutral-500 py-1">OUT OF STOCK</span>
              )}
              <button 
                onClick={(e) => { e.preventDefault(); setShowSizes(false); }}
                className="px-2 py-1 text-xs text-neutral-400 hover:text-black ml-1"
              >
                ✕
              </button>
            </div>
          ) : (
            <button 
              onClick={handleQuickAddClick}
              disabled={availableSizes.length === 0}
              className="w-full bg-white/90 backdrop-blur-sm border border-black text-black py-3 text-sm font-bold uppercase tracking-wider hover:bg-[#E63946] hover:border-[#E63946] hover:text-white transition-colors disabled:opacity-50 disabled:hover:bg-white/90 disabled:hover:text-black disabled:hover:border-black"
            >
              {availableSizes.length === 0 ? 'Out of Stock' : 'Quick Add'}
            </button>
          )}
        </div>
      </Link>

      {/* Info Area */}
      <div className="p-4 flex flex-col gap-1">
        <div className="flex items-center gap-1 mb-1 text-neutral-500">
          <Star size={12} className="fill-current text-yellow-400" />
          <span className="text-xs">{rating} ({reviewCount})</span>
        </div>
        
        <Link href={`/products/${id}`}>
          <h3 className="font-semibold text-black truncate group-hover:underline underline-offset-2">{name}</h3>
        </Link>
        
        <div className="flex items-center gap-2 mt-1">
          <span className="font-bold">{formatCurrency(price)}</span>
          {originalPrice && (
            <span className="text-sm text-neutral-400 line-through">{formatCurrency(originalPrice)}</span>
          )}
        </div>
      </div>
    </div>
  );
}

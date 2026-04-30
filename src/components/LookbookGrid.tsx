'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { Shuffle } from 'lucide-react';
import { formatCurrency } from '@/lib/formatCurrency';

interface LookbookProduct {
  id: string;
  name: string;
  brand: string;
  price: number;
  imageUrl: string;
}

// Predefined layout patterns for visual variety
const LAYOUT_PATTERNS = [
  // pattern 0: 2 tall + 1 wide
  [
    { colSpan: 'md:col-span-4', rowSpan: 'md:row-span-2', height: 'h-[350px] md:h-[600px]' },
    { colSpan: 'md:col-span-4', rowSpan: 'md:row-span-1', height: 'h-[280px]' },
    { colSpan: 'md:col-span-4', rowSpan: 'md:row-span-1', height: 'h-[280px]' },
    { colSpan: 'md:col-span-8', rowSpan: 'md:row-span-1', height: 'h-[320px]' },
    { colSpan: 'md:col-span-4', rowSpan: 'md:row-span-1', height: 'h-[320px]' },
    { colSpan: 'md:col-span-6', rowSpan: 'md:row-span-1', height: 'h-[350px]' },
  ],
];

export default function LookbookGrid({ products }: { products: LookbookProduct[] }) {
  const [items, setItems] = useState(products.slice(0, 6));
  const [isShuffling, setIsShuffling] = useState(false);

  const shuffle = useCallback(() => {
    setIsShuffling(true);
    setTimeout(() => {
      const shuffled = [...products].sort(() => Math.random() - 0.5);
      setItems(shuffled.slice(0, 6));
      setTimeout(() => setIsShuffling(false), 100);
    }, 300);
  }, [products]);

  const layout = LAYOUT_PATTERNS[0];

  return (
    <div>
      {/* Shuffle Button */}
      <div className="flex justify-center mb-10">
        <button
          onClick={shuffle}
          className="group flex items-center gap-2 px-6 py-3 border border-neutral-200 dark:border-neutral-800 text-xs font-bold uppercase tracking-widest text-neutral-500 hover:text-black dark:hover:text-white hover:border-black dark:hover:border-white transition-all duration-300"
        >
          <Shuffle size={14} className={`transition-transform duration-500 ${isShuffling ? 'rotate-180' : 'group-hover:rotate-45'}`} />
          Shuffle
        </button>
      </div>

      {/* Dynamic Grid */}
      <div className={`grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6 transition-opacity duration-300 ${isShuffling ? 'opacity-0 scale-[0.98]' : 'opacity-100 scale-100'}`}>
        {items.map((product, i) => {
          return (
            <Link
              key={`${product.id}-${i}`}
              href={`/products/${product.id}`}
              className="group relative aspect-[3/4] overflow-hidden rounded-2xl bg-neutral-100 dark:bg-neutral-900 flex items-end shadow-sm hover:shadow-lg transition-shadow duration-300"
            >
              {/* Image */}
              <img
                src={product.imageUrl.split(',')[0].trim()}
                alt={product.name}
                className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
              
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10 opacity-80 group-hover:opacity-90 transition-opacity duration-300" />
              
              {/* Info */}
              <div className="relative z-20 p-5 md:p-6 w-full transform group-hover:-translate-y-1 transition-transform duration-500">
                <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] text-white/80 mb-1">{product.brand}</p>
                <h3 className="text-white text-base md:text-lg font-serif tracking-wide mb-2 line-clamp-2">{product.name}</h3>
                <span className="text-white text-sm font-medium tracking-widest">{formatCurrency(product.price)}</span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* View All Link */}
      <div className="flex justify-center mt-10">
        <Link
          href="/products"
          className="group inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white border-b border-transparent hover:border-current transition-all pb-1"
        >
          View All Products <span className="group-hover:translate-x-1 transition-transform">→</span>
        </Link>
      </div>
    </div>
  );
}

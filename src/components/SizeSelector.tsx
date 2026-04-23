'use client';
import { useState } from 'react';

import { twMerge } from 'tailwind-merge';

interface SizeOption {
  id: string;
  label: string;
  available: boolean;
  stock?: number;
}

interface SizeSelectorProps {
  sizes: SizeOption[];
  onSelect?: (sizeId: string) => void;
}

export default function SizeSelector({ sizes, onSelect }: SizeSelectorProps) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [system, setSystem] = useState<'UK' | 'US' | 'EU'>('UK');

  const handleSelect = (sizeId: string, available: boolean) => {
    if (!available) return;
    setSelectedSize(sizeId);
    if (onSelect) onSelect(sizeId);
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-end mb-3">
        <span className="font-semibold">Select Size</span>
        
        {/* System Toggle */}
        <div className="flex text-sm text-neutral-500 font-medium">
          <button 
            className={twMerge("px-2 hover:text-black", system === 'UK' && "text-black underline underline-offset-4")}
            onClick={() => setSystem('UK')}
          >UK</button>
          <span className="text-neutral-300">|</span>
          <button 
            className={twMerge("px-2 hover:text-black", system === 'US' && "text-black underline underline-offset-4")}
            onClick={() => setSystem('US')}
          >US</button>
          <span className="text-neutral-300">|</span>
          <button 
            className={twMerge("px-2 hover:text-black", system === 'EU' && "text-black underline underline-offset-4")}
            onClick={() => setSystem('EU')}
          >EU</button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {sizes.map((size) => (
          <button
            key={size.id}
            disabled={!size.available}
            onClick={() => handleSelect(size.id, size.available)}
            className={twMerge(
              "relative py-3 text-sm font-medium border transition-colors min-h-[48px]",
              size.available 
                ? "border-neutral-200 hover:border-black cursor-pointer bg-white text-black" 
                : "border-neutral-100 bg-neutral-50 text-neutral-400 cursor-not-allowed line-through",
              selectedSize === size.id && "bg-black text-white border-black hover:border-black"
            )}
          >
            {system} {size.label}
            {size.available && size.stock && size.stock <= 3 && (
              <span className="absolute -top-2 -right-2 bg-teal-600 text-white text-[10px] px-1.5 rounded-sm">
                Few Left
              </span>
            )}
          </button>
        ))}
      </div>
      
      {/* Size Guide Link */}
      <button className="mt-4 text-sm font-semibold underline text-neutral-600 hover:text-black transition-colors">
        Find My Size
      </button>
    </div>
  );
}

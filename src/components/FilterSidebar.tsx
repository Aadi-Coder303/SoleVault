'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import { twMerge } from 'tailwind-merge';

const BRANDS = ['Nike', 'Adidas', 'Jordan', 'New Balance', 'ASICS', 'Salomon'];

export default function FilterSidebar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const currentBrand = searchParams.get('brand');

  const toggleBrand = useCallback((brand: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (currentBrand === brand) {
      params.delete('brand');
    } else {
      params.set('brand', brand);
    }
    router.push(`?${params.toString()}`);
  }, [searchParams, currentBrand, router]);

  return (
    <aside className="w-full">
      <h2 className="text-lg font-bold mb-6 uppercase tracking-wide">Filters</h2>
      
      <div className="space-y-8">
        {/* Brand Filter */}
        <div className="border-b border-neutral-200 pb-6">
          <h3 className="font-bold mb-4 uppercase tracking-wider text-sm">Brand</h3>
          <div className="space-y-3 text-sm text-neutral-600">
            {BRANDS.map(brand => (
              <label key={brand} className="flex items-center gap-3 cursor-pointer hover:text-black">
                <input 
                  type="checkbox" 
                  checked={currentBrand === brand}
                  onChange={() => toggleBrand(brand)}
                  className="w-4 h-4 accent-black" 
                /> 
                {brand}
              </label>
            ))}
          </div>
        </div>

        {/* Clear Filters */}
        {currentBrand && (
          <button 
            onClick={() => {
              const params = new URLSearchParams(searchParams.toString());
              params.delete('brand');
              router.push(`?${params.toString()}`);
            }}
            className="text-xs font-bold uppercase underline hover:text-[#E63946] transition-colors"
          >
            Clear Filters
          </button>
        )}
      </div>
    </aside>
  );
}

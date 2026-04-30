'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import { twMerge } from 'tailwind-merge';

const BRANDS = ['Jordan', 'Adidas', 'Nike', 'On Running', 'New Balance', 'Puma', 'ANTA'];
const CATEGORIES = ['Men', 'Women', 'Kids'];

export default function FilterSidebar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Parse current params into arrays
  const currentBrands = searchParams.get('brand')?.split(',').filter(Boolean) || [];
  const currentCategories = searchParams.get('category')?.split(',').filter(Boolean) || [];

  const toggleFilter = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const currentValues = params.get(key)?.split(',').filter(Boolean) || [];
    
    // Toggle value in array
    let newValues;
    if (currentValues.includes(value)) {
      newValues = currentValues.filter(v => v !== value);
    } else {
      newValues = [...currentValues, value];
    }
    
    if (newValues.length > 0) {
      params.set(key, newValues.join(','));
    } else {
      params.delete(key);
    }
    
    router.push(`?${params.toString()}`);
  }, [searchParams, router]);

  return (
    <aside className="w-full">
      <h2 className="text-lg font-bold mb-6 uppercase tracking-wide">Filters</h2>
      
      <div className="space-y-8">
        {/* Brand Filter */}
        <div className="border-b border-neutral-200 dark:border-neutral-800 pb-6">
          <h3 className="font-bold mb-4 uppercase tracking-wider text-sm">Brands</h3>
          <div className="space-y-3">
            {BRANDS.map(brand => {
              const isActive = currentBrands.includes(brand);
              return (
                <label key={brand} className="group flex items-center gap-3 cursor-pointer">
                  <div className={`w-4 h-4 rounded-sm border transition-all duration-200 flex items-center justify-center ${isActive ? 'bg-[#E63946] border-[#E63946]' : 'border-neutral-300 dark:border-neutral-600 group-hover:border-[#E63946]'}`}>
                    {isActive && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                  </div>
                  <input 
                    type="checkbox" 
                    checked={isActive}
                    onChange={() => toggleFilter('brand', brand)}
                    className="hidden" 
                  /> 
                  <span className={`text-sm transition-colors duration-200 ${isActive ? 'text-black dark:text-white font-bold' : 'text-neutral-500 dark:text-neutral-400 group-hover:text-black dark:group-hover:text-white'}`}>
                    {brand}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Category Filter */}
        <div className="border-b border-neutral-200 dark:border-neutral-800 pb-6">
          <h3 className="font-bold mb-4 uppercase tracking-wider text-sm">Category</h3>
          <div className="space-y-3">
            {CATEGORIES.map(category => {
              const isActive = currentCategories.some(c => c.toLowerCase() === category.toLowerCase());
              return (
                <label key={category} className="group flex items-center gap-3 cursor-pointer">
                  <div className={`w-4 h-4 rounded-sm border transition-all duration-200 flex items-center justify-center ${isActive ? 'bg-[#E63946] border-[#E63946]' : 'border-neutral-300 dark:border-neutral-600 group-hover:border-[#E63946]'}`}>
                    {isActive && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                  </div>
                  <input 
                    type="checkbox" 
                    checked={isActive}
                    onChange={() => toggleFilter('category', category)}
                    className="hidden" 
                  /> 
                  <span className={`text-sm transition-colors duration-200 ${isActive ? 'text-black dark:text-white font-bold' : 'text-neutral-500 dark:text-neutral-400 group-hover:text-black dark:group-hover:text-white'}`}>
                    {category}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Clear Filters */}
        {(currentBrands.length > 0 || currentCategories.length > 0) && (
          <button 
            onClick={() => {
              const params = new URLSearchParams(searchParams.toString());
              params.delete('brand');
              params.delete('category');
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

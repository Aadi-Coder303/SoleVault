'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

export default function ProductSort() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSort = searchParams.get('sort') || 'newest';

  const handleSortChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', e.target.value);
    router.push(`?${params.toString()}`);
  }, [searchParams, router]);

  return (
    <select 
      value={currentSort}
      onChange={handleSortChange}
      className="border-none text-sm font-medium bg-transparent focus:ring-0 cursor-pointer outline-none"
    >
      <option value="newest">Newest Listed</option>
      <option value="price_asc">Price: Low to High</option>
      <option value="price_desc">Price: High to Low</option>
    </select>
  );
}

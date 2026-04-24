import FilterSidebar from '@/components/FilterSidebar';
import ProductCard from '@/components/ProductCard';
import ProductSort from '@/components/ProductSort';
import prisma from '@/lib/prisma';
import { Suspense } from 'react';

export const revalidate = 60; // Cache for 60 seconds for fast performance

export default async function ProductsPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ [key: string]: string | string[] | undefined }> 
}) {
  const params = await searchParams;
  const category = typeof params.category === 'string' ? params.category : undefined;
  const brand = typeof params.brand === 'string' ? params.brand : undefined;
  const sort = typeof params.sort === 'string' ? params.sort : undefined;

  let orderBy: any = { createdAt: 'desc' };
  if (sort === 'price_asc') orderBy = { price: 'asc' };
  if (sort === 'price_desc') orderBy = { price: 'desc' };

  const where: any = {};
  if (category && category.toLowerCase() !== 'sale') {
    where.category = { equals: category, mode: 'insensitive' };
  }
  if (brand) {
    where.brand = { equals: brand, mode: 'insensitive' };
  }

  const products = await prisma.product.findMany({
    where,
    orderBy,
  });

  return (
    <main className="container mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
      {/* Sidebar Filters */}
      <div className="hidden lg:block w-64 shrink-0">
        <Suspense fallback={<div>Loading filters...</div>}>
          <FilterSidebar />
        </Suspense>
      </div>

      {/* Product Grid */}
      <div className="flex-1">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold uppercase tracking-wide">
            {category ? `${category} Sneakers` : 'All Sneakers'}
          </h1>
          <Suspense fallback={<div>Loading...</div>}>
            <ProductSort />
          </Suspense>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-6">
          {products.map((p) => (
            <ProductCard 
              key={p.id} 
              id={p.id} 
              name={p.name} 
              price={p.price} 
              imageUrl={p.imageUrl || ''} 
              sizes={p.sizes as Record<string, number | { stock: number; price: number }>}
            />
          ))}
          {products.length === 0 && (
            <div className="col-span-full py-12 text-center text-neutral-500">
              No products found matching your filters.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

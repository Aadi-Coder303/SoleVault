import FilterSidebar from '@/components/FilterSidebar';
import LoadMoreProducts from '@/components/LoadMoreProducts';
import ProductSort from '@/components/ProductSort';
import prisma from '@/lib/prisma';
import { Suspense } from 'react';

export const revalidate = 60;

const PAGE_SIZE = 24;

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
    const categories = category.split(',').map(c => c.trim());
    where.category = { in: categories, mode: 'insensitive' };
  }
  
  if (brand) {
    const brands = brand.split(',').map(b => b.trim());
    where.brand = { in: brands, mode: 'insensitive' };
  }

  const [products, totalCount] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      take: PAGE_SIZE,
    }),
    prisma.product.count({ where }),
  ]);

  // Build query params string for client-side load more
  const qp = new URLSearchParams();
  if (category) qp.set('category', category);
  if (brand) qp.set('brand', brand);
  if (sort) qp.set('sort', sort);

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
            <span className="text-sm font-normal text-neutral-400 ml-2">({totalCount})</span>
          </h1>
          <Suspense fallback={<div>Loading...</div>}>
            <ProductSort />
          </Suspense>
        </div>
        
        <LoadMoreProducts 
          key={qp.toString()}
          initialProducts={products.map(p => ({ ...p, imageUrl: p.imageUrl, sizes: p.sizes as Record<string, number | { stock: number; price: number }> }))} 
          totalCount={totalCount}
          pageSize={PAGE_SIZE}
          queryParams={qp.toString()}
        />
      </div>
    </main>
  );
}

import FilterSidebar from '@/components/FilterSidebar';
import ProductCard from '@/components/ProductCard';
import prisma from '@/lib/prisma';

export const revalidate = 0; // Disable caching for MVP

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return (
    <main className="container mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
      {/* Sidebar Filters */}
      <div className="hidden lg:block w-64 shrink-0">
        <FilterSidebar />
      </div>

      {/* Product Grid */}
      <div className="flex-1">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold uppercase tracking-wide">All Sneakers</h1>
          <select className="border-none text-sm font-medium bg-transparent focus:ring-0 cursor-pointer outline-none">
            <option>Newest Listed</option>
            <option>Price: Low to High</option>
            <option>Price: High to Low</option>
          </select>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {products.map((p) => (
            <ProductCard 
              key={p.id} 
              id={p.id} 
              name={p.name} 
              price={p.price} 
              imageUrl={p.imageUrl || ''} 
              sizes={p.sizes as Record<string, number>}
            />
          ))}
          {products.length === 0 && (
            <div className="col-span-full py-12 text-center text-neutral-500">
              No products found. Add some in the owner dashboard!
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

import ProductCard from '@/components/ProductCard';
import { Search as SearchIcon } from 'lucide-react';
import prisma from '@/lib/prisma';

export const revalidate = 0;

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const resolvedParams = await searchParams;
  const query = resolvedParams.q || '';

  const results = query
    ? await prisma.product.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { brand: { contains: query, mode: 'insensitive' } },
          ],
        },
      })
    : [];

  return (
    <main className="container mx-auto px-4 py-12 min-h-[70vh]">
      <div className="mb-8 border-b border-neutral-200 pb-4">
        <h1 className="text-3xl font-bold uppercase tracking-wide">
          Search Results
        </h1>
        {query && (
          <p className="text-neutral-500 mt-2">
            Showing results for <span className="font-bold text-black">&quot;{query}&quot;</span> ({results.length})
          </p>
        )}
      </div>

      {!query ? (
        <div className="flex flex-col items-center justify-center py-24 text-center bg-neutral-50 border border-neutral-200">
          <SearchIcon size={48} className="text-neutral-300 mb-4" />
          <h2 className="text-xl font-bold uppercase tracking-wide mb-2">Start Searching</h2>
          <p className="text-neutral-500">
            Enter a brand or sneaker name in the top navigation to find products.
          </p>
        </div>
      ) : results.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {results.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              price={product.price}
              imageUrl={product.imageUrl || ''}
              sizes={product.sizes as Record<string, number>}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center bg-neutral-50 border border-neutral-200">
          <SearchIcon size={48} className="text-neutral-300 mb-4" />
          <h2 className="text-xl font-bold uppercase tracking-wide mb-2">No Results Found</h2>
          <p className="text-neutral-500 max-w-md">
            We couldn&apos;t find any sneakers matching &quot;{query}&quot;. Try checking your spelling or using more general terms.
          </p>
        </div>
      )}
    </main>
  );
}


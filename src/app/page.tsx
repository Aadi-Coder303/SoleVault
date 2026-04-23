import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import prisma from '@/lib/prisma';

export const revalidate = 0; // Disable caching for MVP

export default async function Home() {
  const products = await prisma.product.findMany({
    take: 4,
    orderBy: { createdAt: 'desc' },
  });

  return (
    <main className="flex min-h-screen flex-col">
      {/* Hero Banner */}
      <section className="relative w-full h-[600px] bg-neutral-100 flex items-center justify-center">
        <div className="text-center px-4">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-black mb-4 uppercase">
            Discover Verified Sneakers
          </h1>
          <p className="text-lg md:text-xl text-neutral-600 mb-8 max-w-2xl mx-auto">
            100% authentic sneakers sourced from official drops. Elevate your collection today.
          </p>
          <Link
            href="/products"
            className="inline-block bg-[#E63946] text-white px-8 py-4 font-bold uppercase tracking-wider hover:bg-black transition-colors"
          >
            Shop Now
          </Link>
        </div>
      </section>

      {/* Brand Logo Carousel Placeholder */}
      <section className="py-12 border-b border-neutral-200 overflow-hidden">
        <div className="container mx-auto px-4 flex justify-between items-center opacity-60">
          <span className="text-2xl font-bold tracking-widest uppercase">NIKE</span>
          <span className="text-2xl font-bold tracking-widest uppercase">ADIDAS</span>
          <span className="text-2xl font-bold tracking-widest uppercase">JORDAN</span>
          <span className="text-2xl font-bold tracking-widest uppercase">NEW BALANCE</span>
          <span className="text-2xl font-bold tracking-widest uppercase">ASICS</span>
        </div>
      </section>

      {/* Quick-Access Sections */}
      <section className="py-16 container mx-auto px-4">
        <div className="flex justify-between items-end mb-8">
          <h2 className="text-3xl font-bold uppercase tracking-wide">New Arrivals</h2>
          <Link href="/products" className="text-sm font-semibold underline hover:text-[#E63946] uppercase tracking-wider">
            View All
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Using ProductCard */}
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
      </section>
    </main>
  );
}

import Link from 'next/link';
import HeroSection from '@/components/HeroSection';
import BrandTicker from '@/components/BrandTicker';
import HeatCarousel from '@/components/HeatCarousel';
import LookbookGrid from '@/components/LookbookGrid';
import prisma from '@/lib/prisma';

export const revalidate = 60;

export default async function Home() {
  // Fetch high heat / premium items for Top Picks
  const topPicks = await prisma.product.findMany({
    take: 8,
    where: { imageUrl: { not: null } },
    orderBy: { price: 'desc' },
  });

  // Fetch random products for lookbook (grab more and let the client shuffle)
  const lookbookProducts = await prisma.product.findMany({
    take: 12,
    where: { imageUrl: { not: null } },
    orderBy: { updatedAt: 'desc' },
    select: { id: true, name: true, brand: true, price: true, imageUrl: true },
  });

  return (
    <main className="flex min-h-screen flex-col bg-white dark:bg-neutral-950">
      <HeroSection />
      <BrandTicker />

      {/* Trending Brands Quick Links */}
      <section className="py-12 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/20">
        <div className="container mx-auto px-4">
          <p className="text-center text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 mb-8">Trending Labels</p>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
            {['Jordan', 'Adidas', 'Nike', 'New Balance', 'On Running'].map((brand) => (
              <Link 
                key={brand}
                href={`/products?brand=${encodeURIComponent(brand)}`}
                className="px-6 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-sm text-xs font-black uppercase tracking-widest hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black hover:border-black dark:hover:border-white transition-all duration-300"
              >
                {brand}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Dynamic Lookbook Grid with Shuffle */}
      <section className="py-24 sm:py-32 bg-white dark:bg-neutral-950 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#E63946] mb-4">Curated Selection</p>
            <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-black dark:text-white">Discover</h2>
          </div>
          
          <LookbookGrid products={lookbookProducts.map(p => ({ ...p, imageUrl: p.imageUrl || '' }))} />
        </div>
      </section>

      {/* Top Picks - 3D Barrel Roll Carousel */}
      <section className="py-20 bg-neutral-50 dark:bg-neutral-900/30 border-y border-neutral-200 dark:border-neutral-800 overflow-hidden">
        <div className="container mx-auto px-4 mb-10 flex justify-between items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#E63946] mb-2">Premium Selection</p>
            <h2 className="text-4xl font-black uppercase tracking-tight text-black dark:text-white">The Heat Index</h2>
          </div>
          <Link
            href="/products"
            className="group text-xs font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors flex items-center gap-2 border border-neutral-300 dark:border-neutral-700 px-4 py-2 rounded-sm"
          >
            View All
            <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
          </Link>
        </div>

        {topPicks.length > 0 ? (
          <HeatCarousel products={topPicks.map(p => ({ ...p, imageUrl: p.imageUrl, sizes: p.sizes as Record<string, number | { stock: number; price: number }> }))} />
        ) : (
          <div className="w-full py-16 text-center text-neutral-400 text-sm uppercase tracking-widest">
            No products yet. Import some from the owner dashboard!
          </div>
        )}
      </section>

      {/* Trust Badges */}
      <section className="py-16 bg-white dark:bg-neutral-950">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8">
            {[
              { icon: '✓', title: '100% Authentic', desc: 'Every pair verified' },
              { icon: '🚚', title: 'Free Shipping', desc: 'Pan India delivery' },
              { icon: '↩', title: 'Easy Returns', desc: '7-day claim window' },
              { icon: '🔒', title: 'Secure Payments', desc: 'Powered by PayU' },
            ].map((b) => (
              <div key={b.title} className="group flex flex-col items-center gap-2 p-6 hover:bg-neutral-50 dark:hover:bg-neutral-900 border border-transparent hover:border-neutral-200 dark:hover:border-neutral-800 transition-all duration-300 rounded-sm">
                <span className="text-3xl group-hover:scale-125 group-hover:text-[#E63946] transition-all duration-300">{b.icon}</span>
                <p className="font-black text-xs sm:text-sm uppercase tracking-wider text-center mt-2">{b.title}</p>
                <p className="text-[10px] sm:text-xs text-neutral-500 text-center uppercase tracking-widest">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

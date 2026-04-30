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
          <p className="text-center text-[10px] font-medium uppercase tracking-[0.3em] text-neutral-400 mb-8">Trending Labels</p>
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
            {['Jordan', 'Adidas', 'Nike', 'New Balance', 'On Running'].map((brand) => (
              <Link 
                key={brand}
                href={`/products?brand=${encodeURIComponent(brand)}`}
                className="px-6 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-full text-[11px] font-medium tracking-wider hover:bg-neutral-900 hover:text-white dark:hover:bg-white dark:hover:text-black transition-all duration-300 shadow-sm hover:shadow-md"
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
            <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-neutral-500 mb-4">Curated Selection</p>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-normal tracking-tight text-neutral-900 dark:text-neutral-100">The Lookbook</h2>
          </div>
          
          <LookbookGrid products={lookbookProducts.map(p => ({ ...p, imageUrl: p.imageUrl || '' }))} />
        </div>
      </section>

      {/* Top Picks - 3D Barrel Roll Carousel */}
      <section className="py-24 bg-neutral-50/50 dark:bg-neutral-900/30 border-y border-neutral-100 dark:border-neutral-800 overflow-hidden">
        <div className="container mx-auto px-4 mb-16 flex flex-col md:flex-row justify-between items-center md:items-end gap-6 text-center md:text-left">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-neutral-500 mb-3">Premium Selection</p>
            <h2 className="text-4xl lg:text-5xl font-serif font-normal tracking-tight text-neutral-900 dark:text-neutral-100">Top Picks</h2>
          </div>
          <Link
            href="/products"
            className="group text-[11px] font-medium uppercase tracking-widest text-neutral-600 dark:text-neutral-300 hover:text-black dark:hover:text-white transition-colors flex items-center justify-center gap-2 border border-neutral-200 dark:border-neutral-700 px-6 py-2.5 rounded-full bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 shadow-sm"
          >
            Explore Collection
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
      <section className="py-20 bg-white dark:bg-neutral-950">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 max-w-5xl mx-auto">
            {[
              { icon: '✓', title: '100% Authentic', desc: 'Every pair verified' },
              { icon: '🚚', title: 'Free Shipping', desc: 'Pan India delivery' },
              { icon: '↩', title: 'Easy Returns', desc: '7-day claim window' },
              { icon: '🔒', title: 'Secure Payments', desc: 'Powered by PayU' },
            ].map((b) => (
              <div key={b.title} className="group flex flex-col items-center gap-3 p-8 bg-neutral-50 dark:bg-neutral-900/40 border border-neutral-100 dark:border-neutral-800/50 hover:border-neutral-200 dark:hover:border-neutral-700 transition-all duration-300 rounded-[2rem]">
                <div className="w-12 h-12 rounded-full bg-white dark:bg-neutral-800 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300">
                  <span className="text-lg text-neutral-700 dark:text-neutral-200">{b.icon}</span>
                </div>
                <p className="font-medium text-[11px] sm:text-xs uppercase tracking-[0.15em] text-center mt-2 text-neutral-900 dark:text-neutral-100">{b.title}</p>
                <p className="text-[10px] sm:text-[11px] text-neutral-400 text-center uppercase tracking-widest font-light">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

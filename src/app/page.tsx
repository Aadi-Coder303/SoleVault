import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import HeroSection from '@/components/HeroSection';
import BrandTicker from '@/components/BrandTicker';
import prisma from '@/lib/prisma';

export const revalidate = 0;

export default async function Home() {
  const products = await prisma.product.findMany({
    take: 4,
    orderBy: { createdAt: 'desc' },
  });

  return (
    <main className="flex min-h-screen flex-col bg-white">
      <HeroSection />
      <BrandTicker />

      {/* New Arrivals */}
      <section className="py-20 container mx-auto px-4">
        <div className="flex justify-between items-end mb-10">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#E63946] mb-2">Just Dropped</p>
            <h2 className="text-4xl font-black uppercase tracking-tight text-black">New Arrivals</h2>
          </div>
          <Link
            href="/products"
            className="group text-sm font-bold uppercase tracking-wider text-neutral-500 hover:text-black transition-colors flex items-center gap-1"
          >
            View All
            <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((p, i) => (
            <div
              key={p.id}
              className="animate-scroll-appear"
              style={{ animationDelay: `${i * 80}ms`, animationFillMode: 'both' }}
            >
              <ProductCard
                id={p.id}
                name={p.name}
                price={p.price}
                imageUrl={p.imageUrl || ''}
                sizes={p.sizes as Record<string, number>}
              />
            </div>
          ))}
          {products.length === 0 && (
            <div className="col-span-full py-16 text-center text-neutral-400 text-sm uppercase tracking-widest">
              No products yet. Add some from the owner dashboard!
            </div>
          )}
        </div>
      </section>

      {/* Category Grid */}
      <section className="py-16 bg-neutral-950">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#E63946] mb-2">Browse by Category</p>
            <h2 className="text-4xl font-black uppercase tracking-tight text-white">Shop the Range</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: "Men's", href: '/products?category=Men', sub: 'Sizes UK 6–13' },
              { label: "Women's", href: '/products?category=Women', sub: 'Sizes UK 3–9' },
              { label: "Kids'", href: '/products?category=Kids', sub: 'Sizes UK 1–5' },
            ].map((cat) => (
              <Link
                key={cat.label}
                href={cat.href}
                className="group relative h-52 bg-white/5 border border-white/10 flex flex-col items-center justify-center overflow-hidden hover:border-[#E63946]/50 hover:bg-[#E63946]/5 transition-all duration-300"
              >
                <span className="text-4xl font-black uppercase text-white/80 group-hover:text-white transition-colors tracking-tight">
                  {cat.label}
                </span>
                <span className="text-xs text-neutral-500 uppercase tracking-widest mt-2 group-hover:text-neutral-300 transition-colors">
                  {cat.sub}
                </span>
                <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-[#E63946] group-hover:w-full transition-all duration-500" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-16 border-t border-neutral-100">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
            {[
              { icon: '✓', title: '100% Authentic', desc: 'Every pair verified' },
              { icon: '🚚', title: 'Free Shipping', desc: 'On all orders' },
              { icon: '↩', title: 'Easy Returns', desc: 'Hassle-free policy' },
              { icon: '🔒', title: 'Secure Payments', desc: 'Powered by Razorpay' },
            ].map((b) => (
              <div key={b.title} className="group flex flex-col items-center gap-2 p-4 hover:bg-neutral-50 transition-colors rounded-sm">
                <span className="text-2xl">{b.icon}</span>
                <p className="font-bold text-sm uppercase tracking-wide">{b.title}</p>
                <p className="text-xs text-neutral-500">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

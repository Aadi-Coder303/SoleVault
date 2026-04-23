'use client';

import { useWishlistStore } from '@/store/useWishlistStore';
import ProductCard from '@/components/ProductCard';
import Link from 'next/link';
import { Heart, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ProductData {
  id: string;
  name: string;
  brand: string;
  price: number;
  description: string;
  imageUrl: string | null;
  sizes: Record<string, number>;
}

export default function WishlistPage() {
  const { items } = useWishlistStore();
  const [mounted, setMounted] = useState(false);
  const [products, setProducts] = useState<ProductData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    async function fetchWishlist() {
      if (items.length === 0) return;
      setIsLoading(true);
      try {
        const res = await fetch('/api/products');
        const allProducts = await res.json();
        setProducts(allProducts.filter((p: ProductData) => items.includes(p.id)));
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    fetchWishlist();
  }, [items]);

  if (!mounted) return null;

  return (
    <main className="container mx-auto px-4 py-12 min-h-[70vh]">
      <div className="flex items-center gap-3 mb-8 border-b border-neutral-200 pb-4">
        <Heart size={28} className="text-[#E63946] fill-current" />
        <h1 className="text-3xl font-bold uppercase tracking-wide">Your Favorites</h1>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-24"><Loader2 size={32} className="animate-spin text-neutral-400" /></div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard 
              key={product.id}
              id={product.id}
              name={product.name}
              price={product.price}
              imageUrl={product.imageUrl || ''}
              sizes={product.sizes}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center bg-neutral-50 border border-neutral-200">
          <Heart size={48} className="text-neutral-300 mb-4" />
          <h2 className="text-xl font-bold uppercase tracking-wide mb-2">Nothing to see here</h2>
          <p className="text-neutral-500 mb-8 max-w-md">
            You haven&apos;t added any sneakers to your favorites yet. Start browsing to find your perfect pair!
          </p>
          <Link href="/products?category=all" className="bg-black text-white px-8 py-4 font-bold uppercase tracking-wider hover:bg-[#E63946] transition-colors">
            Shop All Sneakers
          </Link>
        </div>
      )}
    </main>
  );
}

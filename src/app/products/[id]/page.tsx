'use client';

import ImageGallery from '@/components/ImageGallery';
import SizeSelector from '@/components/SizeSelector';
import { useCartStore } from '@/store/useCartStore';
import { useWishlistStore } from '@/store/useWishlistStore';
import { formatCurrency } from '@/lib/formatCurrency';
import { useState, useEffect, use } from 'react';
import { Heart } from 'lucide-react';


export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const { addItem } = useCartStore();
  const { toggleItem, hasItem } = useWishlistStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const product = {
    id,
    name: 'Air Jordan 1 High OG',
    price: 16500,
    originalPrice: 18000,
    brand: 'Nike',
    imageUrl: '', // primary image
  };

  const handleAddToCart = () => {
    if (!selectedSize) return alert('Please select a size first.');
    
    addItem({
      id: `${product.id}-${selectedSize}`,
      productId: product.id,
      name: product.name,
      price: product.price,
      size: selectedSize,
      imageUrl: product.imageUrl,
    });
    
    alert('Added to bag!');
  };

  // Mock data for sizes
  const mockSizes = [
    { id: 'uk6', label: '6', available: true, stock: 5 },
    { id: 'uk7', label: '7', available: true, stock: 2 },
    { id: 'uk8', label: '8', available: false },
    { id: 'uk9', label: '9', available: true, stock: 10 },
    { id: 'uk10', label: '10', available: true, stock: 3 },
    { id: 'uk11', label: '11', available: true, stock: 1 },
    { id: 'uk12', label: '12', available: false },
  ];

  return (
    <main className="container mx-auto px-4 py-8 lg:py-12 flex flex-col lg:flex-row gap-12">
      {/* Left: Image Gallery */}
      <div className="lg:w-[60%] flex flex-col gap-4">
        <ImageGallery 
          images={['', '', '', '']} 
          altText={product.name} 
        />
      </div>

      {/* Right: Info Stack */}
      <div className="lg:w-[40%] flex flex-col">
        <p className="text-sm text-neutral-500 uppercase tracking-widest mb-2">{product.brand}</p>
        <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
        
        <div className="flex items-center gap-2 mb-6">
          <span className="text-xl font-bold">{formatCurrency(product.price)}</span>
          <span className="text-sm text-neutral-500 line-through">{formatCurrency(product.originalPrice)}</span>
        </div>

        {/* Size Selection */}
        <div className="mb-8">
          <SizeSelector sizes={mockSizes} onSelect={setSelectedSize} />
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-3 mb-8">
          <button 
            onClick={handleAddToCart}
            className="w-full bg-[#E63946] text-white py-4 font-bold uppercase tracking-wider hover:bg-black transition-colors shadow-sm hover:shadow-md"
          >
            Add to Bag
          </button>
          <button 
            onClick={() => toggleItem(product.id)}
            className="w-full bg-transparent border border-black text-black py-4 font-bold uppercase tracking-wider hover:bg-neutral-50 transition-colors flex justify-center items-center gap-2"
          >
            {mounted && hasItem(product.id) ? (
              <><Heart className="fill-current text-[#E63946]" size={20} /> Saved to Wishlist</>
            ) : (
              <><Heart size={20} /> Add to Wishlist</>
            )}
          </button>
        </div>

        {/* Description Accordion */}
        <div className="border-t border-neutral-200 pt-6">
          <h3 className="font-bold mb-2">Description</h3>
          <p className="text-neutral-600 text-sm leading-relaxed">
            Placeholder for product description. Sourced directly from official drops. Guaranteed authentic.
          </p>
        </div>
      </div>
    </main>
  );
}

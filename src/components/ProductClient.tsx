'use client';

import ImageGallery from '@/components/ImageGallery';
import SizeSelector from '@/components/SizeSelector';
import { useCartStore } from '@/store/useCartStore';
import { useWishlistStore } from '@/store/useWishlistStore';
import { formatCurrency } from '@/lib/formatCurrency';
import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import toast from 'react-hot-toast';

interface ProductData {
  id: string;
  name: string;
  brand: string;
  price: number;
  description: string;
  imageUrl: string | null;
  sizes: any;
}

export default function ProductClient({ product }: { product: ProductData }) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const { addItem } = useCartStore();
  const { toggleItem, hasItem } = useWishlistStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleAddToCart = () => {
    if (!selectedSize) return toast.error('Please select a size first.');
    
    addItem({
      id: `${product.id}-${selectedSize}`,
      productId: product.id,
      name: product.name,
      price: product.price,
      size: selectedSize,
      imageUrl: product.imageUrl || '',
    });
    
    toast.success('Added to bag!');
  };

  // Convert JSON sizes from Prisma to the format expected by SizeSelector
  const sizesMap = (product.sizes as Record<string, number>) || {};
  const formattedSizes = Object.entries(sizesMap).map(([sizeLabel, stock]) => ({
    id: sizeLabel,
    label: sizeLabel.replace('UK ', ''),
    available: stock > 0,
    stock: stock,
  }));

  // Ensure they are sorted naturally (e.g. 6, 6.5, 7)
  formattedSizes.sort((a, b) => parseFloat(a.label) - parseFloat(b.label));

  // Parse multiple images if stored as comma-separated string
  const imageUrls = product.imageUrl ? product.imageUrl.split(',') : [];
  const galleryImages = [...imageUrls, '', '', ''].slice(0, 4);

  return (
    <main className="container mx-auto px-4 py-8 lg:py-12 flex flex-col lg:flex-row gap-12">
      {/* Left: Image Gallery */}
      <div className="lg:w-[60%] flex flex-col gap-4">
        <ImageGallery 
          images={galleryImages} 
          altText={product.name} 
        />
      </div>

      {/* Right: Info Stack */}
      <div className="lg:w-[40%] flex flex-col">
        <p className="text-sm text-neutral-500 uppercase tracking-widest mb-2">{product.brand}</p>
        <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
        
        <div className="flex items-center gap-2 mb-6">
          <span className="text-xl font-bold">{formatCurrency(product.price)}</span>
        </div>

        {/* Size Selection */}
        <div className="mb-8">
          <SizeSelector sizes={formattedSizes} onSelect={setSelectedSize} />
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
          <p className="text-neutral-600 text-sm leading-relaxed whitespace-pre-wrap">
            {product.description || 'No description available for this product.'}
          </p>
        </div>
      </div>
    </main>
  );
}

'use client';

import ImageGallery from '@/components/ImageGallery';
import SizeSelector from '@/components/SizeSelector';
import { useCartStore } from '@/store/useCartStore';
import { useWishlistStore } from '@/store/useWishlistStore';
import { formatCurrency } from '@/lib/formatCurrency';
import { useState, useEffect } from 'react';
import { Heart, ShieldCheck, Truck, RefreshCcw, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface ProductData {
  id: string;
  name: string;
  brand: string;
  price: number;
  description: string;
  imageUrl: string | null;
  sizes: any;
  colorName?: string | null;
  parentId?: string | null;
}

interface ColorVariant {
  id: string;
  name: string;
  colorName: string | null;
  imageUrl: string | null;
}

export default function ProductClient({ product, colorVariants = [] }: { product: ProductData; colorVariants?: ColorVariant[] }) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [displayPrice, setDisplayPrice] = useState(product.price);
  const { addItem } = useCartStore();
  const { toggleItem, hasItem } = useWishlistStore();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle both size formats: plain number or { stock, price }
  const sizesMap = (product.sizes as Record<string, number | { stock: number; price: number }>) || {};
  const totalStock = Object.values(sizesMap).reduce((a: number, b) => {
    return a + (typeof b === 'object' ? b.stock : (b as number));
  }, 0);
  const isLowStock = totalStock > 0 && totalStock <= 5;

  const formattedSizes = Object.entries(sizesMap).map(([sizeLabel, val]) => {
    const stock = typeof val === 'object' ? val.stock : (val as number);
    const price = typeof val === 'object' ? val.price : undefined;
    return {
      id: sizeLabel,
      label: sizeLabel.replace('UK ', ''),
      available: stock > 0,
      stock,
      price,
    };
  });
  formattedSizes.sort((a, b) => parseFloat(a.label) - parseFloat(b.label));

  const imageUrls = product.imageUrl ? product.imageUrl.split(',') : [];
  const galleryImages = [...imageUrls, '', '', ''].slice(0, 4);

  const handleSizeSelect = (sizeId: string, price?: number) => {
    setSelectedSize(sizeId);
    setDisplayPrice(price || product.price);
  };

  const getCurrentPrice = () => {
    if (!selectedSize) return product.price;
    const val = sizesMap[selectedSize];
    if (typeof val === 'object' && val.price) return val.price;
    return product.price;
  };

  const handleAddToCart = () => {
    if (!selectedSize) return toast.error('Please select a size first.');
    const price = getCurrentPrice();
    addItem({
      id: `${product.id}-${selectedSize}`,
      productId: product.id,
      name: product.name,
      price,
      size: selectedSize,
      imageUrl: product.imageUrl || '',
    });
    toast.success('Added to bag!');
  };

  const handleBuyNow = () => {
    if (!selectedSize) return toast.error('Please select a size first.');
    const price = getCurrentPrice();
    addItem({
      id: `${product.id}-${selectedSize}`,
      productId: product.id,
      name: product.name,
      price,
      size: selectedSize,
      imageUrl: product.imageUrl || '',
    });
    router.push('/checkout');
  };

  return (
    <main className="container mx-auto px-4 py-8 lg:py-12 flex flex-col lg:flex-row gap-12">
      {/* Left: Image Gallery */}
      <div className="lg:w-[60%] flex flex-col gap-4">
        <ImageGallery images={galleryImages} altText={product.name} />
      </div>

      {/* Right: Info Stack */}
      <div className="lg:w-[40%] flex flex-col">
        <p className="text-xs text-[#E63946] font-bold uppercase tracking-[0.3em] mb-1">{product.brand}</p>
        <h1 className="text-2xl lg:text-3xl font-black mb-3 leading-tight">{product.name}</h1>
        {product.colorName && (
          <p className="text-xs text-neutral-500 font-semibold uppercase tracking-wide mb-2">{product.colorName}</p>
        )}

        {/* Price row */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl font-black">{formatCurrency(displayPrice)}</span>
          <span className="text-xs bg-green-100 text-green-700 font-bold px-2 py-1 rounded-sm uppercase tracking-wide">Free Shipping</span>
        </div>

        {/* Color Variants */}
        {colorVariants.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-2">Available Colors</p>
            <div className="flex gap-2 flex-wrap">
              {colorVariants.map(v => {
                const isActive = v.id === product.id;
                const thumb = v.imageUrl ? v.imageUrl.split(',')[0].trim() : '';
                return (
                  <button
                    key={v.id}
                    onClick={() => { if (!isActive) router.push(`/products/${v.id}`); }}
                    className={`flex items-center gap-2 border px-3 py-2 text-xs font-semibold transition-all ${
                      isActive ? 'border-black bg-neutral-50' : 'border-neutral-200 hover:border-black'
                    }`}
                  >
                    {thumb && <img src={thumb} alt={v.colorName || v.name} className="w-8 h-8 object-cover rounded-sm" />}
                    <span>{v.colorName || 'Default'}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Stock urgency */}
        {totalStock > 0 && (
          <div className={`flex items-center gap-2 text-xs font-bold mb-4 ${isLowStock ? 'text-[#E63946]' : 'text-neutral-500'}`}>
            <span className={`w-2 h-2 rounded-full inline-block ${isLowStock ? 'bg-[#E63946] animate-pulse' : 'bg-green-500'}`} />
            {isLowStock ? `Only ${totalStock} pairs left — selling fast` : `${totalStock} pairs available`}
          </div>
        )}

        {/* Size Selection */}
        <div className="mb-6">
          <SizeSelector sizes={formattedSizes} onSelect={handleSizeSelect} />
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-3 mb-6">
          <button
            onClick={handleBuyNow}
            className="w-full bg-black dark:bg-white text-white dark:text-black py-4 font-black uppercase tracking-wider hover:bg-[#E63946] dark:hover:bg-[#E63946] dark:hover:text-white transition-colors flex items-center justify-center gap-2 shadow-md"
          >
            <Zap size={18} /> Buy Now
          </button>
          <button
            onClick={handleAddToCart}
            className="w-full bg-white dark:bg-neutral-900 border-2 border-black dark:border-neutral-400 text-black dark:text-white py-4 font-bold uppercase tracking-wider hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
          >
            Add to Bag
          </button>
          <button
            onClick={() => toggleItem(product.id)}
            className="w-full bg-transparent border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 py-3 font-semibold uppercase tracking-wider hover:border-black dark:hover:border-white hover:text-black dark:hover:text-white transition-colors flex justify-center items-center gap-2 text-sm"
          >
            {mounted && hasItem(product.id) ? (
              <><Heart className="fill-current text-[#E63946]" size={16} /> Saved to Wishlist</>
            ) : (
              <><Heart size={16} /> Save to Wishlist</>
            )}
          </button>
        </div>

        {/* Trust Badges */}
        <div className="grid grid-cols-3 gap-2 mb-6 p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800">
          {[
            { icon: ShieldCheck, label: '100% Authentic', sub: 'Verified' },
            { icon: Truck, label: 'Ships in 24h', sub: 'All India' },
            { icon: RefreshCcw, label: 'Easy Returns', sub: '7-day policy' },
          ].map(({ icon: Icon, label, sub }) => (
            <div key={label} className="flex flex-col items-center text-center gap-1 py-2">
              <Icon size={20} className="text-black" strokeWidth={1.5} />
              <span className="text-[10px] font-black uppercase tracking-wide leading-tight">{label}</span>
              <span className="text-[9px] text-neutral-400 uppercase">{sub}</span>
            </div>
          ))}
        </div>

        {/* Description */}
        <div className="border-t border-neutral-200 dark:border-neutral-800 pt-5">
          <h3 className="font-bold mb-2 uppercase tracking-wide text-sm">Description</h3>
          <p className="text-neutral-600 text-sm leading-relaxed whitespace-pre-wrap">
            {product.description || 'No description available for this product.'}
          </p>
        </div>

        {/* WhatsApp CTA */}
        <a
          href={`https://wa.me/919876543210?text=${encodeURIComponent(`Hi! I'm interested in ${product.name}`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 flex items-center justify-center gap-2 border border-[#25D366] text-[#25D366] py-3 text-sm font-bold uppercase tracking-wider hover:bg-[#25D366] hover:text-white transition-all duration-200"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
          </svg>
          Ask us about this product
        </a>
      </div>
    </main>
  );
}

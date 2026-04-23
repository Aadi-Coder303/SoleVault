'use client';
import { useState } from 'react';
import { X } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

interface SizeOption {
  id: string;
  label: string;
  available: boolean;
  stock?: number;
}

interface SizeSelectorProps {
  sizes: SizeOption[];
  onSelect?: (sizeId: string) => void;
}

export default function SizeSelector({ sizes, onSelect }: SizeSelectorProps) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  const handleSelect = (sizeId: string, available: boolean) => {
    if (!available) return;
    setSelectedSize(sizeId);
    if (onSelect) onSelect(sizeId);
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-end mb-3">
        <span className="font-semibold">Select Size (UK)</span>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {sizes.map((size) => (
          <button
            key={size.id}
            disabled={!size.available}
            onClick={() => handleSelect(size.id, size.available)}
            className={twMerge(
              "relative py-3 text-sm font-medium border transition-colors min-h-[48px]",
              size.available 
                ? "border-neutral-200 hover:border-black cursor-pointer bg-white text-black" 
                : "border-neutral-100 bg-neutral-50 text-neutral-400 cursor-not-allowed line-through",
              selectedSize === size.id && "bg-black text-white border-black hover:border-black"
            )}
          >
            UK {size.label}
            {size.available && size.stock && size.stock <= 3 && (
              <span className="absolute -top-2 -right-2 bg-teal-600 text-white text-[10px] px-1.5 rounded-sm">
                Few Left
              </span>
            )}
          </button>
        ))}
      </div>
      
      {/* Size Guide Link */}
      <button 
        onClick={() => setShowSizeGuide(true)}
        className="mt-4 text-sm font-semibold underline text-neutral-600 hover:text-black transition-colors"
      >
        Find My Size
      </button>

      {/* Size Guide Modal */}
      {showSizeGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white w-full max-w-lg p-6 relative shadow-xl">
            <button 
              onClick={() => setShowSizeGuide(false)}
              className="absolute top-4 right-4 hover:text-[#E63946] transition-colors"
            >
              <X size={24} />
            </button>
            <h2 className="text-xl font-bold uppercase tracking-wide mb-6">Size Guide</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="bg-neutral-100 text-neutral-600">
                    <th className="p-3 border">UK</th>
                    <th className="p-3 border">US (Men)</th>
                    <th className="p-3 border">EU</th>
                    <th className="p-3 border">CM</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['6', '7', '40', '25'],
                    ['7', '8', '41', '26'],
                    ['8', '9', '42.5', '27'],
                    ['9', '10', '44', '28'],
                    ['10', '11', '45', '29'],
                    ['11', '12', '46', '30'],
                  ].map((row, i) => (
                    <tr key={i} className="border-b">
                      {row.map((cell, j) => (
                        <td key={j} className="p-3 border">{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-neutral-500 mt-4">
              * This is a general guide. Fits may vary by brand and model. 
              We recommend checking the manufacturer's specific sizing for Nike, Adidas, or Jordan.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { formatCurrency } from '@/lib/formatCurrency';
import Image from 'next/image';
import Link from 'next/link';

export default function CheckoutPage() {
  const [pincode, setPincode] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [isFetchingPin, setIsFetchingPin] = useState(false);
  
  const { items } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const subtotal = items.reduce((sum, item) => sum + item.price, 0);

  const handlePincodeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, ''); // Only allow numbers
    setPincode(val);

    if (val.length === 6) {
      setIsFetchingPin(true);
      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${val}`);
        const data = await res.json();
        
        if (data[0].Status === 'Success') {
          // The API returns District (City) and State
          setCity(data[0].PostOffice[0].District);
          setStateName(data[0].PostOffice[0].State);
        } else {
          setCity('');
          setStateName('');
        }
      } catch (error) {
        console.error('Failed to fetch pincode data:', error);
      } finally {
        setIsFetchingPin(false);
      }
    } else {
      // Clear auto-filled values if they backspace
      if (city || stateName) {
        setCity('');
        setStateName('');
      }
    }
  };

  if (!mounted) return null;

  return (
    <main className="container mx-auto px-4 py-8 max-w-5xl">
      <h1 className="text-3xl font-bold uppercase tracking-wide mb-8">Checkout</h1>
      
      {items.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-neutral-500 mb-6">Your bag is empty.</p>
          <Link href="/products" className="bg-black text-white px-8 py-3 font-bold uppercase tracking-wider hover:bg-[#E63946] transition-colors">
            Shop Now
          </Link>
        </div>
      ) : (
      <div className="flex flex-col-reverse lg:flex-row gap-12">
        <div className="lg:w-2/3 flex flex-col gap-10">
          
          {/* Shipping Address Form (Indian Format) */}
          <section>
            <h2 className="text-xl font-bold uppercase tracking-wide mb-6">Shipping Address</h2>
            <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold mb-2">Full Name</label>
                <input type="text" className="w-full border border-neutral-300 p-3 focus:outline-none focus:border-black" placeholder="John Doe" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold mb-2">Phone Number</label>
                <input type="tel" className="w-full border border-neutral-300 p-3 focus:outline-none focus:border-black" placeholder="+91 9876543210" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold mb-2">Address Line 1</label>
                <input type="text" className="w-full border border-neutral-300 p-3 focus:outline-none focus:border-black" placeholder="Flat / House No. / Building" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold mb-2">Address Line 2 (Optional)</label>
                <input type="text" className="w-full border border-neutral-300 p-3 focus:outline-none focus:border-black" placeholder="Street, Sector, Area" />
              </div>
              <div className="relative">
                <label className="block text-sm font-semibold mb-2">Pincode</label>
                <input 
                  type="text" 
                  maxLength={6} 
                  value={pincode}
                  onChange={handlePincodeChange}
                  className="w-full border border-neutral-300 p-3 focus:outline-none focus:border-black" 
                  placeholder="400001" 
                />
                {isFetchingPin && (
                  <div className="absolute right-3 top-10 text-neutral-400">
                    <Loader2 size={18} className="animate-spin" />
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">City</label>
                <input 
                  type="text" 
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full border border-neutral-300 p-3 focus:outline-none focus:border-black" 
                  placeholder="Mumbai" 
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold mb-2">State</label>
                <input 
                  type="text" 
                  value={stateName}
                  onChange={(e) => setStateName(e.target.value)}
                  className="w-full border border-neutral-300 p-3 focus:outline-none focus:border-black bg-white" 
                  placeholder="Maharashtra"
                />
              </div>
            </form>
          </section>

          {/* Shipping Module Placeholder */}
          <section>
            <h2 className="text-xl font-bold uppercase tracking-wide mb-6">Shipping Method</h2>
            <div className="border border-neutral-300 p-4 flex justify-between items-center cursor-pointer bg-neutral-50">
              <div>
                <p className="font-bold">Standard Delivery</p>
                <p className="text-sm text-neutral-500">Delivered in 3-5 business days</p>
              </div>
              <span className="font-bold">Free</span>
            </div>
            {/* TODO: Integrate Shiprocket/Delhivery here in a future phase */}
          </section>

          {/* Payment Module Placeholder (Razorpay) */}
          <section>
            <h2 className="text-xl font-bold uppercase tracking-wide mb-6">Payment</h2>
            <div className="bg-neutral-50 p-6 border border-neutral-200 text-center">
              <p className="text-neutral-600 mb-4">Secure payment powered by Razorpay</p>
              <p className="text-sm text-neutral-500 mb-4">(Supports UPI, Cards, Netbanking, Wallets)</p>
              <button className="bg-black text-white px-8 py-3 font-bold uppercase tracking-wider hover:bg-[#E63946] transition-colors">
                Pay Now
              </button>
            </div>
          </section>

        </div>

        {/* Order Summary */}
        <div className="lg:w-1/3">
          <div className="bg-neutral-50 p-6 sticky top-8">
            <h2 className="text-lg font-bold uppercase tracking-wide mb-6">Order Summary</h2>
            
            <div className="flex flex-col gap-4 mb-6 border-b border-neutral-200 pb-6 max-h-[40vh] overflow-y-auto pr-2">
              {items.map(item => (
                <div key={item.id} className="flex gap-4">
                  <div className="w-16 h-16 bg-neutral-200 flex-shrink-0 relative">
                    {item.imageUrl ? (
                      <Image src={item.imageUrl.split(',')[0]} alt={item.name} fill className="object-cover" />
                    ) : null}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-sm leading-tight">{item.name}</h3>
                    <p className="text-xs text-neutral-500 my-1">Size: {item.size}</p>
                    <span className="font-bold text-sm">{formatCurrency(item.price)}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600">Subtotal</span>
                <span className="font-semibold">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600">Shipping</span>
                <span className="font-semibold text-green-600">Free</span>
              </div>
            </div>
            
            <div className="border-t border-neutral-200 pt-4 flex justify-between items-center">
              <span className="font-bold uppercase tracking-wide">Total</span>
              <span className="text-xl font-bold">{formatCurrency(subtotal)}</span>
            </div>
          </div>
        </div>
      </div>
      )}
    </main>
  );
}

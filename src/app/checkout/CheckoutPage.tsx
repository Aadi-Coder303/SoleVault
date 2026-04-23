'use client';
import { useState, useEffect, useRef } from 'react';
import { Loader2, ShieldCheck, Truck, CreditCard } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { formatCurrency } from '@/lib/formatCurrency';
import Image from 'next/image';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useSearchParams } from 'next/navigation';

export default function CheckoutPage() {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address1, setAddress1] = useState('');
  const [address2, setAddress2] = useState('');
  const [pincode, setPincode] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [isFetchingPin, setIsFetchingPin] = useState(false);
  const [isCheckingRisk, setIsCheckingRisk] = useState(false);
  const [isInitiatingPayment, setIsInitiatingPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'cod'>('online');
  const [allowCod, setAllowCod] = useState(true);
  const [mounted, setMounted] = useState(false);

  const payuFormRef = useRef<HTMLFormElement>(null);
  const [payuParams, setPayuParams] = useState<Record<string, string> | null>(null);

  const { items } = useCartStore();
  const searchParams = useSearchParams();

  useEffect(() => {
    setMounted(true);
    if (searchParams.get('payment_failed') === 'true') {
      toast.error('Payment failed or was cancelled. Please try again.');
    }
  }, [searchParams]);

  useEffect(() => {
    if (payuParams && payuFormRef.current) {
      payuFormRef.current.submit();
    }
  }, [payuParams]);

  const subtotal = items.reduce((sum, item) => sum + item.price, 0);

  const handlePincodeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    setPincode(val);
    if (val.length === 6) {
      setIsFetchingPin(true);
      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${val}`);
        const data = await res.json();
        if (data[0].Status === 'Success') {
          setCity(data[0].PostOffice[0].District);
          setStateName(data[0].PostOffice[0].State);

          if (phone.length >= 10) {
            setIsCheckingRisk(true);
            try {
              const riskRes = await fetch('/api/gokwik/risk', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone, pincode: val, amount: subtotal }),
              });
              const riskData = await riskRes.json();
              setAllowCod(riskData.allowCod ?? true);
              if (!riskData.allowCod) {
                toast('COD not available for this address.', { icon: 'ℹ️' });
                setPaymentMethod('online');
              }
            } catch { setAllowCod(true); } finally { setIsCheckingRisk(false); }
          }
        } else { setCity(''); setStateName(''); }
      } catch (err) { console.error(err); } finally { setIsFetchingPin(false); }
    } else { setCity(''); setStateName(''); }
  };

  const handlePayNow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone || !email || !address1 || !pincode || !city || !stateName) {
      toast.error('Please fill in all required fields.'); return;
    }
    if (items.length === 0) { toast.error('Your bag is empty.'); return; }

    const fullAddress = `${address1}${address2 ? ', ' + address2 : ''}, ${city}, ${stateName} - ${pincode}`;

    if (paymentMethod === 'cod') {
      // Save COD order to DB — inventory will stay until owner confirms
      try {
        await fetch('/api/orders/cod', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fullName, email, phone,
            address: fullAddress,
            amount: subtotal,
            items: items.map(i => ({ productId: i.productId, name: i.name, size: i.size, price: i.price, qty: 1 })),
          }),
        });
      } catch { /* non-blocking */ }
      toast.success('Order placed! We will confirm via SMS shortly.');
      return;
    }

    setIsInitiatingPayment(true);
    try {
      const productinfo = items.map(i => `${i.name} (${i.size})`).join(', ').substring(0, 100);
      const res = await fetch('/api/payment/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: subtotal.toFixed(2),
          productinfo,
          firstname: fullName.split(' ')[0],
          email,
          phone,
          address: fullAddress,
          // Pass full items so success route can decrement stock
          items: items.map(i => ({ productId: i.productId, name: i.name, size: i.size, price: i.price, qty: 1 })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to initiate payment');
      setPayuParams(data);
    } catch (err: any) {
      toast.error(err.message || 'Payment initiation failed.');
      setIsInitiatingPayment(false);
    }
  };

  if (!mounted) return null;

  return (
    <main className="container mx-auto px-4 py-8 max-w-5xl">
      <h1 className="text-3xl font-bold uppercase tracking-wide mb-2">Checkout</h1>
      <p className="text-sm text-neutral-500 mb-8 flex items-center gap-1.5">
        <ShieldCheck size={14} className="text-green-500" /> Secured by PayU &amp; GoKwik
      </p>

      {payuParams && (
        <form ref={payuFormRef} method="POST" action={payuParams.payuBase} className="hidden">
          {Object.entries(payuParams).map(([k, v]) =>
            k !== 'payuBase' ? <input key={k} type="hidden" name={k} value={v} /> : null
          )}
          <input type="hidden" name="service_provider" value="payu_paisa" />
        </form>
      )}

      {items.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-neutral-500 mb-6">Your bag is empty.</p>
          <Link href="/products" className="bg-black text-white px-8 py-3 font-bold uppercase tracking-wider hover:bg-[#E63946] transition-colors">Shop Now</Link>
        </div>
      ) : (
        <form onSubmit={handlePayNow}>
          <div className="flex flex-col-reverse lg:flex-row gap-12">
            <div className="lg:w-2/3 flex flex-col gap-8">
              <section>
                <h2 className="text-xl font-bold uppercase tracking-wide mb-6 flex items-center gap-2"><Truck size={18} /> Shipping Address</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2"><label className="block text-sm font-semibold mb-2">Full Name *</label><input required type="text" value={fullName} onChange={e => setFullName(e.target.value)} className="w-full border border-neutral-300 p-3 focus:outline-none focus:border-black" placeholder="Aadi Golecha" /></div>
                  <div><label className="block text-sm font-semibold mb-2">Phone *</label><input required type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full border border-neutral-300 p-3 focus:outline-none focus:border-black" placeholder="+91 9876543210" /></div>
                  <div><label className="block text-sm font-semibold mb-2">Email *</label><input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full border border-neutral-300 p-3 focus:outline-none focus:border-black" placeholder="you@email.com" /></div>
                  <div className="md:col-span-2"><label className="block text-sm font-semibold mb-2">Address Line 1 *</label><input required type="text" value={address1} onChange={e => setAddress1(e.target.value)} className="w-full border border-neutral-300 p-3 focus:outline-none focus:border-black" placeholder="Flat / House No. / Building" /></div>
                  <div className="md:col-span-2"><label className="block text-sm font-semibold mb-2">Address Line 2</label><input type="text" value={address2} onChange={e => setAddress2(e.target.value)} className="w-full border border-neutral-300 p-3 focus:outline-none focus:border-black" placeholder="Street, Sector, Area" /></div>
                  <div className="relative">
                    <label className="block text-sm font-semibold mb-2">Pincode *</label>
                    <input required type="text" maxLength={6} value={pincode} onChange={handlePincodeChange} className="w-full border border-neutral-300 p-3 focus:outline-none focus:border-black" placeholder="400001" />
                    {(isFetchingPin || isCheckingRisk) && <div className="absolute right-3 top-10 text-neutral-400"><Loader2 size={18} className="animate-spin" /></div>}
                  </div>
                  <div><label className="block text-sm font-semibold mb-2">City</label><input type="text" value={city} onChange={e => setCity(e.target.value)} className="w-full border border-neutral-300 p-3 focus:outline-none focus:border-black" placeholder="Mumbai" /></div>
                  <div className="md:col-span-2"><label className="block text-sm font-semibold mb-2">State</label><input type="text" value={stateName} onChange={e => setStateName(e.target.value)} className="w-full border border-neutral-300 p-3 focus:outline-none focus:border-black" placeholder="Maharashtra" /></div>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-bold uppercase tracking-wide mb-6 flex items-center gap-2"><CreditCard size={18} /> Payment Method</h2>
                <div className="flex flex-col gap-3">
                  <label className={`flex items-start gap-4 border p-4 cursor-pointer transition-all ${paymentMethod === 'online' ? 'border-black bg-neutral-50' : 'border-neutral-200 hover:border-neutral-400'}`}>
                    <input type="radio" name="payment" value="online" checked={paymentMethod === 'online'} onChange={() => setPaymentMethod('online')} className="mt-1 accent-black" />
                    <div>
                      <p className="font-bold">Online Payment</p>
                      <p className="text-xs text-neutral-500 mt-0.5">UPI, Credit/Debit Cards, Netbanking, Wallets</p>
                      <div className="flex gap-2 mt-2 flex-wrap">{['UPI', 'Visa', 'Mastercard', 'RuPay', 'Netbanking'].map(m => <span key={m} className="text-[10px] font-bold uppercase tracking-wide bg-neutral-200 px-2 py-0.5 rounded-sm">{m}</span>)}</div>
                    </div>
                  </label>
                  {allowCod && (
                    <label className={`flex items-start gap-4 border p-4 cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-black bg-neutral-50' : 'border-neutral-200 hover:border-neutral-400'}`}>
                      <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="mt-1 accent-black" />
                      <div>
                        <p className="font-bold">Cash on Delivery</p>
                        <p className="text-xs text-neutral-500 mt-0.5">Pay when your order arrives · No extra charges</p>
                        {isCheckingRisk && <p className="text-xs text-neutral-400 mt-1">Checking availability…</p>}
                      </div>
                    </label>
                  )}
                  <p className="text-xs text-neutral-400 flex items-center gap-1 mt-1">
                    <ShieldCheck size={12} className="text-green-500" /> Powered by <strong>PayU</strong> &amp; <strong>GoKwik</strong> · 256-bit SSL Secured
                  </p>
                </div>
              </section>
            </div>

            <div className="lg:w-1/3">
              <div className="bg-neutral-50 p-6 sticky top-8">
                <h2 className="text-lg font-bold uppercase tracking-wide mb-6">Order Summary</h2>
                <div className="flex flex-col gap-4 mb-6 border-b border-neutral-200 pb-6 max-h-[40vh] overflow-y-auto pr-1">
                  {items.map(item => (
                    <div key={item.id} className="flex gap-4">
                      <div className="w-16 h-16 bg-neutral-200 flex-shrink-0 relative">
                        {item.imageUrl && <Image src={item.imageUrl.split(',')[0]} alt={item.name} fill className="object-cover" />}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-sm leading-tight">{item.name}</h3>
                        <p className="text-xs text-neutral-500 my-1">Size: {item.size}</p>
                        <span className="font-bold text-sm">{formatCurrency(item.price)}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="space-y-3 mb-6 text-sm">
                  <div className="flex justify-between"><span className="text-neutral-600">Subtotal</span><span className="font-semibold">{formatCurrency(subtotal)}</span></div>
                  <div className="flex justify-between"><span className="text-neutral-600">Shipping</span><span className="font-semibold text-green-600">Free</span></div>
                </div>
                <div className="border-t border-neutral-200 pt-4 flex justify-between items-center mb-6">
                  <span className="font-bold uppercase tracking-wide">Total</span>
                  <span className="text-xl font-bold">{formatCurrency(subtotal)}</span>
                </div>
                <button type="submit" disabled={isInitiatingPayment} className="w-full bg-black text-white py-4 font-bold uppercase tracking-wider hover:bg-[#E63946] transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
                  {isInitiatingPayment ? <><Loader2 size={18} className="animate-spin" /> Redirecting…</> : paymentMethod === 'cod' ? 'Place Order (COD)' : 'Pay Now →'}
                </button>
                <p className="text-[10px] text-neutral-400 text-center mt-3">By placing your order you agree to our Terms &amp; Privacy Policy</p>
              </div>
            </div>
          </div>
        </form>
      )}
    </main>
  );
}

'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Loader2, ShieldCheck, Truck, CreditCard, MapPin, AlertTriangle } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { formatCurrency } from '@/lib/formatCurrency';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useSearchParams, useRouter } from 'next/navigation';

interface SavedAddress {
  name?: string;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  phone?: string;
  email?: string;
}

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
  const [isInitiatingPayment, setIsInitiatingPayment] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [codRequested, setCodRequested] = useState(false);
  const [isRequestingCod, setIsRequestingCod] = useState(false);

  // Stock validation state
  const [outOfStockItems, setOutOfStockItems] = useState<string[]>([]);
  const [isValidatingStock, setIsValidatingStock] = useState(false);

  // GoKwik address prefill state
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [isFetchingAddresses, setIsFetchingAddresses] = useState(false);
  const [addressFetched, setAddressFetched] = useState(false);

  const payuFormRef = useRef<HTMLFormElement>(null);
  const [payuParams, setPayuParams] = useState<Record<string, string> | null>(null);

  const { items, removeItem, clearCart } = useCartStore();
  const searchParams = useSearchParams();
  const router = useRouter();
  const itemsRef = useRef(items);
  itemsRef.current = items;

  // Validate stock once on mount only
  const validateStock = useCallback(async () => {
    const currentItems = itemsRef.current;
    if (currentItems.length === 0) return;
    setIsValidatingStock(true);
    try {
      const productIds = [...new Set(currentItems.map(i => i.productId))];
      const res = await fetch(`/api/products?ids=${productIds.join(',')}`);
      if (!res.ok) return;
      const products = await res.json();

      const oosIds: string[] = [];
      for (const item of currentItems) {
        const product = products.find((p: any) => p.id === item.productId);
        if (!product) {
          oosIds.push(item.id);
          continue;
        }
        const sizes = product.sizes || {};
        const stock = sizes[item.size] ?? 0;
        if (stock <= 0) {
          oosIds.push(item.id);
        }
      }

      if (oosIds.length > 0) {
        setOutOfStockItems(oosIds);
        toast.error(`${oosIds.length} item(s) in your bag are out of stock.`);
      }
    } catch {
      // Non-blocking
    } finally {
      setIsValidatingStock(false);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    if (searchParams.get('payment_failed') === 'true') {
      toast.error('Payment failed or was cancelled. Please try again.');
    }
  }, [searchParams]);

  useEffect(() => {
    if (mounted) {
      validateStock();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  useEffect(() => {
    if (payuParams && payuFormRef.current) {
      payuFormRef.current.submit();
    }
  }, [payuParams]);

  // Filter out out-of-stock items for pricing
  const validItems = items.filter(i => !outOfStockItems.includes(i.id));
  const subtotal = validItems.reduce((sum, item) => sum + item.price, 0);

  // Fetch GoKwik saved addresses when phone has 10 digits
  const handlePhoneChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhone(val);

    if (val.length === 10 && !addressFetched) {
      setIsFetchingAddresses(true);
      try {
        const res = await fetch('/api/gokwik/address', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: val, email }),
        });
        const data = await res.json();
        if (data.addresses && data.addresses.length > 0) {
          setSavedAddresses(data.addresses);
          toast.success('Found saved address(es)!', { icon: '📍' });
        }
        setAddressFetched(true);
      } catch {
        // Fail silently
      } finally {
        setIsFetchingAddresses(false);
      }
    }
  };

  const applySavedAddress = (addr: SavedAddress) => {
    if (addr.name) setFullName(addr.name);
    if (addr.address1) setAddress1(addr.address1);
    if (addr.address2) setAddress2(addr.address2);
    if (addr.pincode) {
      setPincode(addr.pincode);
      // Trigger pincode auto-fill for city/state
      fetchPincodeData(addr.pincode);
    }
    if (addr.city) setCity(addr.city);
    if (addr.state) setStateName(addr.state);
    if (addr.email && !email) setEmail(addr.email);
    setSavedAddresses([]); // Hide the selector after picking
    toast.success('Address applied!');
  };

  const fetchPincodeData = async (pin: string) => {
    setIsFetchingPin(true);
    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
      const data = await res.json();
      if (data[0].Status === 'Success') {
        setCity(data[0].PostOffice[0].District);
        setStateName(data[0].PostOffice[0].State);
      }
    } catch (err) { console.error(err); } finally { setIsFetchingPin(false); }
  };

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
        } else { setCity(''); setStateName(''); }
      } catch (err) { console.error(err); } finally { setIsFetchingPin(false); }
    } else { setCity(''); setStateName(''); }
  };

  const handlePayNow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone || !email || !address1 || !pincode || !city || !stateName) {
      toast.error('Please fill in all required fields.'); return;
    }
    if (validItems.length === 0) { toast.error('Your bag is empty or all items are out of stock.'); return; }
    if (outOfStockItems.length > 0) {
      toast.error('Please remove out-of-stock items before placing your order.'); return;
    }

    const fullPhone = `+91${phone.replace(/\D/g, '')}`;
    const fullAddress = `${address1}${address2 ? ', ' + address2 : ''}, ${city}, ${stateName} - ${pincode}`;

    // All orders are prepaid — online payment only
    setIsInitiatingPayment(true);
    try {
      const productinfo = validItems.map(i => `${i.name} (${i.size})`).join(', ').substring(0, 100);
      const res = await fetch('/api/payment/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: subtotal.toFixed(2),
          productinfo,
          firstname: fullName.split(' ')[0],
          email,
          phone: fullPhone,
          address: fullAddress,
          // Pass full items so success route can decrement stock
          items: validItems.map(i => ({ productId: i.productId, name: i.name, size: i.size, price: i.price, qty: 1 })),
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

                {/* GoKwik Saved Addresses */}
                {savedAddresses.length > 0 && (
                  <div className="mb-6 border border-green-200 bg-green-50 p-4 rounded-sm">
                    <p className="text-sm font-semibold text-green-800 mb-3 flex items-center gap-2">
                      <MapPin size={14} /> Saved Address{savedAddresses.length > 1 ? 'es' : ''} Found
                    </p>
                    <div className="flex flex-col gap-2">
                      {savedAddresses.map((addr, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => applySavedAddress(addr)}
                          className="text-left bg-white border border-green-200 p-3 hover:border-green-500 hover:bg-green-50 transition-all text-sm rounded-sm"
                        >
                          <p className="font-semibold">{addr.name || 'Saved Address'}</p>
                          <p className="text-neutral-600 text-xs mt-0.5">
                            {[addr.address1, addr.address2, addr.city, addr.state, addr.pincode].filter(Boolean).join(', ')}
                          </p>
                        </button>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => setSavedAddresses([])}
                      className="text-xs text-neutral-500 hover:text-black underline mt-2"
                    >
                      Enter address manually instead
                    </button>
                  </div>
                )}

                {isFetchingAddresses && (
                  <div className="mb-4 flex items-center gap-2 text-sm text-neutral-500">
                    <Loader2 size={14} className="animate-spin" /> Looking up saved addresses…
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2"><label className="block text-sm font-semibold mb-2">Full Name *</label><input required type="text" value={fullName} onChange={e => setFullName(e.target.value)} className="w-full border border-neutral-300 p-3 focus:outline-none focus:border-black" placeholder="Aadi Golecha" /></div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Phone *</label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 bg-neutral-100 border border-r-0 border-neutral-300 text-sm font-semibold text-neutral-600 select-none">+91</span>
                      <input required type="tel" maxLength={10} value={phone} onChange={handlePhoneChange} className="w-full border border-neutral-300 p-3 focus:outline-none focus:border-black" placeholder="9876543210" />
                    </div>
                  </div>
                  <div><label className="block text-sm font-semibold mb-2">Email *</label><input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full border border-neutral-300 p-3 focus:outline-none focus:border-black" placeholder="you@email.com" /></div>
                  <div className="md:col-span-2"><label className="block text-sm font-semibold mb-2">Address Line 1 *</label><input required type="text" value={address1} onChange={e => setAddress1(e.target.value)} className="w-full border border-neutral-300 p-3 focus:outline-none focus:border-black" placeholder="Flat / House No. / Building" /></div>
                  <div className="md:col-span-2"><label className="block text-sm font-semibold mb-2">Address Line 2</label><input type="text" value={address2} onChange={e => setAddress2(e.target.value)} className="w-full border border-neutral-300 p-3 focus:outline-none focus:border-black" placeholder="Street, Sector, Area" /></div>
                  <div className="relative">
                    <label className="block text-sm font-semibold mb-2">Pincode *</label>
                    <input required type="text" maxLength={6} value={pincode} onChange={handlePincodeChange} className="w-full border border-neutral-300 p-3 focus:outline-none focus:border-black" placeholder="400001" />
                    {isFetchingPin && <div className="absolute right-3 top-10 text-neutral-400"><Loader2 size={18} className="animate-spin" /></div>}
                  </div>
                  <div><label className="block text-sm font-semibold mb-2">City</label><input type="text" readOnly value={city} className="w-full border border-neutral-300 p-3 focus:outline-none bg-neutral-50 text-neutral-700 cursor-not-allowed" placeholder="Auto-filled from pincode" /></div>
                  <div className="md:col-span-2"><label className="block text-sm font-semibold mb-2">State</label><input type="text" readOnly value={stateName} className="w-full border border-neutral-300 p-3 focus:outline-none bg-neutral-50 text-neutral-700 cursor-not-allowed" placeholder="Auto-filled from pincode" /></div>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-bold uppercase tracking-wide mb-6 flex items-center gap-2"><CreditCard size={18} /> Payment</h2>
                <div className="flex flex-col gap-3">
                  <div className="border border-black bg-neutral-50 p-4">
                    <p className="font-bold">Online Payment (Prepaid)</p>
                    <p className="text-xs text-neutral-500 mt-0.5">UPI, Credit/Debit Cards, Netbanking, Wallets</p>
                    <div className="flex gap-2 mt-2 flex-wrap">{['UPI', 'Visa', 'Mastercard', 'RuPay', 'Netbanking'].map(m => <span key={m} className="text-[10px] font-bold uppercase tracking-wide bg-neutral-200 px-2 py-0.5 rounded-sm">{m}</span>)}</div>
                  </div>

                  {/* Request COD */}
                  {!codRequested ? (
                    <button
                      type="button"
                      disabled={isRequestingCod || !fullName || !phone || !email || !address1 || !pincode}
                      onClick={async () => {
                        if (!fullName || !phone || !email || !address1 || !pincode || !city || !stateName) {
                          toast.error('Please fill shipping details first.'); return;
                        }
                        if (validItems.length === 0) { toast.error('Your bag is empty.'); return; }
                        setIsRequestingCod(true);
                        try {
                          const fullPhone = `+91${phone.replace(/\D/g, '')}`;
                          const fullAddress = `${address1}${address2 ? ', ' + address2 : ''}, ${city}, ${stateName} - ${pincode}`;
                          await fetch('/api/orders/cod', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              fullName, email, phone: fullPhone, address: fullAddress, amount: subtotal,
                              items: validItems.map(i => ({ productId: i.productId, name: i.name, size: i.size, price: i.price, qty: 1 })),
                              codRequest: true,
                            }),
                          });
                          setCodRequested(true);
                          toast.success('COD request submitted! We will contact you to confirm.');
                        } catch { toast.error('Failed to submit request.'); }
                        finally { setIsRequestingCod(false); }
                      }}
                      className="border border-neutral-300 p-4 text-left hover:border-neutral-400 transition-colors disabled:opacity-50"
                    >
                      <p className="font-bold text-sm">Request Cash on Delivery</p>
                      <p className="text-xs text-neutral-500 mt-0.5">Subject to approval · We'll confirm via SMS/WhatsApp</p>
                      <p className="text-[11px] text-amber-600 mt-1.5 font-medium">⚠ Stock is not reserved for COD requests. Items may go out of stock before approval.</p>
                      {isRequestingCod && <p className="text-xs text-neutral-400 mt-1 flex items-center gap-1"><Loader2 size={12} className="animate-spin" /> Submitting…</p>}
                    </button>
                  ) : (
                    <div className="border border-green-300 bg-green-50 p-4 text-sm text-green-800 font-semibold">
                      ✓ COD request submitted — you'll receive a confirmation shortly. Or pay now to confirm instantly.
                    </div>
                  )}

                  <p className="text-xs text-neutral-400 flex items-center gap-1 mt-1">
                    <ShieldCheck size={12} className="text-green-500" /> Powered by <strong>PayU</strong> · 256-bit SSL Secured
                  </p>
                </div>
              </section>
            </div>

            <div className="lg:w-1/3">
              <div className="bg-neutral-50 p-6 sticky top-8">
                <h2 className="text-lg font-bold uppercase tracking-wide mb-6">Order Summary</h2>
                {isValidatingStock && (
                  <div className="flex items-center gap-2 text-sm text-neutral-500 mb-4">
                    <Loader2 size={14} className="animate-spin" /> Checking stock availability…
                  </div>
                )}
                <div className="flex flex-col gap-4 mb-6 border-b border-neutral-200 pb-6 max-h-[40vh] overflow-y-auto pr-1">
                  {items.map(item => {
                    const isOOS = outOfStockItems.includes(item.id);
                    const imgSrc = item.imageUrl ? item.imageUrl.split(',')[0].trim() : '';
                    return (
                      <div key={item.id} className={`flex gap-4 ${isOOS ? 'opacity-50' : ''}`}>
                        <div className="w-16 h-16 bg-neutral-200 flex-shrink-0 relative overflow-hidden">
                          {imgSrc && <img src={imgSrc} alt={item.name} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-sm leading-tight">{item.name}</h3>
                          <p className="text-xs text-neutral-500 my-1">Size: {item.size}</p>
                          {isOOS ? (
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-[#E63946] flex items-center gap-1"><AlertTriangle size={12} /> Out of Stock</span>
                              <button type="button" onClick={() => removeItem(item.id)} className="text-xs underline text-neutral-500 hover:text-black ml-2">Remove</button>
                            </div>
                          ) : (
                            <span className="font-bold text-sm">{formatCurrency(item.price)}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
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
                  {isInitiatingPayment ? <><Loader2 size={18} className="animate-spin" /> Redirecting…</> : 'Pay Now →'}
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

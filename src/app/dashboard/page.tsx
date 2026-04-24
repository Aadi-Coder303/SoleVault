'use client';

import { useState, useEffect } from 'react';
import { Loader2, Plus, Minus, Edit2, RefreshCw, Trash2, ToggleLeft, ToggleRight, Tag, Eye, ShoppingCart, Copy, ClipboardCheck } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { OWNER_EMAILS } from '@/lib/constants';
import toast from 'react-hot-toast';
import { formatCurrency } from '@/lib/formatCurrency';

const MEN_SIZES = ['UK 6', 'UK 6.5', 'UK 7', 'UK 7.5', 'UK 8', 'UK 8.5', 'UK 9', 'UK 9.5', 'UK 10', 'UK 10.5', 'UK 11', 'UK 12'];
const WOMEN_SIZES = ['UK 3', 'UK 3.5', 'UK 4', 'UK 4.5', 'UK 5', 'UK 5.5', 'UK 6', 'UK 6.5', 'UK 7', 'UK 7.5', 'UK 8'];
const KIDS_SIZES = ['UK 1', 'UK 1.5', 'UK 2', 'UK 2.5', 'UK 3', 'UK 3.5', 'UK 4', 'UK 4.5', 'UK 5', 'UK 5.5'];

const getActiveSizes = (category: string) => {
  if (category.toLowerCase() === 'women') return WOMEN_SIZES;
  if (category.toLowerCase() === 'kids') return KIDS_SIZES;
  return MEN_SIZES;
};

interface ProductData {
  id: string; name: string; brand: string; price: number;
  description: string; imageUrl: string | null; category: string;
  sizes: Record<string, number | { stock: number; price: number }>;
  colorName?: string | null;
  parentId?: string | null;
}

interface OrderData {
  id: string; txnid: string; status: string; amount: number;
  customerName: string; customerEmail: string; customerPhone: string;
  address: string; items: any[]; createdAt: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState<'inventory' | 'pending' | 'confirmed' | 'shipped' | 'coupons' | 'activity'>('pending');
  const [products, setProducts] = useState<ProductData[]>([]);
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);

  // Live analytics
  const [liveVisitors, setLiveVisitors] = useState(0);
  const [visitorDetails, setVisitorDetails] = useState<any[]>([]);
  const [cartEvents, setCartEvents] = useState<any[]>([]);
  const [isLoadingActivity, setIsLoadingActivity] = useState(true);

  // Coupon state
  const [coupons, setCoupons] = useState<any[]>([]);
  const [isLoadingCoupons, setIsLoadingCoupons] = useState(true);
  const [isSavingCoupon, setIsSavingCoupon] = useState(false);
  const [couponForm, setCouponForm] = useState({ code: '', discountType: 'percent', discountValue: '', minOrderValue: '', maxUses: '', expiresAt: '' });

  // Form State
  const [url, setUrl] = useState('');
  const [isScraping, setIsScraping] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', brand: '', price: '', description: '', imageUrl: '', category: 'Men' });
  const [sizes, setSizes] = useState<Record<string, number | { stock: number; price: number }>>({});
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  // Color variant state
  const [isColorVariant, setIsColorVariant] = useState(false);
  const [colorName, setColorName] = useState('');
  const [parentId, setParentId] = useState<string | null>(null);

  // Per-size pricing state
  const [perSizePricing, setPerSizePricing] = useState(false);

  const fetchProducts = async () => {
    setIsLoadingProducts(true);
    try {
      const res = await fetch('/api/products');
      if (res.ok) setProducts(await res.json());
    } catch (e) { console.error(e); }
    finally { setIsLoadingProducts(false); }
  };

  const fetchOrders = async () => {
    setIsLoadingOrders(true);
    try {
      const res = await fetch('/api/orders?all=true');
      if (res.ok) setOrders(await res.json());
    } catch (e) { console.error(e); }
    finally { setIsLoadingOrders(false); }
  };

  const fetchCoupons = async () => {
    setIsLoadingCoupons(true);
    try {
      const res = await fetch('/api/coupons');
      if (res.ok) setCoupons(await res.json());
    } catch (e) { console.error(e); }
    finally { setIsLoadingCoupons(false); }
  };

  const fetchLiveData = async () => {
    try {
      const [heartbeatRes, cartRes] = await Promise.all([
        fetch('/api/analytics/heartbeat'),
        fetch('/api/analytics/cart-event'),
      ]);
      if (heartbeatRes.ok) {
        const data = await heartbeatRes.json();
        setLiveVisitors(data.count);
        setVisitorDetails(data.visitors || []);
      }
      if (cartRes.ok) {
        setCartEvents(await cartRes.json());
      }
    } catch (e) { console.error(e); }
    finally { setIsLoadingActivity(false); }
  };

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.email || !OWNER_EMAILS.includes(session.user.email)) {
        router.push('/');
      }
    };
    checkAuth();
    fetchProducts();
    fetchOrders();
    fetchCoupons();
    fetchLiveData();
    // Poll live data every 15 seconds
    const liveInterval = setInterval(fetchLiveData, 15000);
    return () => clearInterval(liveInterval);
  }, [supabase.auth, router]);

  const handleScrape = async () => {
    if (!url) return toast.error('Please enter a URL first.');
    setIsScraping(true);
    try {
      const res = await fetch('/api/scrape', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url }) });
      const result = await res.json();
      if (res.ok && result.success) {
        setFormData({ ...formData, name: result.data.title || '', brand: result.data.brand || '', description: result.data.description || '', imageUrl: (result.data.images?.length > 0) ? result.data.images.slice(0, 4).join(',') : (result.data.image || '') });
        toast.success('Data fetched! Review details and set sizes.');
      } else { toast.error(result.error || 'Failed to fetch data.'); }
    } catch { toast.error('Error fetching data.'); }
    finally { setIsScraping(false); }
  };

  const handleSizeChange = (size: string, delta: number) => {
    setSizes(prev => {
      const current = prev[size];
      if (perSizePricing) {
        const obj = typeof current === 'object' ? current : { stock: (current as number) || 0, price: Number(formData.price) || 0 };
        return { ...prev, [size]: { ...obj, stock: Math.max(0, obj.stock + delta) } };
      }
      return { ...prev, [size]: Math.max(0, ((current as number) || 0) + delta) };
    });
  };

  const handleSizePriceChange = (size: string, price: string) => {
    setSizes(prev => {
      const current = prev[size];
      const obj = typeof current === 'object' ? current : { stock: (current as number) || 0, price: Number(formData.price) || 0 };
      return { ...prev, [size]: { ...obj, price: Number(price) || 0 } };
    });
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const method = editingId ? 'PUT' : 'POST';
      const body = {
        ...(editingId ? { id: editingId } : {}),
        name: formData.name, brand: formData.brand, price: Number(formData.price),
        description: formData.description, imageUrl: formData.imageUrl, category: formData.category,
        sizes,
        colorName: isColorVariant ? colorName : null,
        parentId: isColorVariant ? parentId : null,
      };
      const res = await fetch('/api/products', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error('Failed');
      toast.success(`Product ${editingId ? 'updated' : 'added'}!`);
      setEditingId(null); setUrl(''); setFormData({ name: '', brand: '', price: '', description: '', imageUrl: '', category: 'Men' }); setSizes({});
      setIsColorVariant(false); setColorName(''); setParentId(null); setPerSizePricing(false);
      fetchProducts();
    } catch { toast.error('Error saving product.'); }
    finally { setIsSaving(false); }
  };

  const handleEdit = (p: ProductData) => {
    setEditingId(p.id);
    setFormData({ name: p.name, brand: p.brand, price: p.price.toString(), description: p.description, imageUrl: p.imageUrl || '', category: p.category || 'Men' });
    setSizes(p.sizes || {});
    // Detect color variant
    setIsColorVariant(!!(p.colorName || p.parentId));
    setColorName(p.colorName || '');
    setParentId(p.parentId || null);
    // Detect per-size pricing
    const sizeVals = Object.values(p.sizes || {});
    const hasPricedSizes = sizeVals.length > 0 && typeof sizeVals[0] === 'object';
    setPerSizePricing(hasPricedSizes);
    setActiveTab('inventory');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null); setFormData({ name: '', brand: '', price: '', description: '', imageUrl: '', category: 'Men' }); setSizes({});
    setIsColorVariant(false); setColorName(''); setParentId(null); setPerSizePricing(false);
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    setUpdatingOrderId(orderId);
    try {
      const res = await fetch('/api/orders/update', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orderId, status: newStatus }) });
      if (res.ok) {
        toast.success(`Order updated to ${newStatus}!`);
        fetchOrders();
      } else { toast.error('Failed to update order.'); }
    } catch { toast.error('Error updating order.'); }
    finally { setUpdatingOrderId(null); }
  };

  // Stats
  const pendingOrders = orders.filter(o => ['pending', 'cod_pending', 'cod_requested'].includes(o.status));
  const confirmedOrders = orders.filter(o => ['paid', 'confirmed'].includes(o.status));
  const shippedOrders = orders.filter(o => ['shipped', 'delivered'].includes(o.status));
  const totalRevenue = orders.filter(o => ['paid', 'confirmed', 'shipped', 'delivered'].includes(o.status)).reduce((s, o) => s + o.amount, 0);
  const activeCoupons = coupons.filter(c => c.isActive).length;

  // Coupon handlers
  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingCoupon(true);
    try {
      const res = await fetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(couponForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      toast.success('Coupon created!');
      setCouponForm({ code: '', discountType: 'percent', discountValue: '', minOrderValue: '', maxUses: '', expiresAt: '' });
      fetchCoupons();
    } catch (err: any) { toast.error(err.message || 'Error creating coupon.'); }
    finally { setIsSavingCoupon(false); }
  };

  const handleToggleCoupon = async (id: string, isActive: boolean) => {
    try {
      await fetch('/api/coupons', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, isActive: !isActive }) });
      toast.success(`Coupon ${isActive ? 'deactivated' : 'activated'}!`);
      fetchCoupons();
    } catch { toast.error('Failed to update coupon.'); }
  };

  const handleDeleteCoupon = async (id: string) => {
    if (!confirm('Delete this coupon?')) return;
    try {
      await fetch(`/api/coupons?id=${id}`, { method: 'DELETE' });
      toast.success('Coupon deleted!');
      fetchCoupons();
    } catch { toast.error('Failed to delete coupon.'); }
  };

  const renderOrders = (list: OrderData[], tab: string) => (
    <div className="border border-neutral-200 overflow-x-auto">
      {list.length === 0 ? (
        <div className="py-16 text-center text-neutral-500 text-sm">No orders in this category.</div>
      ) : (
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="border-b-2 border-black bg-neutral-50">
              <th className="py-3 px-4 font-bold uppercase tracking-wide text-xs">Order</th>
              <th className="py-3 px-4 font-bold uppercase tracking-wide text-xs">Customer</th>
              <th className="py-3 px-4 font-bold uppercase tracking-wide text-xs">Items</th>
              <th className="py-3 px-4 font-bold uppercase tracking-wide text-xs">Amount</th>
              <th className="py-3 px-4 font-bold uppercase tracking-wide text-xs">Status</th>
              <th className="py-3 px-4 font-bold uppercase tracking-wide text-xs text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.map(order => {
              const items = Array.isArray(order.items) ? order.items : [];
              const date = new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
              const isCodReq = order.status === 'cod_requested';
              return (
                <tr key={order.id} className="border-b border-neutral-200 hover:bg-neutral-50">
                  <td className="py-3 px-4">
                    <p className="font-mono text-xs text-neutral-500">{order.txnid}</p>
                    <p className="text-[10px] text-neutral-400">{date}</p>
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-semibold text-sm">{order.customerName}</p>
                    <p className="text-xs text-neutral-500">{order.customerPhone}</p>
                    <p className="text-[10px] text-neutral-400 mt-0.5 line-clamp-2">{order.address}</p>
                    <button
                      onClick={() => {
                        const itemsList = items.map((it: any) => `${it.name} (${it.size})`).join('\n');
                        const text = `Name: ${order.customerName}\nPhone: ${order.customerPhone}\nAddress: ${order.address}\n\nItems:\n${itemsList}\n\nAmount: ₹${order.amount}\nOrder ID: ${order.txnid}`;
                        navigator.clipboard.writeText(text).then(() => {
                          toast.success('Order info copied!');
                        });
                      }}
                      className="mt-1.5 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-neutral-400 hover:text-black transition-colors"
                      title="Copy all delivery info"
                    >
                      <Copy size={11} /> Copy Info
                    </button>
                  </td>
                  <td className="py-3 px-4 text-sm">
                    {items.map((it: any, i: number) => (
                      <span key={i} className="block text-xs">{it.name} <span className="text-neutral-400">({it.size})</span></span>
                    ))}
                  </td>
                  <td className="py-3 px-4 font-bold text-sm">{formatCurrency(order.amount)}</td>
                  <td className="py-3 px-4">
                    <span className={twMerge("px-2 py-1 text-[10px] font-bold uppercase rounded-sm",
                      isCodReq ? "bg-purple-100 text-purple-800" :
                      order.status === 'cod_pending' ? "bg-amber-100 text-amber-800" :
                      order.status === 'pending' ? "bg-yellow-100 text-yellow-800" :
                      order.status === 'paid' || order.status === 'confirmed' ? "bg-green-100 text-green-800" :
                      order.status === 'shipped' ? "bg-blue-100 text-blue-800" :
                      "bg-neutral-100 text-neutral-600"
                    )}>{isCodReq ? 'COD Request' : order.status}</span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex gap-2 justify-end flex-wrap">
                      {isCodReq && (
                        <>
                          <button disabled={updatingOrderId === order.id} onClick={() => handleUpdateOrderStatus(order.id, 'cod_pending')} className="bg-green-600 text-white text-[10px] font-bold uppercase px-3 py-1.5 hover:bg-green-700 transition-colors disabled:opacity-50">Approve COD</button>
                          <button disabled={updatingOrderId === order.id} onClick={() => handleUpdateOrderStatus(order.id, 'rejected')} className="bg-red-600 text-white text-[10px] font-bold uppercase px-3 py-1.5 hover:bg-red-700 transition-colors disabled:opacity-50">Reject</button>
                        </>
                      )}
                      {(order.status === 'pending' || order.status === 'cod_pending' || order.status === 'paid') && (
                        <button disabled={updatingOrderId === order.id} onClick={() => handleUpdateOrderStatus(order.id, 'confirmed')} className="bg-black text-white text-[10px] font-bold uppercase px-3 py-1.5 hover:bg-[#E63946] transition-colors disabled:opacity-50">Confirm</button>
                      )}
                      {order.status === 'confirmed' && (
                        <button disabled={updatingOrderId === order.id} onClick={() => handleUpdateOrderStatus(order.id, 'shipped')} className="bg-[#E63946] text-white text-[10px] font-bold uppercase px-3 py-1.5 hover:bg-black transition-colors disabled:opacity-50">Mark Shipped</button>
                      )}
                      {order.status === 'shipped' && <span className="text-neutral-400 text-xs">Shipped ✓</span>}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );

  return (
    <main className="min-h-screen bg-neutral-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#E63946] mb-1">Admin Panel</p>
            <h1 className="text-3xl font-black uppercase tracking-tight">Owner Dashboard</h1>
          </div>
          <button onClick={() => { fetchProducts(); fetchOrders(); fetchCoupons(); fetchLiveData(); }} className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-neutral-500 hover:text-black transition-colors">
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          <div className="bg-white p-5 border border-neutral-200">
            <h3 className="text-[10px] text-neutral-500 uppercase tracking-widest mb-1">Live Visitors</h3>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span></span>
              <p className="text-xl font-black">{liveVisitors}</p>
            </div>
          </div>
          <div className="bg-white p-5 border border-neutral-200"><h3 className="text-[10px] text-neutral-500 uppercase tracking-widest mb-1">Revenue</h3><p className="text-xl font-black">{formatCurrency(totalRevenue)}</p></div>
          <div className="bg-white p-5 border border-neutral-200"><h3 className="text-[10px] text-neutral-500 uppercase tracking-widest mb-1">Pending</h3><p className="text-xl font-black">{pendingOrders.length}</p></div>
          <div className="bg-white p-5 border border-neutral-200"><h3 className="text-[10px] text-neutral-500 uppercase tracking-widest mb-1">Confirmed</h3><p className="text-xl font-black">{confirmedOrders.length}</p></div>
          <div className="bg-white p-5 border border-neutral-200"><h3 className="text-[10px] text-neutral-500 uppercase tracking-widest mb-1">Products</h3><p className="text-xl font-black">{products.length}</p></div>
          <div className="bg-white p-5 border border-neutral-200"><h3 className="text-[10px] text-neutral-500 uppercase tracking-widest mb-1">Active Coupons</h3><p className="text-xl font-black">{activeCoupons}</p></div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-neutral-200 mb-8 overflow-x-auto">
          {([
            { key: 'pending', label: 'Pending Orders', count: pendingOrders.length },
            { key: 'confirmed', label: 'Confirmed', count: confirmedOrders.length },
            { key: 'shipped', label: 'Shipped', count: shippedOrders.length },
            { key: 'inventory', label: 'Inventory' },
            { key: 'coupons', label: 'Coupons', count: activeCoupons },
            { key: 'activity', label: 'Activity', count: cartEvents.filter(e => {
              const age = Date.now() - new Date(e.createdAt).getTime();
              return age < 60 * 60 * 1000; // last hour
            }).length },
          ] as const).map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className={twMerge("px-5 py-3 font-bold uppercase tracking-wide text-xs border-b-2 whitespace-nowrap transition-colors flex items-center gap-2",
                activeTab === t.key ? "border-[#E63946] text-[#E63946]" : "border-transparent text-neutral-500 hover:text-black"
              )}>
              {t.label}
              {'count' in t && t.count > 0 && <span className="bg-[#E63946] text-white text-[10px] px-1.5 py-0.5 rounded-full">{t.count}</span>}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'pending' && renderOrders(pendingOrders, 'pending')}
        {activeTab === 'confirmed' && renderOrders(confirmedOrders, 'confirmed')}
        {activeTab === 'shipped' && renderOrders(shippedOrders, 'shipped')}

        {activeTab === 'inventory' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="flex flex-col gap-8">
              {!editingId && (
                <div className="bg-white p-6 border border-neutral-200">
                  <h2 className="text-lg font-bold uppercase tracking-wide mb-4">Auto-Import Product</h2>
                  <p className="text-sm text-neutral-500 mb-4">Paste a link from an official brand store to auto-fill details.</p>
                  <div className="flex gap-2">
                    <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://www.nike.com/t/..." className="flex-1 border border-neutral-300 p-3 text-sm focus:outline-none focus:border-black" />
                    <button onClick={handleScrape} disabled={isScraping} className={twMerge("bg-black text-white px-4 font-bold uppercase text-sm tracking-wider transition-colors flex items-center justify-center", isScraping ? "opacity-70" : "hover:bg-[#E63946]")}>
                      {isScraping ? <Loader2 size={18} className="animate-spin" /> : 'Fetch'}
                    </button>
                  </div>
                </div>
              )}

              <form onSubmit={handleSaveProduct} className={twMerge("flex flex-col gap-4 p-6 border bg-white", editingId ? "border-[#E63946]" : "border-neutral-200")}>
                <div className="flex justify-between items-center border-b border-neutral-200 pb-2">
                  <h2 className="text-lg font-bold uppercase tracking-wide">{editingId ? 'Edit Product' : 'Product Details'}</h2>
                  {editingId && <button type="button" onClick={handleCancelEdit} className="text-xs font-bold uppercase text-neutral-500 hover:text-black">Cancel</button>}
                </div>
                <div><label className="block text-sm font-semibold mb-1">Product Name</label><input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full border border-neutral-300 p-3 text-sm focus:outline-none focus:border-black" required /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-semibold mb-1">Brand</label><input type="text" value={formData.brand} onChange={(e) => setFormData({...formData, brand: e.target.value})} className="w-full border border-neutral-300 p-3 text-sm focus:outline-none focus:border-black" /></div>
                  <div><label className="block text-sm font-semibold mb-1">Price (₹)</label><input type="number" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} className="w-full border border-neutral-300 p-3 text-sm focus:outline-none focus:border-black" required /></div>
                </div>
                <div><label className="block text-sm font-semibold mb-1">Image URL</label><input type="url" value={formData.imageUrl} onChange={(e) => setFormData({...formData, imageUrl: e.target.value})} className="w-full border border-neutral-300 p-3 text-sm focus:outline-none focus:border-black" />
                  {formData.imageUrl && <div className="mt-3 w-32 h-32 bg-neutral-100 border overflow-hidden"><img src={formData.imageUrl.split(',')[0].trim()} alt="Preview" className="w-full h-full object-cover" /></div>}
                </div>
                <div><label className="block text-sm font-semibold mb-1 mt-2">Category</label>
                  <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full border border-neutral-300 p-3 text-sm focus:outline-none focus:border-black">
                    <option value="Men">Men</option><option value="Women">Women</option><option value="Kids">Kids</option>
                  </select>
                </div>
                {/* Color Variant Section */}
                <div className="border border-neutral-200 p-4 mt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={isColorVariant} onChange={(e) => { setIsColorVariant(e.target.checked); if (!e.target.checked) { setParentId(null); setColorName(''); } }} className="accent-[#E63946]" />
                    <span className="text-sm font-bold uppercase tracking-wide">Color Variant</span>
                  </label>
                  {isColorVariant && (
                    <div className="mt-3 flex flex-col gap-3">
                      <div>
                        <label className="block text-xs font-semibold mb-1">Color Name *</label>
                        <input type="text" value={colorName} onChange={(e) => setColorName(e.target.value)} className="w-full border border-neutral-300 p-2.5 text-sm focus:outline-none focus:border-black" placeholder="e.g. Triple Black" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1">Parent Shoe (select existing product)</label>
                        <select value={parentId || ''} onChange={(e) => setParentId(e.target.value || null)} className="w-full border border-neutral-300 p-2.5 text-sm focus:outline-none focus:border-black">
                          <option value="">— None (this is the first color) —</option>
                          {products.filter(p => p.id !== editingId).map(p => (
                            <option key={p.id} value={p.id}>{p.name} {p.colorName ? `(${p.colorName})` : ''}</option>
                          ))}
                        </select>
                        <p className="text-[10px] text-neutral-400 mt-1">Leave empty if this is the first color of a new shoe. Select a shoe to link as another color.</p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="mt-2"><label className="block text-sm font-semibold mb-2">Inventory by Size</label>
                  {/* Per-Size Pricing Toggle */}
                  <label className="flex items-center gap-2 mb-3 cursor-pointer">
                    <input type="checkbox" checked={perSizePricing} onChange={(e) => {
                      const enabled = e.target.checked;
                      setPerSizePricing(enabled);
                      if (enabled) {
                        // Convert plain numbers to objects
                        setSizes(prev => {
                          const next: Record<string, { stock: number; price: number }> = {};
                          for (const [k, v] of Object.entries(prev)) {
                            if (typeof v === 'object') next[k] = v;
                            else next[k] = { stock: v, price: Number(formData.price) || 0 };
                          }
                          return next;
                        });
                      } else {
                        // Convert objects back to plain numbers
                        setSizes(prev => {
                          const next: Record<string, number> = {};
                          for (const [k, v] of Object.entries(prev)) {
                            next[k] = typeof v === 'object' ? v.stock : v;
                          }
                          return next;
                        });
                      }
                    }} className="accent-[#E63946]" />
                    <span className="text-xs font-bold uppercase tracking-wide">Different Prices per Size</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {getActiveSizes(formData.category).map(size => {
                      const val = sizes[size];
                      const stock = typeof val === 'object' ? val.stock : (val as number) || 0;
                      const sizePrice = typeof val === 'object' ? val.price : Number(formData.price) || 0;
                      return (
                        <div key={size} className={twMerge("flex flex-col items-center p-2 border", stock > 0 ? "border-[#E63946] bg-red-50" : "border-neutral-200")}>
                          <span className="text-[10px] font-bold mb-1">{size}</span>
                          <div className="flex items-center gap-1">
                            <button type="button" onClick={() => handleSizeChange(size, -1)} className="p-0.5 hover:bg-neutral-200"><Minus size={12} /></button>
                            <span className="text-xs font-semibold w-4 text-center">{stock}</span>
                            <button type="button" onClick={() => handleSizeChange(size, 1)} className="p-0.5 hover:bg-neutral-200"><Plus size={12} /></button>
                          </div>
                          {perSizePricing && (
                            <input type="number" value={sizePrice || ''} onChange={(e) => handleSizePriceChange(size, e.target.value)} className="w-full mt-1 border border-neutral-300 p-1 text-[10px] text-center focus:outline-none focus:border-black" placeholder="₹ Price" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div><label className="block text-sm font-semibold mb-1 mt-2">Description</label><textarea rows={3} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full border border-neutral-300 p-3 text-sm focus:outline-none focus:border-black resize-none" /></div>
                <button type="submit" disabled={isSaving} className="bg-[#E63946] text-white py-3 font-bold uppercase tracking-wider hover:bg-black transition-colors disabled:opacity-50">
                  {isSaving ? <Loader2 size={18} className="animate-spin inline mr-2" /> : null}{editingId ? 'Update Product' : 'Save Product'}
                </button>
              </form>
            </div>

            <div className="border border-neutral-200 bg-white overflow-hidden self-start">
              <div className="flex justify-between items-center p-4 bg-neutral-50 border-b border-neutral-200">
                <h2 className="text-lg font-bold uppercase tracking-wide">Live Inventory</h2>
                <button onClick={fetchProducts} className="text-xs font-bold uppercase underline text-neutral-500 hover:text-black">Refresh</button>
              </div>
              {isLoadingProducts ? (
                <div className="p-8 text-center"><Loader2 size={24} className="animate-spin mx-auto text-neutral-400" /></div>
              ) : products.length === 0 ? (
                <div className="p-8 text-center text-neutral-500 text-sm">No products yet.</div>
              ) : (
                <div className="max-h-[700px] overflow-y-auto">
                  <table className="w-full text-left"><tbody>
                    {products.map((p) => {
                      const totalStock = Object.values(p.sizes || {}).reduce((a: number, b) => a + (typeof b === 'object' ? b.stock : (b as number)), 0);
                      return (
                        <tr key={p.id} className={twMerge("border-b border-neutral-200 hover:bg-neutral-50", editingId === p.id && "bg-neutral-100")}>
                          <td className="py-3 px-4"><div className="font-semibold text-sm line-clamp-1">{p.name}</div><div className="text-xs text-neutral-500">{p.brand} • {formatCurrency(p.price)}{p.colorName ? ` • ${p.colorName}` : ''}</div></td>
                          <td className="py-3 px-4 text-center"><span className={twMerge("text-xs font-bold px-2 py-1", totalStock > 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800")}>{totalStock} in stock</span></td>
                          <td className="py-3 px-4 text-right"><button onClick={() => handleEdit(p)} className="text-neutral-400 hover:text-black"><Edit2 size={16} /></button></td>
                        </tr>
                      );
                    })}
                  </tbody></table>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'coupons' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Create Coupon Form */}
            <form onSubmit={handleSaveCoupon} className="flex flex-col gap-4 p-6 border border-neutral-200 bg-white self-start">
              <h2 className="text-lg font-bold uppercase tracking-wide border-b border-neutral-200 pb-2">Create Coupon</h2>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-semibold mb-1">Code *</label><input type="text" required value={couponForm.code} onChange={e => setCouponForm({...couponForm, code: e.target.value.toUpperCase()})} className="w-full border border-neutral-300 p-3 text-sm uppercase tracking-wider focus:outline-none focus:border-black" placeholder="SAVE10" /></div>
                <div><label className="block text-sm font-semibold mb-1">Type</label>
                  <select value={couponForm.discountType} onChange={e => setCouponForm({...couponForm, discountType: e.target.value})} className="w-full border border-neutral-300 p-3 text-sm focus:outline-none focus:border-black">
                    <option value="percent">Percentage (%)</option>
                    <option value="flat">Flat (₹)</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-semibold mb-1">Discount Value *</label><input type="number" required value={couponForm.discountValue} onChange={e => setCouponForm({...couponForm, discountValue: e.target.value})} className="w-full border border-neutral-300 p-3 text-sm focus:outline-none focus:border-black" placeholder="10" /></div>
                <div><label className="block text-sm font-semibold mb-1">Min Order (₹)</label><input type="number" value={couponForm.minOrderValue} onChange={e => setCouponForm({...couponForm, minOrderValue: e.target.value})} className="w-full border border-neutral-300 p-3 text-sm focus:outline-none focus:border-black" placeholder="0" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-semibold mb-1">Max Uses (0=unlimited)</label><input type="number" value={couponForm.maxUses} onChange={e => setCouponForm({...couponForm, maxUses: e.target.value})} className="w-full border border-neutral-300 p-3 text-sm focus:outline-none focus:border-black" placeholder="0" /></div>
                <div><label className="block text-sm font-semibold mb-1">Expires At</label><input type="date" value={couponForm.expiresAt} onChange={e => setCouponForm({...couponForm, expiresAt: e.target.value})} className="w-full border border-neutral-300 p-3 text-sm focus:outline-none focus:border-black" /></div>
              </div>
              <button type="submit" disabled={isSavingCoupon} className="bg-[#E63946] text-white py-3 font-bold uppercase tracking-wider hover:bg-black transition-colors disabled:opacity-50">
                {isSavingCoupon ? <Loader2 size={18} className="animate-spin inline mr-2" /> : null}Create Coupon
              </button>
            </form>

            {/* Coupons List */}
            <div className="border border-neutral-200 bg-white overflow-hidden self-start">
              <div className="flex justify-between items-center p-4 bg-neutral-50 border-b border-neutral-200">
                <h2 className="text-lg font-bold uppercase tracking-wide flex items-center gap-2"><Tag size={16} /> All Coupons</h2>
                <button onClick={fetchCoupons} className="text-xs font-bold uppercase underline text-neutral-500 hover:text-black">Refresh</button>
              </div>
              {isLoadingCoupons ? (
                <div className="p-8 text-center"><Loader2 size={24} className="animate-spin mx-auto text-neutral-400" /></div>
              ) : coupons.length === 0 ? (
                <div className="p-8 text-center text-neutral-500 text-sm">No coupons yet.</div>
              ) : (
                <div className="max-h-[600px] overflow-y-auto">
                  <table className="w-full text-left"><tbody>
                    {coupons.map(c => {
                      const expired = c.expiresAt && new Date(c.expiresAt) < new Date();
                      return (
                        <tr key={c.id} className="border-b border-neutral-200 hover:bg-neutral-50">
                          <td className="py-3 px-4">
                            <div className="font-bold text-sm tracking-wider">{c.code}</div>
                            <div className="text-xs text-neutral-500">
                              {c.discountType === 'percent' ? `${c.discountValue}% off` : `₹${c.discountValue} off`}
                              {c.minOrderValue > 0 && <span> · Min ₹{c.minOrderValue}</span>}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="text-xs font-semibold">{c.usedCount}{c.maxUses > 0 ? `/${c.maxUses}` : ''} used</span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={twMerge("text-[10px] font-bold uppercase px-2 py-1 rounded-sm", expired ? "bg-red-100 text-red-800" : c.isActive ? "bg-green-100 text-green-800" : "bg-neutral-100 text-neutral-600")}>
                              {expired ? 'Expired' : c.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex gap-2 justify-end">
                              <button onClick={() => handleToggleCoupon(c.id, c.isActive)} className="text-neutral-400 hover:text-black" title={c.isActive ? 'Deactivate' : 'Activate'}>
                                {c.isActive ? <ToggleRight size={18} className="text-green-600" /> : <ToggleLeft size={18} />}
                              </button>
                              <button onClick={() => handleDeleteCoupon(c.id)} className="text-neutral-400 hover:text-red-500" title="Delete">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody></table>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Live Visitors */}
            <div className="border border-neutral-200 bg-white overflow-hidden self-start">
              <div className="flex justify-between items-center p-4 bg-neutral-50 border-b border-neutral-200">
                <h2 className="text-lg font-bold uppercase tracking-wide flex items-center gap-2"><Eye size={16} /> Live Visitors</h2>
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span></span>
                  <span className="text-xs font-bold">{liveVisitors} online</span>
                </div>
              </div>
              {visitorDetails.length === 0 ? (
                <div className="p-8 text-center text-neutral-500 text-sm">No active visitors right now.</div>
              ) : (
                <div className="max-h-[400px] overflow-y-auto">
                  <table className="w-full text-left"><tbody>
                    {visitorDetails.map(v => (
                      <tr key={v.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                        <td className="py-2.5 px-4">
                          <span className="text-xs font-mono text-neutral-400">{v.id.slice(0, 12)}…</span>
                        </td>
                        <td className="py-2.5 px-4">
                          <span className="text-xs font-semibold">{v.page}</span>
                        </td>
                        <td className="py-2.5 px-4 text-right">
                          <span className="text-[10px] text-neutral-400">{new Date(v.lastSeen).toLocaleTimeString()}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody></table>
                </div>
              )}
            </div>

            {/* Cart Activity Feed */}
            <div className="border border-neutral-200 bg-white overflow-hidden self-start">
              <div className="flex justify-between items-center p-4 bg-neutral-50 border-b border-neutral-200">
                <h2 className="text-lg font-bold uppercase tracking-wide flex items-center gap-2"><ShoppingCart size={16} /> Cart Activity</h2>
                <button onClick={fetchLiveData} className="text-xs font-bold uppercase underline text-neutral-500 hover:text-black">Refresh</button>
              </div>
              {isLoadingActivity ? (
                <div className="p-8 text-center"><Loader2 size={24} className="animate-spin mx-auto text-neutral-400" /></div>
              ) : cartEvents.length === 0 ? (
                <div className="p-8 text-center text-neutral-500 text-sm">No cart activity yet.</div>
              ) : (
                <div className="max-h-[600px] overflow-y-auto">
                  {cartEvents.map((e: any) => {
                    const age = Date.now() - new Date(e.createdAt).getTime();
                    const isRecent = age < 5 * 60 * 1000;
                    const timeAgo = age < 60000 ? 'just now'
                      : age < 3600000 ? `${Math.floor(age / 60000)}m ago`
                      : age < 86400000 ? `${Math.floor(age / 3600000)}h ago`
                      : new Date(e.createdAt).toLocaleDateString();
                    return (
                      <div key={e.id} className={`flex items-center gap-3 p-3 border-b border-neutral-100 ${isRecent ? 'bg-green-50' : ''}`}>
                        <div className="w-8 h-8 bg-neutral-100 rounded-sm flex items-center justify-center shrink-0">
                          <ShoppingCart size={14} className={isRecent ? 'text-green-600' : 'text-neutral-400'} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate">{e.productName}</p>
                          <p className="text-[10px] text-neutral-500">Size {e.size} · {formatCurrency(e.price)}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className={`text-[10px] font-bold ${isRecent ? 'text-green-600' : 'text-neutral-400'}`}>{timeAgo}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { Loader2, Plus, Minus, Edit2, RefreshCw } from 'lucide-react';
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
  sizes: Record<string, number>;
}

interface OrderData {
  id: string; txnid: string; status: string; amount: number;
  customerName: string; customerEmail: string; customerPhone: string;
  address: string; items: any[]; createdAt: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState<'inventory' | 'pending' | 'confirmed' | 'shipped'>('pending');
  const [products, setProducts] = useState<ProductData[]>([]);
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);

  // Form State
  const [url, setUrl] = useState('');
  const [isScraping, setIsScraping] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', brand: '', price: '', description: '', imageUrl: '', category: 'Men' });
  const [sizes, setSizes] = useState<Record<string, number>>({});
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

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
    setSizes(prev => ({ ...prev, [size]: Math.max(0, (prev[size] || 0) + delta) }));
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const method = editingId ? 'PUT' : 'POST';
      const body = { ...(editingId ? { id: editingId } : {}), name: formData.name, brand: formData.brand, price: Number(formData.price), description: formData.description, imageUrl: formData.imageUrl, category: formData.category, sizes };
      const res = await fetch('/api/products', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error('Failed');
      toast.success(`Product ${editingId ? 'updated' : 'added'}!`);
      setEditingId(null); setUrl(''); setFormData({ name: '', brand: '', price: '', description: '', imageUrl: '', category: 'Men' }); setSizes({});
      fetchProducts();
    } catch { toast.error('Error saving product.'); }
    finally { setIsSaving(false); }
  };

  const handleEdit = (p: ProductData) => {
    setEditingId(p.id);
    setFormData({ name: p.name, brand: p.brand, price: p.price.toString(), description: p.description, imageUrl: p.imageUrl || '', category: p.category || 'Men' });
    setSizes(p.sizes || {});
    setActiveTab('inventory');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null); setFormData({ name: '', brand: '', price: '', description: '', imageUrl: '', category: 'Men' }); setSizes({});
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
          <button onClick={() => { fetchProducts(); fetchOrders(); }} className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-neutral-500 hover:text-black transition-colors">
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 border border-neutral-200"><h3 className="text-[10px] text-neutral-500 uppercase tracking-widest mb-1">Revenue</h3><p className="text-xl font-black">{formatCurrency(totalRevenue)}</p></div>
          <div className="bg-white p-5 border border-neutral-200"><h3 className="text-[10px] text-neutral-500 uppercase tracking-widest mb-1">Pending</h3><p className="text-xl font-black">{pendingOrders.length}</p></div>
          <div className="bg-white p-5 border border-neutral-200"><h3 className="text-[10px] text-neutral-500 uppercase tracking-widest mb-1">Confirmed</h3><p className="text-xl font-black">{confirmedOrders.length}</p></div>
          <div className="bg-white p-5 border border-neutral-200"><h3 className="text-[10px] text-neutral-500 uppercase tracking-widest mb-1">Products</h3><p className="text-xl font-black">{products.length}</p></div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-neutral-200 mb-8 overflow-x-auto">
          {([
            { key: 'pending', label: 'Pending Orders', count: pendingOrders.length },
            { key: 'confirmed', label: 'Confirmed', count: confirmedOrders.length },
            { key: 'shipped', label: 'Shipped', count: shippedOrders.length },
            { key: 'inventory', label: 'Inventory' },
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
                <div className="mt-2"><label className="block text-sm font-semibold mb-2">Inventory by Size</label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {getActiveSizes(formData.category).map(size => (
                      <div key={size} className={twMerge("flex flex-col items-center p-2 border", sizes[size] > 0 ? "border-[#E63946] bg-red-50" : "border-neutral-200")}>
                        <span className="text-[10px] font-bold mb-1">{size}</span>
                        <div className="flex items-center gap-1">
                          <button type="button" onClick={() => handleSizeChange(size, -1)} className="p-0.5 hover:bg-neutral-200"><Minus size={12} /></button>
                          <span className="text-xs font-semibold w-4 text-center">{sizes[size] || 0}</span>
                          <button type="button" onClick={() => handleSizeChange(size, 1)} className="p-0.5 hover:bg-neutral-200"><Plus size={12} /></button>
                        </div>
                      </div>
                    ))}
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
                      const totalStock = Object.values(p.sizes || {}).reduce((a, b) => a + b, 0);
                      return (
                        <tr key={p.id} className={twMerge("border-b border-neutral-200 hover:bg-neutral-50", editingId === p.id && "bg-neutral-100")}>
                          <td className="py-3 px-4"><div className="font-semibold text-sm line-clamp-1">{p.name}</div><div className="text-xs text-neutral-500">{p.brand} • {formatCurrency(p.price)}</div></td>
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
      </div>
    </main>
  );
}

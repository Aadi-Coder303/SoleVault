'use client';

import { useState, useEffect } from 'react';
import { Loader2, Plus, Minus, Edit2 } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { OWNER_EMAILS } from '@/lib/constants';

const MEN_SIZES = ['UK 6', 'UK 6.5', 'UK 7', 'UK 7.5', 'UK 8', 'UK 8.5', 'UK 9', 'UK 9.5', 'UK 10', 'UK 10.5', 'UK 11', 'UK 12'];
const WOMEN_SIZES = ['UK 3', 'UK 3.5', 'UK 4', 'UK 4.5', 'UK 5', 'UK 5.5', 'UK 6', 'UK 6.5', 'UK 7', 'UK 7.5', 'UK 8'];
const KIDS_SIZES = ['UK 1', 'UK 1.5', 'UK 2', 'UK 2.5', 'UK 3', 'UK 3.5', 'UK 4', 'UK 4.5', 'UK 5', 'UK 5.5'];

const getActiveSizes = (category: string) => {
  if (category.toLowerCase() === 'women') return WOMEN_SIZES;
  if (category.toLowerCase() === 'kids') return KIDS_SIZES;
  return MEN_SIZES;
};

interface ProductData {
  id: string;
  name: string;
  brand: string;
  price: number;
  description: string;
  imageUrl: string | null;
  category: string;
  sizes: Record<string, number>;
}

// Mock Order Data (Reset to zero)
const MOCK_ORDERS: any[] = [];

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState<'inventory' | 'pending' | 'in_process' | 'sold'>('inventory');
  
  // Real Inventory Data
  const [products, setProducts] = useState<ProductData[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  // Form State
  const [url, setUrl] = useState('');
  const [isScraping, setIsScraping] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    price: '',
    description: '',
    imageUrl: '',
    category: 'Men',
  });

  const [sizes, setSizes] = useState<Record<string, number>>({});

  const [notifyingId, setNotifyingId] = useState<string | null>(null);

  const fetchProducts = async () => {
    setIsLoadingProducts(true);
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  useEffect(() => {
    // Check owner authorization
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.email || !OWNER_EMAILS.includes(session.user.email)) {
        router.push('/');
      }
    };
    checkAuth();

    fetchProducts();
  }, [supabase.auth, router]);

  const handleScrape = async () => {
    if (!url) return alert('Please enter a URL first.');
    setIsScraping(true);
    try {
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setFormData({
          ...formData,
          name: result.data.title || '',
          brand: result.data.brand || '',
          description: result.data.description || '',
          imageUrl: result.data.image || '',
        });
        alert('Data fetched successfully! Review details and set sizes.');
      } else {
        alert(result.error || 'Failed to fetch data.');
      }
    } catch {
      alert('An error occurred while fetching the data.');
    } finally {
      setIsScraping(false);
    }
  };

  const handleSizeChange = (size: string, delta: number) => {
    setSizes(prev => {
      const current = prev[size] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [size]: next };
    });
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const method = editingId ? 'PUT' : 'POST';
      const body = {
        ...(editingId ? { id: editingId } : {}),
        name: formData.name,
        brand: formData.brand,
        price: Number(formData.price),
        description: formData.description,
        imageUrl: formData.imageUrl,
        category: formData.category,
        sizes,
      };

      const res = await fetch('/api/products', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error('Failed to save product');

      alert(`Product ${editingId ? 'updated' : 'added'} successfully!`);
      // Reset form
      setEditingId(null);
      setUrl('');
      setFormData({ name: '', brand: '', price: '', description: '', imageUrl: '', category: 'Men' });
      setSizes({});
      
      // Refresh inventory
      fetchProducts();
    } catch {
      alert('Error saving product to database.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (product: ProductData) => {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      brand: product.brand,
      price: product.price.toString(),
      description: product.description,
      imageUrl: product.imageUrl || '',
      category: product.category || 'Men',
    });
    setSizes(product.sizes || {});
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ name: '', brand: '', price: '', description: '', imageUrl: '', category: 'Men' });
    setSizes({});
  };

  const handleNotifyBuyer = async (orderId: string, email: string, newStatus: string) => {
    setNotifyingId(orderId);
    try {
      const res = await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, email, status: newStatus }),
      });
      if (res.ok) {
        alert(`Notification successfully sent to ${email}! Status updated to ${newStatus}.`);
      } else {
        alert('Failed to send notification.');
      }
    } catch {
      alert('Network error while notifying buyer.');
    } finally {
      setNotifyingId(null);
    }
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold uppercase tracking-wide">Owner Dashboard</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-neutral-50 p-6 border border-neutral-200">
          <h3 className="text-sm text-neutral-500 uppercase tracking-widest mb-2">Total Sales</h3>
          <p className="text-2xl font-bold">₹2,45,000</p>
        </div>
        <div className="bg-neutral-50 p-6 border border-neutral-200">
          <h3 className="text-sm text-neutral-500 uppercase tracking-widest mb-2">Active Orders</h3>
          <p className="text-2xl font-bold">12</p>
        </div>
        <div className="bg-neutral-50 p-6 border border-neutral-200">
          <h3 className="text-sm text-neutral-500 uppercase tracking-widest mb-2">Total Inventory List</h3>
          <p className="text-2xl font-bold">{products.length}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-neutral-200 mb-8 overflow-x-auto">
        <button 
          onClick={() => setActiveTab('inventory')}
          className={twMerge("px-6 py-3 font-bold uppercase tracking-wide text-sm border-b-2 whitespace-nowrap transition-colors", activeTab === 'inventory' ? "border-[#E63946] text-[#E63946]" : "border-transparent text-neutral-500 hover:text-black")}
        >
          Inventory
        </button>
        <button 
          onClick={() => setActiveTab('pending')}
          className={twMerge("px-6 py-3 font-bold uppercase tracking-wide text-sm border-b-2 whitespace-nowrap transition-colors flex items-center gap-2", activeTab === 'pending' ? "border-[#E63946] text-[#E63946]" : "border-transparent text-neutral-500 hover:text-black")}
        >
          Pending Orders
          <span className="bg-[#E63946] text-white text-[10px] px-2 py-0.5 rounded-full">1</span>
        </button>
        <button 
          onClick={() => setActiveTab('in_process')}
          className={twMerge("px-6 py-3 font-bold uppercase tracking-wide text-sm border-b-2 whitespace-nowrap transition-colors", activeTab === 'in_process' ? "border-[#E63946] text-[#E63946]" : "border-transparent text-neutral-500 hover:text-black")}
        >
          In Process
        </button>
        <button 
          onClick={() => setActiveTab('sold')}
          className={twMerge("px-6 py-3 font-bold uppercase tracking-wide text-sm border-b-2 whitespace-nowrap transition-colors", activeTab === 'sold' ? "border-[#E63946] text-[#E63946]" : "border-transparent text-neutral-500 hover:text-black")}
        >
          Sold / Shipped
        </button>
      </div>

      {/* Tab Content */}
      <div className="bg-white">
        
        {/* INVENTORY TAB */}
        {activeTab === 'inventory' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="flex flex-col gap-8">
              
              {/* Auto-Import Scraper */}
              {!editingId && (
                <div className="bg-neutral-50 p-6 border border-neutral-200">
                  <h2 className="text-lg font-bold uppercase tracking-wide mb-4">Auto-Import Product</h2>
                  <p className="text-sm text-neutral-500 mb-4">Paste a link from an official brand store or retailer to auto-fill the details.</p>
                  <div className="flex gap-2">
                    <input 
                      type="url" 
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://www.nike.com/t/..." 
                      className="flex-1 border border-neutral-300 p-3 text-sm focus:outline-none focus:border-black"
                    />
                    <button 
                      onClick={handleScrape}
                      disabled={isScraping}
                      className={twMerge(
                        "bg-black text-white px-4 font-bold uppercase text-sm tracking-wider transition-colors flex items-center justify-center",
                        isScraping ? "opacity-70 cursor-wait" : "hover:bg-[#E63946]"
                      )}
                    >
                      {isScraping ? <Loader2 size={18} className="animate-spin" /> : 'Fetch'}
                    </button>
                  </div>
                </div>
              )}

              {/* Manual Entry / Edit Form */}
              <form onSubmit={handleSaveProduct} className={twMerge("flex flex-col gap-4 p-6 border", editingId ? "border-[#E63946] bg-red-50/20" : "border-neutral-200")}>
                <div className="flex justify-between items-center border-b border-neutral-200 pb-2">
                  <h2 className="text-lg font-bold uppercase tracking-wide">
                    {editingId ? 'Edit Product & Stock' : 'Product Details'}
                  </h2>
                  {editingId && (
                    <button type="button" onClick={handleCancelEdit} className="text-xs font-bold uppercase text-neutral-500 hover:text-black">
                      Cancel Edit
                    </button>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-semibold mb-1">Product Name</label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full border border-neutral-300 p-3 text-sm focus:outline-none focus:border-black bg-white" 
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-1">Brand</label>
                    <input 
                      type="text" 
                      value={formData.brand}
                      onChange={(e) => setFormData({...formData, brand: e.target.value})}
                      className="w-full border border-neutral-300 p-3 text-sm focus:outline-none focus:border-black bg-white" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1">Price (₹)</label>
                    <input 
                      type="number" 
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      className="w-full border border-neutral-300 p-3 text-sm focus:outline-none focus:border-black bg-white" 
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1">Image URL</label>
                  <input 
                    type="url" 
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                    className="w-full border border-neutral-300 p-3 text-sm focus:outline-none focus:border-black bg-white" 
                  />
                  {formData.imageUrl && (
                    <div className="mt-3 w-32 h-32 bg-neutral-100 border border-neutral-200 overflow-hidden">
                      <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1 mt-4">Category</label>
                  <select 
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full border border-neutral-300 p-3 text-sm focus:outline-none focus:border-black bg-white"
                  >
                    <option value="Men">Men</option>
                    <option value="Women">Women</option>
                    <option value="Kids">Kids</option>
                  </select>
                </div>

                {/* SIZES MATRIX */}
                <div className="mt-4">
                  <label className="block text-sm font-semibold mb-2">Inventory by Size ({formData.category})</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {getActiveSizes(formData.category).map(size => (
                      <div key={size} className={twMerge("flex flex-col items-center p-2 border", sizes[size] > 0 ? "border-[#E63946] bg-red-50" : "border-neutral-200 bg-white")}>
                        <span className="text-xs font-bold mb-2">{size}</span>
                        <div className="flex items-center gap-2">
                          <button type="button" onClick={() => handleSizeChange(size, -1)} className="p-1 hover:bg-neutral-200 transition-colors">
                            <Minus size={14} />
                          </button>
                          <span className="text-sm font-semibold w-4 text-center">{sizes[size] || 0}</span>
                          <button type="button" onClick={() => handleSizeChange(size, 1)} className="p-1 hover:bg-neutral-200 transition-colors">
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1 mt-4">Description</label>
                  <textarea 
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full border border-neutral-300 p-3 text-sm focus:outline-none focus:border-black resize-none bg-white" 
                  />
                </div>

                <button type="submit" disabled={isSaving} className="bg-[#E63946] text-white py-4 font-bold uppercase tracking-wider hover:bg-black transition-colors mt-2 disabled:opacity-50">
                  {isSaving ? <Loader2 size={18} className="animate-spin inline mr-2" /> : null}
                  {editingId ? 'Update Product & Stock' : 'Save New Product'}
                </button>
              </form>
            </div>

            {/* Right Col: Inventory List */}
            <div className="border border-neutral-200 overflow-hidden self-start">
              <div className="flex justify-between items-center p-4 bg-neutral-50 border-b border-neutral-200">
                <h2 className="text-lg font-bold uppercase tracking-wide">Live Inventory</h2>
                <button onClick={fetchProducts} className="text-xs font-bold uppercase underline text-neutral-500 hover:text-black">Refresh</button>
              </div>
              
              {isLoadingProducts ? (
                <div className="p-8 text-center text-neutral-500"><Loader2 size={24} className="animate-spin mx-auto" /></div>
              ) : products.length === 0 ? (
                <div className="p-8 text-center text-neutral-500 text-sm">No products in database. Add one to get started!</div>
              ) : (
                <div className="max-h-[800px] overflow-y-auto">
                  <table className="w-full text-left border-collapse">
                    <tbody>
                      {products.map((p) => {
                        const totalStock = Object.values(p.sizes || {}).reduce((a: number, b: number) => a + b, 0) as number;
                        return (
                          <tr key={p.id} className={twMerge("border-b border-neutral-200 hover:bg-neutral-50 transition-colors", editingId === p.id && "bg-neutral-100")}>
                            <td className="py-3 px-4">
                              <div className="font-semibold text-sm line-clamp-1">{p.name}</div>
                              <div className="text-xs text-neutral-500">{p.brand} • ₹{p.price}</div>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className={twMerge("text-xs font-bold px-2 py-1 rounded-sm", totalStock > 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800")}>
                                {totalStock} in stock
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button onClick={() => handleEdit(p)} className="text-neutral-400 hover:text-black transition-colors" title="Edit Inventory">
                                <Edit2 size={16} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ORDER TABS (Pending, In Process, Sold) */}
        {['pending', 'in_process', 'sold'].includes(activeTab) && (
          <div className="overflow-x-auto border border-neutral-200">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b-2 border-black bg-neutral-50">
                  <th className="py-4 px-4 font-bold uppercase tracking-wide text-xs">Order ID</th>
                  <th className="py-4 px-4 font-bold uppercase tracking-wide text-xs">Item & Size</th>
                  <th className="py-4 px-4 font-bold uppercase tracking-wide text-xs">Buyer Email</th>
                  <th className="py-4 px-4 font-bold uppercase tracking-wide text-xs">Status</th>
                  <th className="py-4 px-4 font-bold uppercase tracking-wide text-xs text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_ORDERS.filter(o => o.status.toLowerCase().replace(' ', '_') === activeTab).length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-neutral-500 font-medium">No orders in this status.</td>
                  </tr>
                ) : (
                  MOCK_ORDERS.filter(o => o.status.toLowerCase().replace(' ', '_') === activeTab).map((order) => (
                    <tr key={order.id} className="border-b border-neutral-200 hover:bg-neutral-50">
                      <td className="py-4 px-4 font-semibold text-sm">{order.id}</td>
                      <td className="py-4 px-4 text-sm">
                        <span className="font-semibold block">{order.item}</span>
                        <span className="text-neutral-500 text-xs">Size: {order.size}</span>
                      </td>
                      <td className="py-4 px-4 text-sm text-neutral-600">{order.buyer}</td>
                      <td className="py-4 px-4">
                        <span className={twMerge(
                          "px-2 py-1 text-xs font-bold uppercase rounded-sm",
                          order.status === 'Pending' ? "bg-yellow-100 text-yellow-800" :
                          order.status === 'In Process' ? "bg-blue-100 text-blue-800" :
                          "bg-green-100 text-green-800"
                        )}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        {order.status === 'Pending' && (
                          <button 
                            disabled={notifyingId === order.id}
                            onClick={() => handleNotifyBuyer(order.id, order.buyer, 'In Process')}
                            className="bg-black text-white text-xs font-bold uppercase tracking-wide px-3 py-2 hover:bg-[#E63946] transition-colors disabled:opacity-50"
                          >
                            {notifyingId === order.id ? 'Sending...' : 'Mark In Process & Notify'}
                          </button>
                        )}
                        {order.status === 'In Process' && (
                          <button 
                            disabled={notifyingId === order.id}
                            onClick={() => handleNotifyBuyer(order.id, order.buyer, 'Shipped')}
                            className="bg-[#E63946] text-white text-xs font-bold uppercase tracking-wide px-3 py-2 hover:bg-black transition-colors disabled:opacity-50"
                          >
                            {notifyingId === order.id ? 'Sending...' : 'Mark Shipped & Notify'}
                          </button>
                        )}
                        {order.status === 'Sold' && (
                          <span className="text-neutral-400 text-sm font-semibold">Completed</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </main>
  );
}

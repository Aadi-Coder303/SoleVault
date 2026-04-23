'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Loader2, Package, Clock, CheckCircle, XCircle, Truck } from 'lucide-react';
import { formatCurrency } from '@/lib/formatCurrency';
import Link from 'next/link';

interface OrderItem {
  name: string;
  size: string;
  price: number;
  qty: number;
}

interface Order {
  id: string;
  txnid: string;
  status: string;
  amount: number;
  items: OrderItem[];
  createdAt: string;
  address: string;
}

const statusConfig: Record<string, { label: string; icon: any; color: string }> = {
  paid: { label: 'Confirmed', icon: CheckCircle, color: 'text-green-600 bg-green-50 border-green-200' },
  cod_pending: { label: 'COD – Pending', icon: Clock, color: 'text-amber-600 bg-amber-50 border-amber-200' },
  pending: { label: 'Processing', icon: Clock, color: 'text-amber-600 bg-amber-50 border-amber-200' },
  shipped: { label: 'Shipped', icon: Truck, color: 'text-blue-600 bg-blue-50 border-blue-200' },
  failed: { label: 'Failed', icon: XCircle, color: 'text-red-600 bg-red-50 border-red-200' },
};

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userPhone, setUserPhone] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    async function loadOrders() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setLoading(false);
        return;
      }

      const email = session.user.email || null;
      const phone = session.user.phone || null;
      setUserEmail(email);
      setUserPhone(phone);

      try {
        const params = new URLSearchParams();
        if (email) params.set('email', email);
        if (phone) params.set('phone', phone);

        const res = await fetch(`/api/orders?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setOrders(data);
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, [supabase.auth]);

  if (loading) {
    return (
      <main className="min-h-[60vh] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-neutral-400" />
      </main>
    );
  }

  if (!userEmail && !userPhone) {
    return (
      <main className="container mx-auto px-4 py-16 max-w-2xl text-center min-h-[60vh] flex flex-col items-center justify-center">
        <Package size={48} className="text-neutral-300 mb-4" />
        <h1 className="text-2xl font-black uppercase tracking-tight mb-2">Sign in to view orders</h1>
        <p className="text-neutral-500 mb-6">Log in to your SoleVault account to see your order history.</p>
        <Link href="/login" className="bg-black text-white px-8 py-3 font-bold uppercase tracking-wider hover:bg-[#E63946] transition-colors btn-press">
          Log In
        </Link>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-12 max-w-3xl min-h-[60vh]">
      <div className="mb-10">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#E63946] mb-3">Account</p>
        <h1 className="text-3xl font-black uppercase tracking-tight">My Orders</h1>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20 border border-neutral-200">
          <Package size={48} className="text-neutral-300 mx-auto mb-4" />
          <p className="text-neutral-500 mb-6">You haven't placed any orders yet.</p>
          <Link href="/products" className="bg-black text-white px-8 py-3 font-bold uppercase tracking-wider hover:bg-[#E63946] transition-colors btn-press inline-block">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((order) => {
            const config = statusConfig[order.status] || statusConfig.pending;
            const StatusIcon = config.icon;
            const items = Array.isArray(order.items) ? order.items : [];
            const date = new Date(order.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric', month: 'short', year: 'numeric',
            });

            return (
              <div key={order.id} className="border border-neutral-200 hover:border-neutral-300 transition-colors">
                {/* Order header */}
                <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-neutral-50 border-b border-neutral-200">
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide px-2.5 py-1 border ${config.color}`}>
                      <StatusIcon size={12} />
                      {config.label}
                    </span>
                    <span className="text-xs text-neutral-500">{date}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-neutral-400 font-mono">{order.txnid}</p>
                    <p className="font-bold text-sm">{formatCurrency(order.amount)}</p>
                  </div>
                </div>

                {/* Order items */}
                <div className="p-4">
                  <div className="flex flex-col gap-2">
                    {items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-sm">
                        <div>
                          <span className="font-semibold">{item.name}</span>
                          <span className="text-neutral-400 ml-2">Size {item.size}</span>
                        </div>
                        <span className="font-semibold">{formatCurrency(item.price)}</span>
                      </div>
                    ))}
                  </div>
                  {order.address && (
                    <p className="text-xs text-neutral-400 mt-3 pt-3 border-t border-neutral-100 truncate">
                      📍 {order.address}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}

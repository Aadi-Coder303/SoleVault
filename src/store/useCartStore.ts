import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string; // usually product_id + size
  productId: string;
  name: string;
  price: number;
  size: string;
  imageUrl: string;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  _userId: string | null;
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  syncFromServer: (userId: string) => Promise<void>;
  syncToServer: () => void;
  setUserId: (userId: string | null) => void;
}

let syncTimeout: ReturnType<typeof setTimeout> | null = null;

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      _userId: null,

      setUserId: (userId) => set({ _userId: userId }),

      syncFromServer: async (userId: string) => {
        try {
          const res = await fetch(`/api/user/sync?userId=${userId}`);
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data.cart) && data.cart.length > 0) {
              set({ items: data.cart, _userId: userId });
            } else {
              set({ _userId: userId });
              // Push local cart to server if exists
              const local = get().items;
              if (local.length > 0) {
                get().syncToServer();
              }
            }
          }
        } catch { /* silent */ }
      },

      syncToServer: () => {
        // Debounce syncs
        if (syncTimeout) clearTimeout(syncTimeout);
        syncTimeout = setTimeout(() => {
          const { items, _userId } = get();
          if (!_userId) return;
          fetch('/api/user/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: _userId, cart: items }),
          }).catch(() => {});
        }, 500);
      },

      addItem: (item) => {
        const isNew = !get().items.find(i => i.id === item.id);
        set((state) => {
          const existingItem = state.items.find(i => i.id === item.id);
          if (existingItem) {
            return {
              items: state.items.map(i =>
                i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
              )
            };
          }
          return { items: [...state.items, { ...item, quantity: 1 }] };
        });
        get().syncToServer();
        // Fire cart event for owner notifications (only for new items)
        if (isNew && typeof window !== 'undefined') {
          const visitorId = localStorage.getItem('sv_visitor_id') || 'unknown';
          fetch('/api/analytics/cart-event', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              productName: item.name,
              productId: item.productId,
              size: item.size,
              price: item.price,
              visitorId,
            }),
          }).catch(() => {});
        }
      },

      removeItem: (id) => {
        set((state) => ({ items: state.items.filter(i => i.id !== id) }));
        get().syncToServer();
      },

      updateQuantity: (id, quantity) => {
        set((state) => {
          if (quantity <= 0) return { items: state.items.filter(i => i.id !== id) };
          return { items: state.items.map(i => i.id === id ? { ...i, quantity } : i) };
        });
        get().syncToServer();
      },

      clearCart: () => {
        set({ items: [] });
        get().syncToServer();
      },

      getTotalItems: () => get().items.reduce((total, item) => total + item.quantity, 0),
      getTotalPrice: () => get().items.reduce((total, item) => total + (item.price * item.quantity), 0),
    }),
    {
      name: 'solevault-cart-storage',
    }
  )
);

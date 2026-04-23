import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WishlistStore {
  items: string[]; // array of product IDs
  toggleItem: (productId: string) => void;
  hasItem: (productId: string) => boolean;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      toggleItem: (productId) => set((state) => {
        if (state.items.includes(productId)) {
          return { items: state.items.filter(id => id !== productId) };
        }
        return { items: [...state.items, productId] };
      }),
      hasItem: (productId) => get().items.includes(productId),
    }),
    {
      name: 'solevault-wishlist-storage',
    }
  )
);

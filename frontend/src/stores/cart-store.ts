import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;           // cart item ID (from API) or temp ID
  productId: string;
  name: string;
  price: number;
  coverImage: string | null;
  quantity: number;
  stock: number;        // available stock for validation
  selected: boolean;    // for checkout selection
}

export interface AddCartItemInput {
  productId: string;
  name: string;
  price: number;
  coverImage: string | null;
  quantity: number;
  stock: number;
  id?: string;          // optional API-assigned ID
}

interface CartStore {
  items: CartItem[];
  isLoading: boolean;

  // Actions
  addItem: (item: AddCartItemInput) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  toggleSelect: (productId: string) => void;
  selectAll: () => void;
  deselectAll: () => void;
  removeSelected: () => void;
  clearCart: () => void;

  // Computed-like helpers
  getSelectedCount: () => number;
  getSelectedTotal: () => number;
  getTotalCount: () => number;
  getSelectedItems: () => CartItem[];

  // Server sync
  syncFromServer: (items: CartItem[]) => void;
  setLoading: (loading: boolean) => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,

      addItem: (item) =>
        set((state) => {
          const existing = state.items.find(
            (i) => i.productId === item.productId,
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === item.productId
                  ? {
                      ...i,
                      quantity: Math.min(i.quantity + item.quantity, i.stock),
                    }
                  : i,
              ),
            };
          }
          return {
            items: [
              ...state.items,
              {
                id: item.id ?? `temp-${Date.now()}`,
                productId: item.productId,
                name: item.name,
                price: item.price,
                coverImage: item.coverImage,
                quantity: Math.min(item.quantity, item.stock),
                stock: item.stock,
                selected: true,
              },
            ],
          };
        }),

      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        })),

      updateQuantity: (productId, quantity) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId
              ? { ...i, quantity: Math.max(1, Math.min(quantity, i.stock)) }
              : i,
          ),
        })),

      toggleSelect: (productId) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId ? { ...i, selected: !i.selected } : i,
          ),
        })),

      selectAll: () =>
        set((state) => ({
          items: state.items.map((i) => ({ ...i, selected: true })),
        })),

      deselectAll: () =>
        set((state) => ({
          items: state.items.map((i) => ({ ...i, selected: false })),
        })),

      removeSelected: () =>
        set((state) => ({
          items: state.items.filter((i) => !i.selected),
        })),

      clearCart: () => set({ items: [] }),

      getSelectedCount: () =>
        get()
          .items.filter((i) => i.selected)
          .reduce((sum, i) => sum + i.quantity, 0),

      getSelectedTotal: () =>
        get()
          .items.filter((i) => i.selected)
          .reduce((sum, i) => sum + i.price * i.quantity, 0),

      getTotalCount: () =>
        get().items.reduce((sum, i) => sum + i.quantity, 0),

      getSelectedItems: () => get().items.filter((i) => i.selected),

      syncFromServer: (items) => set({ items }),

      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'lc-cart-storage',
      partialize: (state) => ({ items: state.items }),
    },
  ),
);

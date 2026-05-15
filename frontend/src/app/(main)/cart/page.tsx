'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/stores/cart-store';
import { useAuth } from '@/contexts/auth-context';
import { getCart, updateCartItem, removeCartItem } from '@/lib/cart-api';
import styles from './page.module.css';

export default function CartPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const items = useCartStore((s) => s.items);
  const isLoading = useCartStore((s) => s.isLoading);
  const toggleSelect = useCartStore((s) => s.toggleSelect);
  const selectAll = useCartStore((s) => s.selectAll);
  const deselectAll = useCartStore((s) => s.deselectAll);
  const removeSelected = useCartStore((s) => s.removeSelected);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const syncFromServer = useCartStore((s) => s.syncFromServer);
  const setLoading = useCartStore((s) => s.setLoading);
  const getSelectedCount = useCartStore((s) => s.getSelectedCount);
  const getSelectedTotal = useCartStore((s) => s.getSelectedTotal);

  const [mounted, setMounted] = useState(false);

  // Derive computed values from store
  const selectedCount = useMemo(() => getSelectedCount(), [getSelectedCount]);
  const selectedTotal = useMemo(() => getSelectedTotal(), [getSelectedTotal]);
  const allSelected = items.length > 0 && items.every((i) => i.selected);
  const hasSelected = selectedCount > 0;

  // Sync from server on mount when logged in
  useEffect(() => {
    setMounted(true); // eslint-disable-line react-hooks/set-state-in-effect -- data fetching pattern

    async function fetchCart() {
      if (!isAuthenticated) return;
      setLoading(true);
      try {
        const serverItems = await getCart();
        if (!Array.isArray(serverItems)) return;
        const mapped = serverItems.map((item) => ({
          id: item.id,
          productId: item.productId,
          name: item.product.name,
          price: item.product.price,
          coverImage: item.product.coverImage,
          quantity: item.quantity,
          stock: item.product.stock,
          selected: true,
        }));
        syncFromServer(mapped);
      } catch {
        // If API fails, keep localStorage cart
      } finally {
        setLoading(false);
      }
    }

    if (!authLoading) {
      void fetchCart();
    }
  }, [isAuthenticated, authLoading, syncFromServer, setLoading]);

  // Handlers
  const handleToggleSelectAll = useCallback(() => {
    if (allSelected) {
      deselectAll();
    } else {
      selectAll();
    }
  }, [allSelected, selectAll, deselectAll]);

  const handleQuantityChange = useCallback(
    async (productId: string, newQty: number, cartItemId?: string) => {
      const item = items.find((i) => i.productId === productId);
      if (!item) return;
      const clamped = Math.max(1, Math.min(newQty, item.stock));
      updateQuantity(productId, clamped);

      if (isAuthenticated && cartItemId) {
        try {
          await updateCartItem(cartItemId, clamped);
        } catch {
          // Keep local state on API failure
        }
      }
    },
    [items, updateQuantity, isAuthenticated],
  );

  const handleDelete = useCallback(
    async (productId: string, cartItemId?: string) => {
      removeItem(productId);
      if (isAuthenticated && cartItemId) {
        try {
          await removeCartItem(cartItemId);
        } catch {
          // Already removed locally
        }
      }
    },
    [removeItem, isAuthenticated],
  );

  const handleDeleteSelected = useCallback(async () => {
    const selectedItems = items.filter((i) => i.selected);
    removeSelected();

    if (isAuthenticated) {
      for (const item of selectedItems) {
        try {
          await removeCartItem(item.id);
        } catch {
          // Continue removing others
        }
      }
    }
  }, [items, removeSelected, isAuthenticated]);

  const handleCheckout = useCallback(() => {
    router.push('/checkout');
  }, [router]);

  // Prevent hydration mismatch
  if (!mounted) {
    return <div className={styles.page} />;
  }

  const isEmpty = items.length === 0;

  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <h1 className={styles.title}>
          购物车
          {!isEmpty && (
            <span className={styles.titleCount}>({items.length})</span>
          )}
        </h1>
      </header>

      <div className={styles.container}>
        {isLoading ? (
          <div className={styles.loading}>加载中...</div>
        ) : isEmpty ? (
          /* Empty State */
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <svg
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
            </div>
            <p className={styles.emptyTitle}>购物车还是空的</p>
            <p className={styles.emptyText}>快去挑选心仪的商品吧</p>
            <Link href="/shop" className={styles.emptyButton}>
              去逛逛
            </Link>
          </div>
        ) : (
          <>
            {/* Batch Actions Bar */}
            <div className={styles.batchBar}>
              <label className={styles.selectAllRow}>
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  checked={allSelected}
                  onChange={handleToggleSelectAll}
                />
                <span className={styles.selectAllLabel}>全选</span>
              </label>
              <div className={styles.batchActions}>
                {hasSelected && (
                  <button
                    type="button"
                    className={styles.deleteSelectedButton}
                    onClick={handleDeleteSelected}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                    </svg>
                    删除选中
                  </button>
                )}
              </div>
            </div>

            {/* Cart Items */}
            <ul className={styles.itemList}>
              {items.map((item) => (
                <li key={item.productId} className={styles.item}>
                  {/* Checkbox */}
                  <div className={styles.itemSelect}>
                    <input
                      type="checkbox"
                      className={styles.checkbox}
                      checked={item.selected}
                      onChange={() => toggleSelect(item.productId)}
                    />
                  </div>

                  {/* Product Image */}
                  <div className={styles.itemImage} style={{ position: 'relative' }}>
                    {item.coverImage ? (
                      <Image
                        src={item.coverImage}
                        alt={item.name}
                        fill
                        unoptimized
                      />
                    ) : (
                      <div className={styles.imagePlaceholder}>
                        <svg
                          width="32"
                          height="32"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <rect
                            x="3"
                            y="3"
                            width="18"
                            height="18"
                            rx="2"
                            ry="2"
                          />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <polyline points="21 15 16 10 5 21" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className={styles.itemInfo}>
                    <p className={styles.itemName}>
                      <Link
                        href={`/shop/${item.productId}`}
                        className={styles.itemNameLink}
                      >
                        {item.name}
                      </Link>
                    </p>
                    <span className={styles.itemUnitPrice}>
                      ¥{item.price.toFixed(2)}
                    </span>
                  </div>

                  {/* Quantity Stepper */}
                  <div className={styles.quantityStepper}>
                    <button
                      type="button"
                      className={styles.stepperButton}
                      disabled={item.quantity <= 1}
                      onClick={() =>
                        handleQuantityChange(
                          item.productId,
                          item.quantity - 1,
                          item.id,
                        )
                      }
                      aria-label="减少数量"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      className={styles.quantityInput}
                      value={item.quantity}
                      min={1}
                      max={item.stock}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        if (!isNaN(val)) {
                          handleQuantityChange(item.productId, val, item.id);
                        }
                      }}
                      aria-label="商品数量"
                    />
                    <button
                      type="button"
                      className={styles.stepperButton}
                      disabled={item.quantity >= item.stock}
                      onClick={() =>
                        handleQuantityChange(
                          item.productId,
                          item.quantity + 1,
                          item.id,
                        )
                      }
                      aria-label="增加数量"
                    >
                      +
                    </button>
                  </div>

                  {/* Subtotal */}
                  <div className={styles.itemSubtotal}>
                    ¥{(item.price * item.quantity).toFixed(2)}
                  </div>

                  {/* Delete */}
                  <button
                    type="button"
                    className={styles.deleteButton}
                    onClick={() => handleDelete(item.productId, item.id)}
                    aria-label={`删除 ${item.name}`}
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                      <line x1="10" y1="11" x2="10" y2="17" />
                      <line x1="14" y1="11" x2="14" y2="17" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      {/* Bottom Fixed Bar */}
      {!isEmpty && (
        <div className={styles.bottomBar}>
          <div className={styles.bottomBarInner}>
            <span className={styles.selectedInfo}>
              已选 <span className={styles.selectedCount}>{selectedCount}</span> 件
            </span>
            <div className={styles.totalSection}>
              <span className={styles.totalLabel}>合计:</span>
              <span className={styles.totalPrice}>
                ¥{selectedTotal.toFixed(2)}
              </span>
            </div>
            <button
              type="button"
              className={styles.checkoutButton}
              disabled={!hasSelected}
              onClick={handleCheckout}
            >
              去结算
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

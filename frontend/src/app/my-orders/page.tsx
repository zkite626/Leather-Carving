'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getOrders, payOrder, cancelOrder, confirmOrder } from '@/lib/order-api';
import { Pagination } from '@/components/ui/pagination/pagination';
import { Skeleton } from '@/components/ui/skeleton/skeleton';
import type { IOrder, OrderStatus } from '@/shared/types/product';
import type { PaginatedResponse } from '@/shared/types/api';
import styles from './page.module.css';

interface TabOption {
  label: string;
  status: OrderStatus | '';
}

const TAB_OPTIONS: TabOption[] = [
  { label: '全部', status: '' },
  { label: '待付款', status: 'PENDING' },
  { label: '待发货', status: 'PAID' },
  { label: '待收货', status: 'SHIPPING' },
  { label: '已完成', status: 'COMPLETED' },
];

const STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: '待付款',
  PAID: '待发货',
  SHIPPING: '待收货',
  COMPLETED: '已完成',
  CANCELLED: '已取消',
  REFUNDING: '退款中',
  REFUNDED: '已退款',
};

const STATUS_CLASS: Record<OrderStatus, string> = {
  PENDING: styles.statusPending,
  PAID: styles.statusPaid,
  SHIPPING: styles.statusShipping,
  COMPLETED: styles.statusCompleted,
  CANCELLED: styles.statusCancelled,
  REFUNDING: styles.statusCancelled,
  REFUNDED: styles.statusCancelled,
};

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeStatus, setActiveStatus] = useState<OrderStatus | ''>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  });
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});

  const fetchOrders = useCallback(async (page: number, status: OrderStatus | '') => {
    setLoading(true);
    try {
      const query: { page: number; pageSize: number; status?: OrderStatus } = {
        page,
        pageSize: 10,
      };
      if (status) query.status = status;

      const res: PaginatedResponse<IOrder> = await getOrders(query);
      setOrders(res.data);
      setPagination(res.pagination);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch orders on mount and when tab/page changes
  useEffect(() => {
    void fetchOrders(currentPage, activeStatus); // eslint-disable-line react-hooks/set-state-in-effect -- data fetching pattern
  }, [currentPage, activeStatus, fetchOrders]);

  // Fetch counts for all statuses on mount
  useEffect(() => {
    async function fetchCounts() {
      const counts: Record<string, number> = {};
      counts[''] = 0;

      const promises = TAB_OPTIONS.filter((t) => t.status !== '').map(async (tab) => {
        try {
          const res = await getOrders({ page: 1, pageSize: 1, status: tab.status as OrderStatus });
          counts[tab.status] = res.pagination.total;
        } catch {
          counts[tab.status] = 0;
        }
      });

      await Promise.all(promises);

      // "All" count = sum of all statuses
      const totalAll = Object.values(counts).reduce((sum, n) => sum + n, 0);
      counts[''] = totalAll;

      setStatusCounts(counts);
    }
    void fetchCounts();
  }, []);

  const handleTabChange = (status: OrderStatus | '') => {
    setActiveStatus(status);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 200, behavior: 'smooth' });
  };

  const handlePay = async (orderId: string) => {
    try {
      await payOrder(orderId);
      fetchOrders(currentPage, activeStatus);
    } catch {
      // Error handled silently; real app would show toast
    }
  };

  const handleCancel = async (orderId: string) => {
    if (!window.confirm('确定要取消该订单吗？')) return;
    try {
      await cancelOrder(orderId);
      fetchOrders(currentPage, activeStatus);
    } catch {
      // Error handled silently
    }
  };

  const handleConfirm = async (orderId: string) => {
    if (!window.confirm('确认已收到商品？')) return;
    try {
      await confirmOrder(orderId);
      fetchOrders(currentPage, activeStatus);
    } catch {
      // Error handled silently
    }
  };

  function formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const h = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${y}-${m}-${day} ${h}:${min}`;
  }

  function formatPrice(price: number): string {
    return (price / 100).toFixed(2);
  }

  function renderActions(order: IOrder) {
    switch (order.status) {
      case 'PENDING':
        return (
          <div className={styles.actions}>
            <button
              type="button"
              className={`${styles.btn} ${styles.btnPrimary}`}
              onClick={() => handlePay(order.id)}
            >
              去支付
            </button>
            <button
              type="button"
              className={`${styles.btn} ${styles.btnGhost}`}
              onClick={() => handleCancel(order.id)}
            >
              取消订单
            </button>
          </div>
        );
      case 'PAID':
        return (
          <div className={styles.actions}>
            <button
              type="button"
              className={`${styles.btn} ${styles.btnGhost}`}
              onClick={() => {
                /* reminder action - no API yet */
              }}
            >
              提醒发货
            </button>
          </div>
        );
      case 'SHIPPING':
        return (
          <div className={styles.actions}>
            <button
              type="button"
              className={`${styles.btn} ${styles.btnPrimary}`}
              onClick={() => handleConfirm(order.id)}
            >
              确认收货
            </button>
          </div>
        );
      case 'COMPLETED':
        return (
          <div className={styles.actions}>
            <button
              type="button"
              className={`${styles.btn} ${styles.btnGhost}`}
            >
              评价
            </button>
            <button
              type="button"
              className={`${styles.btn} ${styles.btnGhost}`}
            >
              再次购买
            </button>
          </div>
        );
      case 'CANCELLED':
        return <span className={styles.btnCancelLabel}>已取消</span>;
      default:
        return null;
    }
  }

  return (
    <div className={styles.page}>
      {/* Page Header */}
      <header className={styles.header}>
        <h1 className={styles.headerTitle}>我的订单</h1>
      </header>

      <div className={styles.container}>
        {/* Status Tabs */}
        <div className={styles.tabs} role="tablist">
          {TAB_OPTIONS.map((tab) => (
            <button
              key={tab.status}
              type="button"
              role="tab"
              aria-selected={activeStatus === tab.status}
              className={`${styles.tab} ${activeStatus === tab.status ? styles.tabActive : ''}`}
              onClick={() => handleTabChange(tab.status as OrderStatus | '')}
            >
              {tab.label}
              {statusCounts[tab.status] !== undefined && statusCounts[tab.status] > 0 && (
                <span className={styles.tabBadge}>{statusCounts[tab.status]}</span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className={styles.orderList}>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className={styles.skeletonCard}>
                <div className={styles.skeletonHeader}>
                  <Skeleton width="200px" height="18px" />
                  <Skeleton width="60px" height="22px" />
                </div>
                <div className={styles.skeletonBody}>
                  <Skeleton variant="rectangular" width="64px" height="64px" />
                  <div style={{ flex: 1 }}>
                    <Skeleton width="60%" height="16px" />
                    <div style={{ marginTop: 8 }}>
                      <Skeleton width="40%" height="14px" />
                    </div>
                  </div>
                </div>
                <div className={styles.skeletonFooter}>
                  <Skeleton width="120px" height="20px" />
                  <Skeleton width="100px" height="32px" />
                </div>
              </div>
            ))}
          </div>
        ) : orders.length > 0 ? (
          <>
            <div className={styles.orderList}>
              {orders.map((order) => (
                <div key={order.id} className={styles.orderCard}>
                  {/* Order Header */}
                  <div className={styles.orderHeader}>
                    <div className={styles.orderMeta}>
                      <span className={styles.orderNo}>订单号：{order.orderNo}</span>
                      <span className={styles.orderDate}>{formatDate(order.createdAt)}</span>
                    </div>
                    <span
                      className={`${styles.statusTag} ${STATUS_CLASS[order.status] || ''}`}
                    >
                      {STATUS_LABEL[order.status] || order.status}
                    </span>
                  </div>

                  {/* Order Items */}
                  <div className={styles.orderItems}>
                    <div className={styles.orderItemList}>
                      {order.items.map((item) => (
                        <div key={item.id} className={styles.orderItem} style={{ position: 'relative' }}>
                          <Image
                            className={styles.itemImage}
                            src={item.productImage}
                            alt={item.productName}
                            fill
                            unoptimized
                          />
                          <div className={styles.itemInfo}>
                            <div className={styles.itemName}>{item.productName}</div>
                            <div className={styles.itemDetail}>
                              <span className={styles.itemPrice}>
                                ¥{formatPrice(item.price)}
                              </span>
                              <span className={styles.itemQuantity}>x{item.quantity}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Footer */}
                  <div className={styles.orderFooter}>
                    <span className={styles.orderTotal}>
                      共 {order.items.reduce((sum, i) => sum + i.quantity, 0)} 件商品
                      合计：<span className={styles.orderTotalAmount}>¥{formatPrice(order.payAmount)}</span>
                    </span>
                    {renderActions(order)}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className={styles.paginationWrapper}>
                <Pagination
                  current={pagination.page}
                  total={pagination.total}
                  pageSize={pagination.pageSize}
                  onChange={handlePageChange}
                />
              </div>
            )}
          </>
        ) : (
          /* Empty State */
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden="true">
                <path
                  d="M16 16H48V52H16V16Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M24 16V12H40V16"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M24 28H40"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M24 36H36"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <h3 className={styles.emptyTitle}>暂无订单</h3>
            <Link href="/shop" className={styles.emptyLink}>
              去商城逛逛
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

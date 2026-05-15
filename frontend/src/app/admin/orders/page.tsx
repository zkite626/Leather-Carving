'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { getAdminOrders, updateOrderStatus, type AdminOrder, type PaginatedResult } from '@/lib/admin-api';
import styles from '../shop/page.module.css';

const orderStatusLabels: Record<string, string> = {
  PENDING: '待付款', PAID: '已付款', SHIPPING: '发货中',
  COMPLETED: '已完成', CANCELLED: '已取消', REFUNDING: '退款中', REFUNDED: '已退款',
};

const validTransitions: Record<string, string[]> = {
  PENDING: ['CANCELLED'],
  PAID: ['SHIPPING', 'CANCELLED'],
  SHIPPING: ['COMPLETED'],
  COMPLETED: ['REFUNDING'],
};

const transitionLabels: Record<string, string> = {
  SHIPPING: '标记发货', COMPLETED: '确认完成', CANCELLED: '取消订单', REFUNDING: '退款',
};

export default function AdminOrdersPage() {
  const [data, setData] = useState<PaginatedResult<AdminOrder> | null>(null);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [statusModal, setStatusModal] = useState<{ orderId: string; newStatus: string } | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, string | number | undefined> = { page, pageSize: 20 };
      if (keyword) params.keyword = keyword;
      if (statusFilter) params.status = statusFilter;
      setData(await getAdminOrders(params));
    } catch { /* */ } finally { setLoading(false); }
  }, [page, keyword, statusFilter]);

  useEffect(() => { void fetchOrders(); }, [fetchOrders]);

  const handleStatusUpdate = async () => {
    if (!statusModal) return;
    try { await updateOrderStatus(statusModal.orderId, statusModal.newStatus); setStatusModal(null); fetchOrders(); } catch { /* */ }
  };

  const orders = data?.items ?? [];
  const totalPages = data?.pagination.totalPages ?? 1;
  const total = data?.pagination.total ?? 0;

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>订单管理</h1>
        <span style={{ fontSize: 'var(--lc-text-sm)', color: 'var(--lc-text-muted)' }}>共 {total} 笔订单</span>
      </div>

      <div className={styles.filters}>
        <input className={styles.searchInput} placeholder="搜索订单号、用户..." value={keyword} onChange={(e) => { setKeyword(e.target.value); setPage(1); }} />
        <select className={styles.select} value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="">全部状态</option>
          {Object.entries(orderStatusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      <div className={styles.tableCard}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>订单</th>
              <th>商品</th>
              <th>金额</th>
              <th>状态</th>
              <th>下单时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--lc-text-muted)' }}>加载中...</td></tr>
            ) : orders.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--lc-text-muted)' }}>暂无订单</td></tr>
            ) : orders.map((o) => (
              <tr key={o.id}>
                <td>
                  <div className={styles.orderCell}>
                    <span className={styles.orderNo}>{o.orderNo}</span>
                    <span className={styles.orderUser}>{o.user.nickname}</span>
                  </div>
                </td>
                <td>
                  <div className={styles.orderItems}>
                    {o.items.slice(0, 3).map((item) => (
                      <span key={item.id} className={styles.orderItem}>{item.productName} x{item.quantity}</span>
                    ))}
                    {o.items.length > 3 && <span className={styles.orderItem}>+{o.items.length - 3} 更多</span>}
                  </div>
                </td>
                <td style={{ fontWeight: 600 }}>¥{Number(o.payAmount).toFixed(2)}</td>
                <td>
                  <span className={`${styles.tag} ${styles['tag' + o.status]}`}>
                    {orderStatusLabels[o.status]}
                  </span>
                </td>
                <td style={{ fontSize: 'var(--lc-text-xs)', color: 'var(--lc-text-muted)' }}>
                  {new Date(o.createdAt).toLocaleDateString('zh-CN')}
                </td>
                <td>
                  <div className={styles.actions}>
                    {(validTransitions[o.status] ?? []).map((s) => (
                      <button
                        key={s}
                        className={`${styles.iconBtn} ${s === 'CANCELLED' || s === 'REFUNDING' ? styles.iconBtnDanger : s === 'COMPLETED' ? styles.iconBtnSuccess : styles.iconBtnPrimary}`}
                        title={transitionLabels[s]}
                        onClick={() => setStatusModal({ orderId: o.id, newStatus: s })}
                      >
                        {s === 'SHIPPING' && <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>}
                        {s === 'COMPLETED' && <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                        {s === 'CANCELLED' && <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>}
                        {s === 'REFUNDING' && <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>}
                      </button>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {data && (
          <div className={styles.pagination}>
            <span className={styles.paginationInfo}>第 {page} / {totalPages} 页，共 {total} 条</span>
            <div className={styles.paginationBtns}>
              <button className={styles.paginationBtn} disabled={page <= 1} onClick={() => setPage(page - 1)}>上一页</button>
              <button className={styles.paginationBtn} disabled={page >= totalPages} onClick={() => setPage(page + 1)}>下一页</button>
            </div>
          </div>
        )}
      </div>

      {statusModal && (
        <div className={styles.modalOverlay} onClick={() => setStatusModal(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>确认操作</h3>
            <p style={{ marginBottom: 'var(--lc-space-4)', fontSize: 'var(--lc-text-sm)', color: 'var(--lc-text-secondary)' }}>
              确定将订单状态更新为「{transitionLabels[statusModal.newStatus]}」？
            </p>
            <div className={styles.modalActions}>
              <button className={styles.modalBtn} onClick={() => setStatusModal(null)}>取消</button>
              <button className={`${styles.modalBtn} ${styles.modalBtnPrimary}`} onClick={handleStatusUpdate}>确认</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

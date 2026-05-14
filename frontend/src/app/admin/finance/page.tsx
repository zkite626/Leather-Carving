'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  getFinanceSummary, getTransactions, getMerchantSettlements,
  getExportUrl, type FinanceSummary, type Transaction, type MerchantSettlement, type PaginatedResult,
} from '@/lib/admin-api';
import styles from './page.module.css';

export default function AdminFinancePage() {
  const [tab, setTab] = useState<'transactions' | 'settlements'>('transactions');
  const [summary, setSummary] = useState<FinanceSummary | null>(null);
  const [txData, setTxData] = useState<PaginatedResult<Transaction> | null>(null);
  const [settlements, setSettlements] = useState<MerchantSettlement[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    void getFinanceSummary().then(setSummary).catch(() => {});
    void getMerchantSettlements().then(setSettlements).catch(() => {});
  }, []);

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, string | number | undefined> = { page, pageSize: 20 };
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      const result = await getTransactions(params);
      setTxData(result);
    } catch { /* */ } finally { setLoading(false); }
  }, [page, startDate, endDate]);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- data fetching pattern
  useEffect(() => { void fetchTransactions(); }, [fetchTransactions]);

  const transactions = txData?.items ?? [];
  const totalPages = txData?.pagination.totalPages ?? 1;
  const total = txData?.pagination.total ?? 0;

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>财务管理</h1>
        <a
          href={getExportUrl({ startDate: startDate || undefined, endDate: endDate || undefined })}
          className={styles.exportBtn}
          target="_blank"
          rel="noopener"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
          导出 CSV
        </a>
      </div>

      {summary && (
        <div className={styles.summaryGrid}>
          <div className={styles.summaryCard}>
            <div className={styles.summaryLabel}>总收入</div>
            <div className={styles.summaryValue}>¥{summary.totalRevenue.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}</div>
            <div className={styles.summaryLabel}>{summary.paidOrderCount} 笔已付款订单</div>
          </div>
          <div className={styles.summaryCard}>
            <div className={styles.summaryLabel}>本月收入</div>
            <div className={styles.summaryValue}>¥{summary.monthlyRevenue.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}</div>
            <span className={`${styles.summaryGrowth} ${summary.monthGrowth >= 0 ? styles.growthUp : styles.growthDown}`}>
              {summary.monthGrowth >= 0 ? '↑' : '↓'} {Math.abs(summary.monthGrowth)}%
            </span>
          </div>
          <div className={styles.summaryCard}>
            <div className={styles.summaryLabel}>平均客单价</div>
            <div className={styles.summaryValue}>¥{summary.averageOrderValue.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}</div>
            <div className={styles.summaryLabel}>共 {summary.orderCount} 笔订单</div>
          </div>
        </div>
      )}

      <div className={styles.tabs}>
        <button className={`${styles.tab} ${tab === 'transactions' ? styles.tabActive : ''}`} onClick={() => setTab('transactions')}>交易流水</button>
        <button className={`${styles.tab} ${tab === 'settlements' ? styles.tabActive : ''}`} onClick={() => setTab('settlements')}>商家结算</button>
      </div>

      {tab === 'transactions' && (
        <>
          <div className={styles.filters}>
            <input type="date" className={styles.dateInput} value={startDate} onChange={(e) => { setStartDate(e.target.value); setPage(1); }} />
            <span style={{ color: 'var(--lc-text-muted)', fontSize: 'var(--lc-text-sm)' }}>至</span>
            <input type="date" className={styles.dateInput} value={endDate} onChange={(e) => { setEndDate(e.target.value); setPage(1); }} />
          </div>

          <div className={styles.tableCard}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>交易号</th>
                  <th>订单号</th>
                  <th>用户</th>
                  <th>金额</th>
                  <th>支付方式</th>
                  <th>支付时间</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--lc-text-muted)' }}>加载中...</td></tr>
                ) : transactions.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--lc-text-muted)' }}>暂无交易记录</td></tr>
                ) : transactions.map((t) => (
                  <tr key={t.id}>
                    <td style={{ fontFamily: 'var(--lc-font-mono)', fontSize: 'var(--lc-text-xs)' }}>{t.transactionNo ?? '-'}</td>
                    <td style={{ fontFamily: 'var(--lc-font-mono)', fontSize: 'var(--lc-text-xs)' }}>{t.order.orderNo}</td>
                    <td>{t.order.user.nickname}</td>
                    <td style={{ fontWeight: 600 }}>¥{Number(t.amount).toFixed(2)}</td>
                    <td>{t.method}</td>
                    <td style={{ fontSize: 'var(--lc-text-xs)', color: 'var(--lc-text-muted)' }}>
                      {t.paidAt ? new Date(t.paidAt).toLocaleString('zh-CN') : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {txData && (
              <div className={styles.pagination}>
                <span className={styles.paginationInfo}>第 {page} / {totalPages} 页，共 {total} 条</span>
                <div className={styles.paginationBtns}>
                  <button className={styles.paginationBtn} disabled={page <= 1} onClick={() => setPage(page - 1)}>上一页</button>
                  <button className={styles.paginationBtn} disabled={page >= totalPages} onClick={() => setPage(page + 1)}>下一页</button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {tab === 'settlements' && (
        <div className={styles.tableCard}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>商家</th>
                <th>邮箱</th>
                <th>已结算金额</th>
                <th>订单数</th>
              </tr>
            </thead>
            <tbody>
              {settlements.length === 0 ? (
                <tr><td colSpan={4} style={{ textAlign: 'center', padding: '3rem', color: 'var(--lc-text-muted)' }}>暂无结算数据</td></tr>
              ) : settlements.map((s) => (
                <tr key={s.merchantId}>
                  <td>{s.nickname}</td>
                  <td style={{ fontSize: 'var(--lc-text-xs)', color: 'var(--lc-text-muted)' }}>{s.email}</td>
                  <td style={{ fontWeight: 600 }}>¥{s.totalAmount.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}</td>
                  <td>{s.orderCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

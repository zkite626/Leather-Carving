'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { getAuditLogs, type AuditLogEntry, type PaginatedResult } from '@/lib/admin-api';
import styles from './page.module.css';

function formatDate(d: string) {
  return new Date(d).toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function getActionStyle(action: string): string {
  if (action.startsWith('CREATE')) return styles.actionCreate;
  if (action.startsWith('UPDATE')) return styles.actionUpdate;
  if (action.startsWith('DELETE')) return styles.actionDelete;
  if (action.startsWith('FAIL')) return styles.actionFail;
  return styles.actionUpdate;
}

export default function AdminAuditLogPage() {
  const [data, setData] = useState<PaginatedResult<AuditLogEntry> | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, string | number | undefined> = { page, pageSize: 20 };
      if (actionFilter) params.action = actionFilter;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      const result = await getAuditLogs(params);
      setData(result);
    } catch { /* */ } finally { setLoading(false); }
  }, [page, actionFilter, startDate, endDate]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const logs = data?.items ?? [];
  const totalPages = data?.pagination.totalPages ?? 1;
  const total = data?.pagination.total ?? 0;

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>审计日志</h1>
        <span style={{ fontSize: 'var(--lc-text-sm)', color: 'var(--lc-text-muted)' }}>共 {total} 条记录</span>
      </div>

      <div className={styles.filters}>
        <input
          className={styles.searchInput}
          placeholder="筛选操作类型..."
          value={actionFilter}
          onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
        />
        <input type="date" className={styles.dateInput} value={startDate} onChange={(e) => { setStartDate(e.target.value); setPage(1); }} />
        <span style={{ color: 'var(--lc-text-muted)', fontSize: 'var(--lc-text-sm)' }}>至</span>
        <input type="date" className={styles.dateInput} value={endDate} onChange={(e) => { setEndDate(e.target.value); setPage(1); }} />
      </div>

      <div className={styles.tableCard}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>时间</th>
              <th>操作者</th>
              <th>操作</th>
              <th>目标类型</th>
              <th>IP</th>
              <th>详情</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--lc-text-muted)' }}>加载中...</td></tr>
            ) : logs.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--lc-text-muted)' }}>暂无审计日志</td></tr>
            ) : logs.map((log) => (
              <React.Fragment key={log.id}>
                <tr>
                  <td style={{ fontSize: 'var(--lc-text-xs)', color: 'var(--lc-text-muted)', whiteSpace: 'nowrap' }}>
                    {formatDate(log.createdAt)}
                  </td>
                  <td>
                    <div className={styles.userCell}>
                      <div className={styles.userAvatar}>
                        {log.user?.nickname?.charAt(0)?.toUpperCase() ?? 'S'}
                      </div>
                      <span style={{ fontSize: 'var(--lc-text-sm)' }}>{log.user?.nickname ?? '系统'}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`${styles.actionTag} ${getActionStyle(log.action)}`}>
                      {log.action}
                    </span>
                  </td>
                  <td style={{ fontSize: 'var(--lc-text-sm)' }}>{log.entityType}{log.entityId ? ` / ${log.entityId.substring(0, 8)}...` : ''}</td>
                  <td style={{ fontSize: 'var(--lc-text-xs)', color: 'var(--lc-text-muted)', fontFamily: 'var(--lc-font-mono)' }}>{log.ip ?? '-'}</td>
                  <td>
                    {Boolean(log.newData || log.oldData) && (
                      <button className={styles.detailBtn} onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}>
                        {expandedId === log.id ? '收起' : '展开'}
                      </button>
                    )}
                  </td>
                </tr>
                {expandedId === log.id && (
                  <tr className={styles.expandedRow}>
                    <td colSpan={6}>
                      <div className={styles.expandedContent}>
                        {Boolean(log.newData) && (
                          <>
                            <div className={styles.jsonLabel}>请求数据 (newData):</div>
                            <pre className={styles.jsonBlock}>{JSON.stringify(log.newData, null, 2)}</pre>
                          </>
                        )}
                        {Boolean(log.oldData) && (
                          <>
                            <div className={styles.jsonLabel}>变更前数据 (oldData):</div>
                            <pre className={styles.jsonBlock}>{JSON.stringify(log.oldData, null, 2)}</pre>
                          </>
                        )}
                        {log.userAgent && (
                          <>
                            <div className={styles.jsonLabel}>User Agent:</div>
                            <pre className={styles.jsonBlock}>{log.userAgent}</pre>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>

        {data && (
          <div className={styles.pagination}>
            <span className={styles.paginationInfo}>第 {page} / {totalPages} 页，共 {total} 条</span>
            <div className={styles.paginationBtns}>
              <button className={styles.paginationBtn} disabled={page <= 1} onClick={() => setPage(page - 1)}>上一页</button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                if (p > totalPages) return null;
                return (
                  <button key={p} className={`${styles.paginationBtn} ${p === page ? styles.paginationBtnActive : ''}`} onClick={() => setPage(p)}>{p}</button>
                );
              })}
              <button className={styles.paginationBtn} disabled={page >= totalPages} onClick={() => setPage(page + 1)}>下一页</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  getContentReview, approveContent, rejectContent,
  batchApproveContent, batchRejectContent,
  type ReviewItem, type PaginatedResult,
} from '@/lib/admin-api';
import styles from './page.module.css';

const typeLabels: Record<string, string> = { course: '课程', artwork: '作品', post: '帖子' };
const statusLabels: Record<string, string> = { REVIEWING: '待审核', PUBLISHED: '已通过', REJECTED: '已驳回', DRAFT: '草稿' };

export default function AdminContentPage() {
  const [data, setData] = useState<PaginatedResult<ReviewItem> | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusTab, setStatusTab] = useState('REVIEWING');
  const [typeFilter, setTypeFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [rejectModal, setRejectModal] = useState<{ id: string; type: string } | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, string | number | undefined> = { page, pageSize: 20, status: statusTab };
      if (typeFilter !== 'all') params.type = typeFilter;
      const result = await getContentReview(params);
      setData(result);
    } catch { /* handled */ } finally { setLoading(false); }
  }, [page, statusTab, typeFilter]);

  useEffect(() => { fetchData(); setSelected(new Set()); }, [fetchData]);

  const handleApprove = async (type: string, id: string) => {
    try { await approveContent(type, id); fetchData(); } catch { /* */ }
  };

  const handleReject = async () => {
    if (!rejectModal || !rejectReason.trim()) return;
    try { await rejectContent(rejectModal.type, rejectModal.id, rejectReason); setRejectModal(null); setRejectReason(''); fetchData(); } catch { /* */ }
  };

  const handleBatchApprove = async () => {
    if (selected.size === 0) return;
    try { await batchApproveContent(Array.from(selected)); setSelected(new Set()); fetchData(); } catch { /* */ }
  };

  const handleBatchReject = async () => {
    if (selected.size === 0 || !rejectReason.trim()) return;
    try { await batchRejectContent(Array.from(selected), rejectReason); setSelected(new Set()); setRejectReason(''); fetchData(); } catch { /* */ }
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  };

  const items = data?.items ?? [];
  const totalPages = data?.pagination.totalPages ?? 1;
  const total = data?.pagination.total ?? 0;

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>内容审核</h1>
      </div>

      <div className={styles.tabs}>
        {['REVIEWING', 'PUBLISHED', 'REJECTED'].map((s) => (
          <button key={s} className={`${styles.tab} ${statusTab === s ? styles.tabActive : ''}`} onClick={() => { setStatusTab(s); setPage(1); }}>
            {statusLabels[s]}
          </button>
        ))}
      </div>

      <div className={styles.filters}>
        <select className={styles.select} value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}>
          <option value="all">全部类型</option>
          <option value="course">课程</option>
          <option value="artwork">作品</option>
          <option value="post">帖子</option>
        </select>
      </div>

      {statusTab === 'REVIEWING' && selected.size > 0 && (
        <div className={styles.batchActions}>
          <span style={{ fontSize: 'var(--lc-text-sm)', color: 'var(--lc-text-secondary)', marginRight: 'var(--lc-space-2)' }}>
            已选 {selected.size} 项
          </span>
          <button className={`${styles.batchBtn} ${styles.batchBtnApprove}`} onClick={handleBatchApprove}>批量通过</button>
          <button className={`${styles.batchBtn} ${styles.batchBtnReject}`} onClick={() => { setRejectModal({ id: '__batch__', type: '__batch__' }); }}>批量驳回</button>
        </div>
      )}

      {loading ? (
        <div className={styles.empty}>加载中...</div>
      ) : items.length === 0 ? (
        <div className={styles.empty}>
          <p>暂无{statusLabels[statusTab]}内容</p>
        </div>
      ) : (
        <div className={styles.reviewGrid}>
          {items.map((item) => (
            <div
              key={`${item.type}-${item.id}`}
              className={`${styles.reviewCard} ${selected.has(item.id) ? styles.reviewCardSelected : ''}`}
            >
              <div className={styles.reviewCardHeader}>
                <span className={`${styles.reviewCardType} ${item.type === 'course' ? styles.typeCourse : item.type === 'artwork' ? styles.typeArtwork : styles.typePost}`}>
                  {typeLabels[item.type]}
                </span>
                {statusTab === 'REVIEWING' && (
                  <input type="checkbox" className={styles.checkbox} checked={selected.has(item.id)} onChange={() => toggleSelect(item.id)} />
                )}
              </div>
              <h3 className={styles.reviewCardTitle}>{item.title}</h3>
              <div className={styles.reviewCardMeta}>
                <div className={styles.reviewCardAuthor}>
                  <div className={styles.authorAvatar}>{item.author.nickname.charAt(0)}</div>
                  <span className={styles.authorName}>{item.author.nickname}</span>
                </div>
                <span className={styles.reviewCardDate}>{new Date(item.updatedAt).toLocaleDateString('zh-CN')}</span>
              </div>
              {item.content && <p className={styles.reviewCardPreview}>{item.content}</p>}
              {statusTab === 'REVIEWING' && (
                <div className={styles.reviewCardActions}>
                  <button className={styles.approveBtn} onClick={() => handleApprove(item.type, item.id)}>通过</button>
                  <button className={styles.rejectBtn} onClick={() => { setRejectModal({ id: item.id, type: item.type }); setRejectReason(''); }}>驳回</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {data && totalPages > 1 && (
        <div className={styles.pagination}>
          <span className={styles.paginationInfo}>第 {page} / {totalPages} 页，共 {total} 条</span>
          <div className={styles.paginationBtns}>
            <button className={styles.paginationBtn} disabled={page <= 1} onClick={() => setPage(page - 1)}>上一页</button>
            <button className={styles.paginationBtn} disabled={page >= totalPages} onClick={() => setPage(page + 1)}>下一页</button>
          </div>
        </div>
      )}

      {rejectModal && (
        <div className={styles.modalOverlay} onClick={() => setRejectModal(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>驳回原因</h3>
            <textarea className={styles.textareaInput} placeholder="请填写驳回原因..." value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} />
            <div className={styles.modalActions}>
              <button className={styles.modalBtn} onClick={() => setRejectModal(null)}>取消</button>
              <button className={`${styles.modalBtn} ${styles.modalBtnPrimary}`} onClick={rejectModal.id === '__batch__' ? handleBatchReject : handleReject} disabled={!rejectReason.trim()}>确认驳回</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

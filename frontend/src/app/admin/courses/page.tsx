'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { getAdminCourses, createAdminCourse, updateAdminCourseStatus, deleteAdminCourse, uploadImage, type AdminCourse, type PaginatedResult } from '@/lib/admin-api';
import styles from '../products/page.module.css';

const statusLabels: Record<string, string> = {
  DRAFT: '草稿', REVIEWING: '审核中', PUBLISHED: '已发布', ARCHIVED: '已归档',
};
const levelLabels: Record<string, string> = {
  BEGINNER: '入门', INTERMEDIATE: '进阶', ADVANCED: '高级', MASTER: '大师',
};

interface CourseForm {
  title: string; subtitle: string; description: string; level: string;
  category: string; price: string; originalPrice: string; isFree: boolean;
  coverImage: string; tags: string;
}
const emptyForm: CourseForm = {
  title: '', subtitle: '', description: '', level: 'BEGINNER',
  category: '', price: '0', originalPrice: '', isFree: false,
  coverImage: '', tags: '',
};

export default function AdminCoursesPage() {
  const [data, setData] = useState<PaginatedResult<AdminCourse> | null>(null);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [confirmModal, setConfirmModal] = useState<{ courseId: string; action: string; label: string } | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [form, setForm] = useState<CourseForm>({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, string | number | undefined> = { page, pageSize: 20 };
      if (keyword) params.keyword = keyword;
      if (statusFilter) params.status = statusFilter;
      setData(await getAdminCourses(params));
    } catch { /* */ } finally { setLoading(false); }
  }, [page, keyword, statusFilter]);

  useEffect(() => {
    queueMicrotask(() => void fetchData());
  }, [fetchData]);

  const handleStatusChange = async (courseId: string, status: string) => {
    try { await updateAdminCourseStatus(courseId, status); setConfirmModal(null); fetchData(); } catch { /* */ }
  };

  const handleDelete = async (courseId: string) => {
    try { await deleteAdminCourse(courseId); fetchData(); } catch { /* */ }
  };

  const handleCreate = async () => {
    if (!form.title) return;
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        title: form.title,
        level: form.level,
        isFree: form.isFree,
      };
      if (form.subtitle) payload.subtitle = form.subtitle;
      if (form.description) payload.description = form.description;
      if (form.category) payload.category = form.category;
      if (form.coverImage) payload.coverImage = form.coverImage;
      if (!form.isFree && form.price) payload.price = Number(form.price);
      if (form.originalPrice) payload.originalPrice = Number(form.originalPrice);
      if (form.tags) payload.tags = form.tags.split(/[,，]/).map((t) => t.trim()).filter(Boolean);
      await createAdminCourse(payload);
      setShowCreateModal(false);
      setForm({ ...emptyForm });
      fetchData();
    } catch { /* */ } finally { setSaving(false); }
  };

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    try {
      const result = await uploadImage(file, 'course');
      setForm((prev) => ({ ...prev, coverImage: result.url }));
    } catch { /* */ } finally { setUploading(false); }
  };

  const courses = data?.items ?? [];
  const total = data?.pagination.total ?? 0;
  const totalPages = data?.pagination.totalPages ?? 1;

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderLeft}>
          <h1 className={styles.pageTitle}>课程管理</h1>
          <span className={styles.countBadge}>{total} 门</span>
        </div>
        <button className={styles.primaryBtn} onClick={() => { setForm({ ...emptyForm }); setShowCreateModal(true); }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          新增课程
        </button>
      </div>

      <div className={styles.filters}>
        <input className={styles.searchInput} placeholder="搜索课程名称..." value={keyword} onChange={(e) => { setKeyword(e.target.value); setPage(1); }} />
        <select className={styles.select} value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="">全部状态</option>
          {Object.entries(statusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      <div className={styles.tableCard}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>课程</th>
              <th>讲师</th>
              <th>级别</th>
              <th>价格</th>
              <th>状态</th>
              <th>报名</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className={styles.emptyCell}>加载中...</td></tr>
            ) : courses.length === 0 ? (
              <tr><td colSpan={7} className={styles.emptyCell}>暂无课程</td></tr>
            ) : courses.map((c) => (
              <tr key={c.id}>
                <td>
                  <div className={styles.nameCell}>
                    <span className={styles.nameText}>{c.title}</span>
                    {c.subtitle && <span className={styles.mutedCell}>{c.subtitle}</span>}
                  </div>
                </td>
                <td className={styles.mutedCell}>{c.teacherName}</td>
                <td><span className={styles.statusTag}>{levelLabels[c.level] ?? c.level}</span></td>
                <td><span className={styles.price}>{c.isFree ? '免费' : `¥${c.price}`}</span></td>
                <td>
                  <span className={`${styles.statusTag} ${c.status === 'PUBLISHED' ? styles.statusActive : c.status === 'DRAFT' ? styles.statusDraft : styles.statusInactive}`}>
                    {statusLabels[c.status] ?? c.status}
                  </span>
                </td>
                <td className={styles.mutedCell}>{c.enrollCount}</td>
                <td>
                  <div className={styles.actions}>
                    {c.status === 'DRAFT' && (
                      <button className={`${styles.iconBtn} ${styles.iconBtnSuccess}`} title="发布" onClick={() => setConfirmModal({ courseId: c.id, action: 'PUBLISHED', label: `发布课程「${c.title}」？` })}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/></svg>
                      </button>
                    )}
                    {c.status === 'PUBLISHED' && (
                      <button className={`${styles.iconBtn} ${styles.iconBtnWarn}`} title="归档" onClick={() => setConfirmModal({ courseId: c.id, action: 'ARCHIVED', label: `归档课程「${c.title}」？` })}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg>
                      </button>
                    )}
                    {c.status === 'REVIEWING' && (
                      <>
                        <button className={`${styles.iconBtn} ${styles.iconBtnSuccess}`} title="通过" onClick={() => setConfirmModal({ courseId: c.id, action: 'PUBLISHED', label: `通过审核「${c.title}」？` })}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        </button>
                        <button className={`${styles.iconBtn} ${styles.iconBtnWarn}`} title="退回" onClick={() => setConfirmModal({ courseId: c.id, action: 'DRAFT', label: `退回课程「${c.title}」？` })}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
                        </button>
                      </>
                    )}
                    <button className={`${styles.iconBtn} ${styles.iconBtnDanger}`} title="删除" onClick={() => { if (confirm(`确认删除课程「${c.title}」？`)) handleDelete(c.id); }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
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

      {/* 状态确认弹窗 */}
      {confirmModal && (
        <div className={styles.modalOverlay} onClick={() => setConfirmModal(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>确认操作</h3>
            <p className={styles.modalDesc}>{confirmModal.label}</p>
            <div className={styles.modalActions}>
              <button className={styles.cancelBtn} onClick={() => setConfirmModal(null)}>取消</button>
              <button className={styles.primaryBtn} onClick={() => handleStatusChange(confirmModal.courseId, confirmModal.action)}>确认</button>
            </div>
          </div>
        </div>
      )}

      {/* 新增课程弹窗 */}
      {showCreateModal && (
        <div className={styles.modalOverlay} onClick={() => setShowCreateModal(false)}>
          <div className={`${styles.modal} ${styles.modalWide}`} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>新增课程</h3>
            <div className={styles.formGrid}>
              <div className={styles.formField}>
                <label className={styles.formLabel}>课程名称 *</label>
                <input className={styles.formInput} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="皮雕入门基础课" />
              </div>
              <div className={styles.formField}>
                <label className={styles.formLabel}>副标题</label>
                <input className={styles.formInput} value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} placeholder="从零开始学皮雕" />
              </div>
              <div className={styles.formField}>
                <label className={styles.formLabel}>级别</label>
                <select className={styles.formInput} value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })}>
                  {Object.entries(levelLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div className={styles.formField}>
                <label className={styles.formLabel}>分类</label>
                <input className={styles.formInput} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="皮雕技法" />
              </div>
              <div className={styles.formField}>
                <label className={styles.formLabel}>价格</label>
                <input className={styles.formInput} type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} disabled={form.isFree} />
              </div>
              <div className={styles.formField}>
                <label className={styles.formLabel}>原价</label>
                <input className={styles.formInput} type="number" step="0.01" value={form.originalPrice} onChange={(e) => setForm({ ...form, originalPrice: e.target.value })} />
              </div>
              <div className={`${styles.formField} ${styles.formFieldFull}`}>
                <label className={styles.formLabel}>封面图</label>
                <div style={{ display: 'flex', gap: 'var(--lc-space-3)', alignItems: 'center' }}>
                  <input className={styles.formInput} style={{ flex: 1 }} value={form.coverImage} onChange={(e) => setForm({ ...form, coverImage: e.target.value })} placeholder="图片 URL 或上传" />
                  <label className={styles.cancelBtn} style={{ cursor: 'pointer', whiteSpace: 'nowrap' }}>
                    {uploading ? '上传中...' : '上传图片'}
                    <input type="file" accept="image/*" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload(f); }} />
                  </label>
                </div>
                {form.coverImage && <Image src={form.coverImage} alt="封面预览" width={120} height={80} style={{ marginTop: 8, maxHeight: 80, borderRadius: 'var(--lc-radius-md)', objectFit: 'cover' }} unoptimized />}
              </div>
              <div className={`${styles.formField} ${styles.formFieldFull}`}>
                <label className={styles.formLabel}>课程描述</label>
                <textarea className={styles.formTextarea} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} placeholder="课程详细介绍..." />
              </div>
              <div className={styles.formField}>
                <label className={styles.formLabel}>标签（逗号分隔）</label>
                <input className={styles.formInput} value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="入门, 皮雕, 手工" />
              </div>
              <div className={styles.formField}>
                <label className={styles.formCheckLabel}>
                  <input type="checkbox" checked={form.isFree} onChange={(e) => setForm({ ...form, isFree: e.target.checked })} />
                  免费课程
                </label>
              </div>
            </div>
            <div className={styles.modalActions}>
              <button className={styles.cancelBtn} onClick={() => setShowCreateModal(false)}>取消</button>
              <button className={styles.primaryBtn} onClick={handleCreate} disabled={saving}>{saving ? '创建中...' : '创建课程'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

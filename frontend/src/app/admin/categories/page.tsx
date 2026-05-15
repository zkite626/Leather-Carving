'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { getCategories, createCategory, updateCategory, deleteCategory, type CategoryItem } from '@/lib/admin-api';
import styles from '../products/page.module.css';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', slug: '', icon: '', parentId: '', sortOrder: '0' });
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setCategories(await getCategories());
    } catch { /* */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { void fetchData(); }, [fetchData]);

  const openCreate = (parentId?: string) => {
    setEditingId(null);
    setForm({ name: '', slug: '', icon: '', parentId: parentId ?? '', sortOrder: '0' });
    setShowModal(true);
  };

  const openEdit = (c: CategoryItem) => {
    setEditingId(c.id);
    setForm({
      name: c.name, slug: c.slug, icon: c.icon ?? '',
      parentId: c.parentId ?? '', sortOrder: String(c.sortOrder ?? 0),
    });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!form.name || !form.slug) return;
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        name: form.name, slug: form.slug, sortOrder: Number(form.sortOrder) || 0,
      };
      if (form.icon) payload.icon = form.icon;
      if (form.parentId) payload.parentId = form.parentId;
      if (editingId) {
        await updateCategory(editingId, payload);
      } else {
        await createCategory(payload as never);
      }
      setShowModal(false);
      setEditingId(null);
      fetchData();
    } catch { /* */ } finally { setSaving(false); }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`确认删除分类「${name}」？有子分类或商品的分类无法删除。`)) return;
    try { await deleteCategory(id); fetchData(); } catch { /* */ }
  };

  // 递归渲染分类树
  const renderCategory = (cat: CategoryItem, depth = 0) => (
    <React.Fragment key={cat.id}>
      <tr>
        <td>
          <div style={{ paddingLeft: depth * 24, display: 'flex', alignItems: 'center', gap: 8 }}>
            {depth > 0 && <span style={{ color: 'var(--lc-text-muted)', fontSize: 12 }}>└</span>}
            {cat.icon && <span>{cat.icon}</span>}
            <span className={styles.nameText}>{cat.name}</span>
          </div>
        </td>
        <td className={styles.mutedCell}>{cat.slug}</td>
        <td className={styles.mutedCell}>{cat._count?.products ?? 0}</td>
        <td className={styles.mutedCell}>{cat.sortOrder}</td>
        <td>
          <div className={styles.actions}>
            <button className={`${styles.iconBtn} ${styles.iconBtnPrimary}`} title="添加子分类" onClick={() => openCreate(cat.id)}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </button>
            <button className={`${styles.iconBtn} ${styles.iconBtnPrimary}`} title="编辑" onClick={() => openEdit(cat)}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
            <button className={`${styles.iconBtn} ${styles.iconBtnDanger}`} title="删除" onClick={() => handleDelete(cat.id, cat.name)}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
          </div>
        </td>
      </tr>
      {cat.children?.map((child) => renderCategory(child, depth + 1))}
    </React.Fragment>
  );

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderLeft}>
          <h1 className={styles.pageTitle}>商品分类</h1>
          <span className={styles.countBadge}>{categories.length} 个</span>
        </div>
        <button className={styles.primaryBtn} onClick={() => openCreate()}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          新增分类
        </button>
      </div>

      <div className={styles.tableCard}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>分类名称</th>
              <th>Slug</th>
              <th>商品数</th>
              <th>排序</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className={styles.emptyCell}>加载中...</td></tr>
            ) : categories.length === 0 ? (
              <tr><td colSpan={5} className={styles.emptyCell}>暂无分类</td></tr>
            ) : categories.map((c) => renderCategory(c))}
          </tbody>
        </table>
      </div>

      {/* 创建/编辑弹窗 */}
      {showModal && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>{editingId ? '编辑分类' : '新增分类'}</h3>
            <div className={styles.formGrid}>
              <div className={styles.formField}>
                <label className={styles.formLabel}>分类名称 *</label>
                <input className={styles.formInput} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="钱包" />
              </div>
              <div className={styles.formField}>
                <label className={styles.formLabel}>Slug *</label>
                <input className={styles.formInput} value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="wallet" />
              </div>
              <div className={styles.formField}>
                <label className={styles.formLabel}>图标（emoji 或文字）</label>
                <input className={styles.formInput} value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} placeholder="👛" />
              </div>
              <div className={styles.formField}>
                <label className={styles.formLabel}>排序</label>
                <input className={styles.formInput} type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} />
              </div>
              {form.parentId && (
                <div className={`${styles.formField} ${styles.formFieldFull}`}>
                  <label className={styles.formLabel}>父分类 ID</label>
                  <input className={styles.formInput} value={form.parentId} disabled style={{ opacity: 0.6 }} />
                </div>
              )}
            </div>
            <div className={styles.modalActions}>
              <button className={styles.cancelBtn} onClick={() => setShowModal(false)}>取消</button>
              <button className={styles.primaryBtn} onClick={handleSubmit} disabled={saving}>{saving ? '保存中...' : (editingId ? '保存' : '创建')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

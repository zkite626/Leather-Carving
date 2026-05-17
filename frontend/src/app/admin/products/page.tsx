'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import {
  getAdminProducts, createAdminProduct, updateAdminProduct, uploadImage,
  updateAdminProductStatus, deleteAdminProduct, getProductCategories,
  type AdminProduct, type ProductCategory, type PaginatedResult,
} from '@/lib/admin-api';
import styles from './page.module.css';

const statusLabels: Record<string, string> = {
  DRAFT: '草稿', ACTIVE: '上架', INACTIVE: '下架', SOLD_OUT: '售罄',
};

interface ProductForm {
  name: string; categoryId: string; price: string; originalPrice: string;
  description: string; stock: string; isGuangxi: boolean; tags: string; coverImage: string;
}

const emptyForm: ProductForm = {
  name: '', categoryId: '', price: '', originalPrice: '',
  description: '', stock: '0', isGuangxi: false, tags: '', coverImage: '',
};

export default function AdminProductsPage() {
  const [data, setData] = useState<PaginatedResult<AdminProduct> | null>(null);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [confirmModal, setConfirmModal] = useState<{ productId: string; action: string; label: string } | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>({ ...emptyForm });
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, string | number | undefined> = { page, pageSize: 20 };
      if (keyword) params.keyword = keyword;
      if (statusFilter) params.status = statusFilter;
      setData(await getAdminProducts(params));
    } catch { /* */ } finally { setLoading(false); }
  }, [page, keyword, statusFilter]);

  useEffect(() => {
    queueMicrotask(() => void fetchData());
  }, [fetchData]);
  useEffect(() => { getProductCategories().then(setCategories).catch(() => {}); }, []);

  const handleStatusChange = async (productId: string, status: string) => {
    try { await updateAdminProductStatus(productId, status); setConfirmModal(null); fetchData(); } catch { /* */ }
  };

  const handleDelete = async (name: string, productId: string) => {
    if (!confirm(`确认删除商品「${name}」？`)) return;
    try { await deleteAdminProduct(productId); fetchData(); } catch { /* */ }
  };

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyForm });
    setShowFormModal(true);
  };

  const openEdit = (p: AdminProduct) => {
    setEditingId(p.id);
    setForm({
      name: p.name,
      categoryId: p.category.id,
      price: p.price,
      originalPrice: p.originalPrice ?? '',
      description: '',
      stock: String(p.stock),
      isGuangxi: p.isGuangxi,
      tags: '',
      coverImage: p.coverImage ?? '',
    });
    setShowFormModal(true);
  };

  const handleSubmit = async () => {
    if (!form.name || !form.categoryId || !form.price) return;
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        name: form.name,
        categoryId: form.categoryId,
        price: Number(form.price),
        stock: Number(form.stock) || 0,
        isGuangxi: form.isGuangxi,
      };
      if (form.originalPrice) payload.originalPrice = Number(form.originalPrice);
      if (form.description) payload.description = form.description;
      if (form.tags) payload.tags = form.tags.split(/[,，]/).map((t) => t.trim()).filter(Boolean);
      if (form.coverImage) payload.coverImage = form.coverImage;

      if (editingId) {
        await updateAdminProduct(editingId, payload);
      } else {
        await createAdminProduct(payload);
      }
      setShowFormModal(false);
      setEditingId(null);
      fetchData();
    } catch { /* */ } finally { setSaving(false); }
  };

  const products = data?.items ?? [];
  const total = data?.pagination.total ?? 0;
  const totalPages = data?.pagination.totalPages ?? 1;

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderLeft}>
          <h1 className={styles.pageTitle}>商品管理</h1>
          <span className={styles.countBadge}>{total} 件</span>
        </div>
        <button className={styles.primaryBtn} onClick={openCreate}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          新增商品
        </button>
      </div>

      <div className={styles.filters}>
        <input className={styles.searchInput} placeholder="搜索商品名称..." value={keyword} onChange={(e) => { setKeyword(e.target.value); setPage(1); }} />
        <select className={styles.select} value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="">全部状态</option>
          {Object.entries(statusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      <div className={styles.tableCard}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>商品</th>
              <th>商家</th>
              <th>分类</th>
              <th>价格</th>
              <th>库存</th>
              <th>销量</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className={styles.emptyCell}>加载中...</td></tr>
            ) : products.length === 0 ? (
              <tr><td colSpan={8} className={styles.emptyCell}>暂无商品</td></tr>
            ) : products.map((p) => (
              <tr key={p.id}>
                <td>
                  <div className={styles.nameCell}>
                    <span className={styles.nameText}>{p.name}</span>
                    {p.isGuangxi && <span className={styles.guangxiTag}>广西非遗</span>}
                  </div>
                </td>
                <td className={styles.mutedCell}>{p.merchant.nickname}</td>
                <td className={styles.mutedCell}>{p.category.name}</td>
                <td>
                  <span className={styles.price}>¥{p.price}</span>
                  {p.originalPrice && <span className={styles.originalPrice}>¥{p.originalPrice}</span>}
                </td>
                <td className={p.stock <= 10 ? styles.stockLow : styles.mutedCell}>{p.stock}</td>
                <td className={styles.mutedCell}>{p.sales}</td>
                <td>
                  <span className={`${styles.statusTag} ${p.status === 'ACTIVE' ? styles.statusActive : p.status === 'INACTIVE' ? styles.statusInactive : styles.statusDraft}`}>
                    {statusLabels[p.status] ?? p.status}
                  </span>
                </td>
                <td>
                  <div className={styles.actions}>
                    <button className={styles.iconBtn} title="编辑" onClick={() => openEdit(p)}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    {p.status !== 'ACTIVE' ? (
                      <button className={`${styles.iconBtn} ${styles.iconBtnSuccess}`} title="上架" onClick={() => setConfirmModal({ productId: p.id, action: 'ACTIVE', label: `上架「${p.name}」？` })}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/></svg>
                      </button>
                    ) : (
                      <button className={`${styles.iconBtn} ${styles.iconBtnWarn}`} title="下架" onClick={() => setConfirmModal({ productId: p.id, action: 'INACTIVE', label: `下架「${p.name}」？` })}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
                      </button>
                    )}
                    <button className={`${styles.iconBtn} ${styles.iconBtnDanger}`} title="删除" onClick={() => handleDelete(p.name, p.id)}>
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
              <button className={styles.primaryBtn} onClick={() => handleStatusChange(confirmModal.productId, confirmModal.action)}>确认</button>
            </div>
          </div>
        </div>
      )}

      {/* 创建/编辑弹窗 */}
      {showFormModal && (
        <div className={styles.modalOverlay} onClick={() => setShowFormModal(false)}>
          <div className={`${styles.modal} ${styles.modalWide}`} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>{editingId ? '编辑商品' : '新增商品'}</h3>
            <div className={styles.formGrid}>
              <div className={styles.formField}>
                <label className={styles.formLabel}>商品名称 *</label>
                <input className={styles.formInput} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="壮锦纹样真皮手提包" />
              </div>
              <div className={styles.formField}>
                <label className={styles.formLabel}>分类 *</label>
                <select className={styles.formInput} value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
                  <option value="">请选择分类</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className={styles.formField}>
                <label className={styles.formLabel}>售价 *</label>
                <input className={styles.formInput} type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="299.00" />
              </div>
              <div className={styles.formField}>
                <label className={styles.formLabel}>原价</label>
                <input className={styles.formInput} type="number" step="0.01" value={form.originalPrice} onChange={(e) => setForm({ ...form, originalPrice: e.target.value })} placeholder="可选" />
              </div>
              <div className={styles.formField}>
                <label className={styles.formLabel}>库存</label>
                <input className={styles.formInput} type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
              </div>
              <div className={`${styles.formField} ${styles.formFieldFull}`}>
                <label className={styles.formLabel}>封面图</label>
                <div style={{ display: 'flex', gap: 'var(--lc-space-3)', alignItems: 'center' }}>
                  <input className={styles.formInput} style={{ flex: 1 }} value={form.coverImage} onChange={(e) => setForm({ ...form, coverImage: e.target.value })} placeholder="图片 URL 或上传" />
                  <label className={styles.cancelBtn} style={{ cursor: 'pointer', whiteSpace: 'nowrap' }}>
                    {uploading ? '上传中...' : '上传图片'}
                    <input type="file" accept="image/*" hidden onChange={async (e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      setUploading(true);
                      try { const r = await uploadImage(f, 'product'); setForm((prev) => ({ ...prev, coverImage: r.url })); } catch { /* */ } finally { setUploading(false); }
                    }} />
                  </label>
                </div>
                {form.coverImage && <Image src={form.coverImage} alt="封面预览" width={120} height={80} style={{ marginTop: 8, maxHeight: 80, borderRadius: 'var(--lc-radius-md)', objectFit: 'cover' }} unoptimized />}
              </div>
              <div className={`${styles.formField} ${styles.formFieldFull}`}>
                <label className={styles.formLabel}>商品描述</label>
                <textarea className={styles.formTextarea} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} placeholder="商品详细描述..." />
              </div>
              <div className={styles.formField}>
                <label className={styles.formLabel}>标签（逗号分隔）</label>
                <input className={styles.formInput} value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="壮锦, 手工皮雕, 广西特产" />
              </div>
              <div className={styles.formField}>
                <label className={styles.formCheckLabel}>
                  <input type="checkbox" checked={form.isGuangxi} onChange={(e) => setForm({ ...form, isGuangxi: e.target.checked })} />
                  广西非遗商品
                </label>
              </div>
            </div>
            <div className={styles.modalActions}>
              <button className={styles.cancelBtn} onClick={() => setShowFormModal(false)}>取消</button>
              <button className={styles.primaryBtn} onClick={handleSubmit} disabled={saving}>{saving ? '保存中...' : (editingId ? '保存' : '创建')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

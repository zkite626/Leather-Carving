'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { Edit3, Plus, Trash2, Upload } from 'lucide-react';
import {
  createAdminPattern,
  deleteAdminPattern,
  getAdminPatterns,
  updateAdminPattern,
  type PaginatedResult,
} from '@/lib/admin-api';
import type { IPatternAsset } from '@/lib/pattern-api';
import { uploadImage } from '@/lib/upload-api';
import styles from '../products/page.module.css';

interface PatternForm {
  name: string;
  category: string;
  imageUrl: string;
  thumbnailUrl: string;
  description: string;
  origin: string;
  tags: string;
}

const emptyForm: PatternForm = {
  name: '',
  category: '',
  imageUrl: '',
  thumbnailUrl: '',
  description: '',
  origin: '',
  tags: '',
};

function splitTags(value: string) {
  return value.split(/[,，]/).map((tag) => tag.trim()).filter(Boolean);
}

export default function AdminPatternsPage() {
  const [data, setData] = useState<PaginatedResult<IPatternAsset> | null>(null);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<PatternForm>({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number | undefined> = { page, pageSize: 20 };
      if (keyword) params.keyword = keyword;
      if (category) params.category = category;
      setData(await getAdminPatterns(params));
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [category, keyword, page]);

  useEffect(() => {
    queueMicrotask(() => void fetchData());
  }, [fetchData]);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyForm });
    setShowModal(true);
  };

  const openEdit = (pattern: IPatternAsset) => {
    setEditingId(pattern.id);
    setForm({
      name: pattern.name,
      category: pattern.category ?? '',
      imageUrl: pattern.imageUrl,
      thumbnailUrl: pattern.thumbnailUrl ?? '',
      description: pattern.description ?? '',
      origin: pattern.origin ?? '',
      tags: pattern.tags.join(', '),
    });
    setShowModal(true);
  };

  const handleUpload = async (file: File, target: 'imageUrl' | 'thumbnailUrl') => {
    setUploading(true);
    try {
      const result = await uploadImage(file, 'pattern');
      setForm((prev) => ({ ...prev, [target]: result.url }));
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.imageUrl.trim()) return;
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        category: form.category.trim() || undefined,
        imageUrl: form.imageUrl.trim(),
        thumbnailUrl: form.thumbnailUrl.trim() || undefined,
        description: form.description.trim() || undefined,
        origin: form.origin.trim() || undefined,
        tags: splitTags(form.tags),
      };

      if (editingId) {
        await updateAdminPattern(editingId, payload);
      } else {
        await createAdminPattern(payload);
      }
      setShowModal(false);
      await fetchData();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (pattern: IPatternAsset) => {
    if (!confirm(`确认删除纹样「${pattern.name}」？`)) return;
    await deleteAdminPattern(pattern.id);
    await fetchData();
  };

  const patterns = data?.items ?? [];
  const total = data?.pagination.total ?? 0;
  const totalPages = data?.pagination.totalPages ?? 1;

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderLeft}>
          <h1 className={styles.pageTitle}>纹样素材库</h1>
          <span className={styles.countBadge}>{total} 个</span>
        </div>
        <button className={styles.primaryBtn} onClick={openCreate}>
          <Plus size={16} />
          新增纹样
        </button>
      </div>

      <div className={styles.filters}>
        <input className={styles.searchInput} placeholder="搜索纹样名称..." value={keyword} onChange={(event) => { setKeyword(event.target.value); setPage(1); }} />
        <select className={styles.select} value={category} onChange={(event) => { setCategory(event.target.value); setPage(1); }}>
          <option value="">全部分类</option>
          <option value="壮锦">壮锦</option>
          <option value="瑶族">瑶族</option>

          <option value="现代">现代</option>
        </select>
      </div>

      <div className={styles.tableCard}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>纹样</th>
              <th>分类</th>
              <th>来源</th>
              <th>标签</th>
              <th>下载</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className={styles.emptyCell}>加载中...</td></tr>
            ) : patterns.length === 0 ? (
              <tr><td colSpan={6} className={styles.emptyCell}>暂无纹样素材</td></tr>
            ) : patterns.map((pattern) => (
              <tr key={pattern.id}>
                <td>
                  <div className={styles.mediaCell}>
                    <div className={styles.mediaThumb}>
                      <Image src={pattern.thumbnailUrl || pattern.imageUrl} alt={pattern.name} fill unoptimized />
                    </div>
                    <div className={styles.nameCell}>
                      <span className={styles.nameText}>{pattern.name}</span>
                      {pattern.description && <span className={styles.mutedCell}>{pattern.description}</span>}
                    </div>
                  </div>
                </td>
                <td><span className={styles.statusTag}>{pattern.category || '未分类'}</span></td>
                <td className={styles.mutedCell}>{pattern.origin || '未填写'}</td>
                <td className={styles.mutedCell}>{pattern.tags.slice(0, 3).join('、') || '无'}</td>
                <td className={styles.mutedCell}>{pattern.downloadCount}</td>
                <td>
                  <div className={styles.actions}>
                    <button className={styles.iconBtn} title="编辑" onClick={() => openEdit(pattern)}>
                      <Edit3 size={15} />
                    </button>
                    <button className={`${styles.iconBtn} ${styles.iconBtnDanger}`} title="删除" onClick={() => void handleDelete(pattern)}>
                      <Trash2 size={15} />
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

      {showModal && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={`${styles.modal} ${styles.modalWide}`} onClick={(event) => event.stopPropagation()}>
            <h3 className={styles.modalTitle}>{editingId ? '编辑纹样' : '新增纹样'}</h3>
            <div className={styles.formGrid}>
              <label className={styles.formField}>
                <span className={styles.formLabel}>名称 *</span>
                <input className={styles.formInput} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
              </label>
              <label className={styles.formField}>
                <span className={styles.formLabel}>分类</span>
                <input className={styles.formInput} value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} placeholder="壮锦" />
              </label>
              <div className={`${styles.formField} ${styles.formFieldFull}`}>
                <span className={styles.formLabel}>原图 *</span>
                <div className={styles.uploadLine}>
                  <input className={styles.formInput} value={form.imageUrl} onChange={(event) => setForm({ ...form, imageUrl: event.target.value })} placeholder="图片 URL 或上传" />
                  <label className={styles.cancelBtn}>
                    <Upload size={15} />
                    {uploading ? '上传中...' : '上传'}
                    <input type="file" accept="image/*" hidden onChange={(event) => { const file = event.target.files?.[0]; if (file) void handleUpload(file, 'imageUrl'); }} />
                  </label>
                </div>
              </div>
              <div className={`${styles.formField} ${styles.formFieldFull}`}>
                <span className={styles.formLabel}>缩略图</span>
                <div className={styles.uploadLine}>
                  <input className={styles.formInput} value={form.thumbnailUrl} onChange={(event) => setForm({ ...form, thumbnailUrl: event.target.value })} placeholder="可选，默认使用原图" />
                  <label className={styles.cancelBtn}>
                    <Upload size={15} />
                    {uploading ? '上传中...' : '上传'}
                    <input type="file" accept="image/*" hidden onChange={(event) => { const file = event.target.files?.[0]; if (file) void handleUpload(file, 'thumbnailUrl'); }} />
                  </label>
                </div>
              </div>
              <label className={styles.formField}>
                <span className={styles.formLabel}>来源</span>
                <input className={styles.formInput} value={form.origin} onChange={(event) => setForm({ ...form, origin: event.target.value })} />
              </label>
              <label className={styles.formField}>
                <span className={styles.formLabel}>标签</span>
                <input className={styles.formInput} value={form.tags} onChange={(event) => setForm({ ...form, tags: event.target.value })} placeholder="逗号分隔" />
              </label>
              <label className={`${styles.formField} ${styles.formFieldFull}`}>
                <span className={styles.formLabel}>描述</span>
                <textarea className={styles.formTextarea} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} rows={3} />
              </label>
              {(form.thumbnailUrl || form.imageUrl) && (
                <div className={`${styles.formField} ${styles.formFieldFull}`}>
                  <span className={styles.formLabel}>预览</span>
                  <div className={styles.previewImage}>
                    <Image src={form.thumbnailUrl || form.imageUrl} alt="纹样预览" fill unoptimized />
                  </div>
                </div>
              )}
            </div>
            <div className={styles.modalActions}>
              <button className={styles.cancelBtn} onClick={() => setShowModal(false)}>取消</button>
              <button className={styles.primaryBtn} onClick={() => void handleSave()} disabled={saving || uploading}>{saving ? '保存中...' : '保存'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

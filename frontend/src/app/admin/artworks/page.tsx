'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { Edit3, Plus, Send, Trash2, Upload } from 'lucide-react';
import {
  createAdminArtwork,
  deleteAdminArtwork,
  getAdminArtworks,
  updateAdminArtwork,
  updateAdminArtworkStatus,
  type AdminArtwork,
  type PaginatedResult,
} from '@/lib/admin-api';
import { uploadImage } from '@/lib/upload-api';
import styles from '../products/page.module.css';

const statusLabels: Record<string, string> = {
  DRAFT: '草稿',
  REVIEWING: '待审核',
  PUBLISHED: '已发布',
  REJECTED: '已驳回',
};

interface ArtworkForm {
  title: string;
  category: string;
  description: string;
  techniques: string;
  materials: string;
  tags: string;
  story: string;
  status: string;
  imageUrls: string[];
}

const emptyForm: ArtworkForm = {
  title: '',
  category: '',
  description: '',
  techniques: '',
  materials: '',
  tags: '',
  story: '',
  status: 'PUBLISHED',
  imageUrls: [],
};

function splitList(value: string) {
  return value.split(/[,，]/).map((item) => item.trim()).filter(Boolean);
}

export default function AdminArtworksPage() {
  const [data, setData] = useState<PaginatedResult<AdminArtwork> | null>(null);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ArtworkForm>({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number | undefined> = { page, pageSize: 20 };
      if (keyword) params.keyword = keyword;
      if (status) params.status = status;
      setData(await getAdminArtworks(params));
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [keyword, page, status]);

  useEffect(() => {
    queueMicrotask(() => void fetchData());
  }, [fetchData]);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyForm, imageUrls: [] });
    setShowModal(true);
  };

  const openEdit = (artwork: AdminArtwork) => {
    setEditingId(artwork.id);
    setForm({
      title: artwork.title,
      category: artwork.category ?? '',
      description: artwork.description ?? '',
      techniques: artwork.techniques.join(', '),
      materials: artwork.materials.join(', '),
      tags: artwork.tags.join(', '),
      story: artwork.story ?? '',
      status: artwork.status,
      imageUrls: artwork.images.length > 0
        ? artwork.images.map((image) => image.url)
        : artwork.coverImage ? [artwork.coverImage] : [],
    });
    setShowModal(true);
  };

  const handleUpload = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    try {
      const nextUrls: string[] = [];
      for (const file of Array.from(files).slice(0, 9 - form.imageUrls.length)) {
        const result = await uploadImage(file, 'artwork');
        nextUrls.push(result.url);
      }
      setForm((prev) => ({ ...prev, imageUrls: [...prev.imageUrls, ...nextUrls] }));
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (url: string) => {
    setForm((prev) => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((item) => item !== url),
    }));
  };

  const handleSave = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        category: form.category.trim() || undefined,
        description: form.description.trim() || undefined,
        techniques: splitList(form.techniques),
        materials: splitList(form.materials),
        tags: splitList(form.tags),
        story: form.story.trim() || undefined,
        status: form.status,
        imageUrls: form.imageUrls,
      };

      if (editingId) {
        await updateAdminArtwork(editingId, payload);
      } else {
        await createAdminArtwork(payload);
      }
      setShowModal(false);
      await fetchData();
    } finally {
      setSaving(false);
    }
  };

  const handleStatus = async (artwork: AdminArtwork, nextStatus: string) => {
    await updateAdminArtworkStatus(artwork.id, nextStatus);
    await fetchData();
  };

  const handleDelete = async (artwork: AdminArtwork) => {
    if (!confirm(`确认删除作品「${artwork.title}」？`)) return;
    await deleteAdminArtwork(artwork.id);
    await fetchData();
  };

  const artworks = data?.items ?? [];
  const total = data?.pagination.total ?? 0;
  const totalPages = data?.pagination.totalPages ?? 1;

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderLeft}>
          <h1 className={styles.pageTitle}>作品画廊</h1>
          <span className={styles.countBadge}>{total} 件</span>
        </div>
        <button className={styles.primaryBtn} onClick={openCreate}>
          <Plus size={16} />
          上传作品
        </button>
      </div>

      <div className={styles.filters}>
        <input className={styles.searchInput} placeholder="搜索作品标题..." value={keyword} onChange={(event) => { setKeyword(event.target.value); setPage(1); }} />
        <select className={styles.select} value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }}>
          <option value="">全部状态</option>
          {Object.entries(statusLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
        </select>
      </div>

      <div className={styles.tableCard}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>作品</th>
              <th>作者</th>
              <th>分类</th>
              <th>数据</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className={styles.emptyCell}>加载中...</td></tr>
            ) : artworks.length === 0 ? (
              <tr><td colSpan={6} className={styles.emptyCell}>暂无作品</td></tr>
            ) : artworks.map((artwork) => (
              <tr key={artwork.id}>
                <td>
                  <div className={styles.mediaCell}>
                    <div className={styles.mediaThumb}>
                      {artwork.coverImage ? (
                        <Image src={artwork.coverImage} alt={artwork.title} fill unoptimized />
                      ) : (
                        <span className={styles.mediaFallback}>无图</span>
                      )}
                    </div>
                    <div className={styles.nameCell}>
                      <span className={styles.nameText}>{artwork.title}</span>
                      {artwork.description && <span className={styles.mutedCell}>{artwork.description}</span>}
                    </div>
                  </div>
                </td>
                <td className={styles.mutedCell}>{artwork.user.nickname}</td>
                <td><span className={styles.statusTag}>{artwork.category || '未分类'}</span></td>
                <td className={styles.mutedCell}>{artwork.viewCount} 浏览 · {artwork.likeCount} 赞</td>
                <td>
                  <span className={`${styles.statusTag} ${artwork.status === 'PUBLISHED' ? styles.statusActive : artwork.status === 'REJECTED' ? styles.statusInactive : styles.statusDraft}`}>
                    {statusLabels[artwork.status] ?? artwork.status}
                  </span>
                </td>
                <td>
                  <div className={styles.actions}>
                    <button className={styles.iconBtn} title="编辑" onClick={() => openEdit(artwork)}>
                      <Edit3 size={15} />
                    </button>
                    {artwork.status !== 'PUBLISHED' && (
                      <button className={`${styles.iconBtn} ${styles.iconBtnSuccess}`} title="发布" onClick={() => void handleStatus(artwork, 'PUBLISHED')}>
                        <Send size={15} />
                      </button>
                    )}
                    <button className={`${styles.iconBtn} ${styles.iconBtnDanger}`} title="删除" onClick={() => void handleDelete(artwork)}>
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
            <h3 className={styles.modalTitle}>{editingId ? '编辑作品' : '上传作品'}</h3>
            <div className={styles.formGrid}>
              <label className={styles.formField}>
                <span className={styles.formLabel}>标题 *</span>
                <input className={styles.formInput} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
              </label>
              <label className={styles.formField}>
                <span className={styles.formLabel}>状态</span>
                <select className={styles.formInput} value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
                  {Object.entries(statusLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
                </select>
              </label>
              <label className={styles.formField}>
                <span className={styles.formLabel}>分类</span>
                <input className={styles.formInput} value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} placeholder="壮锦" />
              </label>
              <label className={styles.formField}>
                <span className={styles.formLabel}>技法</span>
                <input className={styles.formInput} value={form.techniques} onChange={(event) => setForm({ ...form, techniques: event.target.value })} placeholder="逗号分隔" />
              </label>
              <label className={styles.formField}>
                <span className={styles.formLabel}>材料</span>
                <input className={styles.formInput} value={form.materials} onChange={(event) => setForm({ ...form, materials: event.target.value })} placeholder="逗号分隔" />
              </label>
              <label className={styles.formField}>
                <span className={styles.formLabel}>标签</span>
                <input className={styles.formInput} value={form.tags} onChange={(event) => setForm({ ...form, tags: event.target.value })} placeholder="逗号分隔" />
              </label>
              <label className={`${styles.formField} ${styles.formFieldFull}`}>
                <span className={styles.formLabel}>描述</span>
                <textarea className={styles.formTextarea} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} rows={3} />
              </label>
              <label className={`${styles.formField} ${styles.formFieldFull}`}>
                <span className={styles.formLabel}>创作故事</span>
                <textarea className={styles.formTextarea} value={form.story} onChange={(event) => setForm({ ...form, story: event.target.value })} rows={4} />
              </label>
              <div className={`${styles.formField} ${styles.formFieldFull}`}>
                <span className={styles.formLabel}>作品图片</span>
                <label className={styles.uploadDrop}>
                  <Upload size={18} />
                  {uploading ? '上传中...' : '上传图片，第一张为封面'}
                  <input type="file" accept="image/*" multiple hidden onChange={(event) => void handleUpload(event.target.files)} />
                </label>
                {form.imageUrls.length > 0 && (
                  <div className={styles.imageStrip}>
                    {form.imageUrls.map((url) => (
                      <div className={styles.stripItem} key={url}>
                        <Image src={url} alt="作品图片" fill unoptimized />
                        <button type="button" onClick={() => removeImage(url)}>移除</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
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

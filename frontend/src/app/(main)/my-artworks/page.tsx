'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getMyArtworks, deleteArtwork, submitArtwork } from '@/lib/artwork-api';
import { Button } from '@/components/ui/button/button';
import type { IArtwork } from '@/shared/types/community';
import styles from './page.module.css';

const STATUS_LABELS: Record<string, string> = {
  DRAFT: '草稿',
  REVIEWING: '待审核',
  PUBLISHED: '已通过',
  REJECTED: '已驳回',
};

const STATUS_VARIANTS: Record<string, string> = {
  DRAFT: 'statusDraft',
  REVIEWING: 'statusReviewing',
  PUBLISHED: 'statusPublished',
  REJECTED: 'statusRejected',
};

export default function MyArtworksPage() {
  const [artworks, setArtworks] = useState<IArtwork[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<string>('all');

  const fetchArtworks = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const res = await getMyArtworks({ page: p, pageSize: 12 });
      setArtworks(res.data);
      setTotalPages(res.pagination?.totalPages ?? 1);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchArtworks(page); // eslint-disable-line react-hooks/set-state-in-effect -- data fetching pattern
  }, [page, fetchArtworks]);

  const handleDelete = async (id: string) => {
    if (!confirm('确定删除该作品？')) return;
    try {
      await deleteArtwork(id);
      fetchArtworks(page);
    } catch {}
  };

  const handleSubmit = async (id: string) => {
    try {
      await submitArtwork(id);
      fetchArtworks(page);
    } catch {}
  };

  const filtered = tab === 'all' ? artworks : artworks.filter((a) => a.status === tab);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.heading}>我的作品</h1>
      </div>

      <div className={styles.container}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 'var(--lc-space-4)' }}>
        <Link href="/create/artwork">
          <Button variant="primary" size="sm">发布新作品</Button>
        </Link>
      </div>

      <div className={styles.tabs}>
        {[
          { key: 'all', label: '全部' },
          { key: 'DRAFT', label: '草稿' },
          { key: 'REVIEWING', label: '待审核' },
          { key: 'PUBLISHED', label: '已通过' },
          { key: 'REJECTED', label: '已驳回' },
        ].map((t) => (
          <button
            key={t.key}
            className={`${styles.tab} ${tab === t.key ? styles.tabActive : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className={styles.loading}>加载中...</div>
      ) : filtered.length === 0 ? (
        <div className={styles.empty}>
          <p>暂无作品</p>
          <Link href="/create/artwork">
            <Button variant="primary" size="sm">发布第一件作品</Button>
          </Link>
        </div>
      ) : (
        <div className={styles.grid}>
          {filtered.map((artwork) => (
            <div key={artwork.id} className={styles.card}>
              <div className={styles.cardImage} style={{ position: 'relative' }}>
                <Image
                  src={artwork.coverImage || artwork.images?.[0]?.url || '/images/placeholders/artwork-placeholder.png'}
                  alt={artwork.title}
                  fill
                  unoptimized
                />
                <span className={`${styles.status} ${styles[STATUS_VARIANTS[artwork.status] || '']}`}>
                  {STATUS_LABELS[artwork.status] || artwork.status}
                </span>
              </div>
              <div className={styles.cardBody}>
                <h3 className={styles.cardTitle}>{artwork.title}</h3>
                <p className={styles.cardDate}>
                  {new Date(artwork.createdAt).toLocaleDateString('zh-CN')}
                </p>
                <div className={styles.cardStats}>
                  <span>{artwork.viewCount} 浏览</span>
                  <span>{artwork.likeCount} 点赞</span>
                </div>
                <div className={styles.cardActions}>
                  <Link href={`/gallery/${artwork.id}`}>
                    <Button variant="ghost" size="sm">查看</Button>
                  </Link>
                  {(artwork.status === 'DRAFT' || artwork.status === 'REJECTED') && (
                    <Button variant="primary" size="sm" onClick={() => handleSubmit(artwork.id)}>
                      提交审核
                    </Button>
                  )}
                  {artwork.status === 'DRAFT' && (
                    <Button variant="danger" size="sm" onClick={() => handleDelete(artwork.id)}>
                      删除
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className={styles.pageBtn}
          >
            上一页
          </button>
          <span className={styles.pageInfo}>
            {page} / {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className={styles.pageBtn}
          >
            下一页
          </button>
        </div>
      )}
      </div>
    </div>
  );
}

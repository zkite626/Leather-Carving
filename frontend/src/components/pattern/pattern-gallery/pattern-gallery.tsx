'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { getPatterns, incrementPatternDownload, type IPatternAsset } from '@/lib/pattern-api';
import styles from './pattern-gallery.module.css';

const CATEGORIES = ['全部', '壮锦', '瑶族', '喀斯特', '现代'];

interface PatternGalleryProps {
  compact?: boolean;
}

export function PatternGallery({ compact = false }: PatternGalleryProps) {
  const [patterns, setPatterns] = useState<IPatternAsset[]>([]);
  const [category, setCategory] = useState('全部');
  const [loading, setLoading] = useState(true);
  const [previewPattern, setPreviewPattern] = useState<IPatternAsset | null>(null);

  const fetchPatterns = useCallback(async () => {
    setLoading(true);
    try {
      const query: { pageSize: number; category?: string } = { pageSize: 50 };
      if (category !== '全部') query.category = category;
      const res = await getPatterns(query);
      setPatterns(res.data);
    } catch {}
    setLoading(false);
  }, [category]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- standard data-fetching pattern
    fetchPatterns();
  }, [fetchPatterns]);

  const handleDownload = async (pattern: IPatternAsset) => {
    try {
      await incrementPatternDownload(pattern.id);
      // Trigger download
      const link = document.createElement('a');
      link.href = pattern.imageUrl;
      link.download = pattern.name;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {}
  };

  return (
    <div className={`${styles.gallery} ${compact ? styles.compact : ''}`}>
      {!compact && (
        <h3 className={styles.heading}>纹样素材库</h3>
      )}

      <div className={styles.tabs}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={`${styles.tab} ${category === cat ? styles.tabActive : ''}`}
            onClick={() => setCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className={styles.loading}>加载中...</div>
      ) : patterns.length === 0 ? (
        <div className={styles.empty}>暂无纹样素材</div>
      ) : (
        <div className={styles.grid}>
          {patterns.map((pattern) => (
            <div
              key={pattern.id}
              className={styles.item}
              onClick={() => setPreviewPattern(pattern)}
            >
              <div style={{ position: 'relative' }}><Image
                src={pattern.thumbnailUrl || pattern.imageUrl}
                alt={pattern.name}
                className={styles.thumb}
                loading="lazy"
                fill
                unoptimized
              /></div>
              <div className={styles.itemOverlay}>
                <span className={styles.itemName}>{pattern.name}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview Modal */}
      {previewPattern && (
        <div className={styles.preview} onClick={() => setPreviewPattern(null)}>
          <div className={styles.previewInner} onClick={(e) => e.stopPropagation()}>
            <button className={styles.previewClose} onClick={() => setPreviewPattern(null)}>
              &times;
            </button>
            <div style={{ position: 'relative' }}><Image
              src={previewPattern.imageUrl}
              alt={previewPattern.name}
              className={styles.previewImage}
              fill
              unoptimized
            /></div>
            <div className={styles.previewInfo}>
              <h4 className={styles.previewName}>{previewPattern.name}</h4>
              {previewPattern.description && (
                <p className={styles.previewDesc}>{previewPattern.description}</p>
              )}
              <div className={styles.previewMeta}>
                {previewPattern.origin && <span>来源: {previewPattern.origin}</span>}
                <span>下载: {previewPattern.downloadCount}</span>
              </div>
              <div className={styles.previewTags}>
                {previewPattern.tags?.map((tag) => (
                  <span key={tag} className={styles.previewTag}>{tag}</span>
                ))}
              </div>
              <button
                className={styles.downloadBtn}
                onClick={() => handleDownload(previewPattern)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                下载纹样
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

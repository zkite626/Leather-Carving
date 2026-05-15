'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { ArtworkCard } from '@/components/artwork/artwork-card/artwork-card';
import { getArtworks, type ArtworkQuery } from '@/lib/artwork-api';
import type { IArtwork } from '@/shared/types/community';
import styles from './page.module.css';

const CATEGORIES = ['全部', '壮锦', '瑶族', '喀斯特', '现代融合'];
const TECHNIQUES = ['镂刻', '印花', '染色', '烙烫', '浮雕'];
const SORT_OPTIONS: { value: string; label: string }[] = [
  { value: 'createdAt', label: '最新' },
  { value: 'likeCount', label: '最热' },
  { value: 'viewCount', label: '最多浏览' },
];

export default function GalleryPage() {
  const searchParams = useSearchParams();

  const [artworks, setArtworks] = useState<IArtwork[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '全部');
  const [selectedTechniques, setSelectedTechniques] = useState<string[]>(
    searchParams.get('techniques')?.split(',').filter(Boolean) || [],
  );
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'createdAt');
  const loaderRef = useRef<HTMLDivElement>(null);

  const fetchArtworks = useCallback(
    async (pageNum: number, append = false) => {
      setLoading(true);
      try {
        const query: ArtworkQuery = {
          page: pageNum,
          pageSize: 20,
          sortBy: sortBy as ArtworkQuery['sortBy'],
        };
        if (category !== '全部') query.category = category;
        if (keyword) query.keyword = keyword;
        if (selectedTechniques.length > 0) query.techniques = selectedTechniques.join(',');

        const res = await getArtworks(query);
        const items = res.data;

        setArtworks((prev) => (append ? [...prev, ...items] : items));
        setHasMore(pageNum < (res.pagination?.totalPages ?? 1));
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    },
    [category, keyword, selectedTechniques, sortBy],
  );

  useEffect(() => {
    setPage(1); // eslint-disable-line react-hooks/set-state-in-effect -- data fetching pattern
    void fetchArtworks(1);
  }, [fetchArtworks]);

  // Infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          const nextPage = page + 1;
          setPage(nextPage);
          fetchArtworks(nextPage, true);
        }
      },
      { threshold: 0.1 },
    );

    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [page, hasMore, loading, fetchArtworks]);

  const toggleTechnique = (t: string) => {
    setSelectedTechniques((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t],
    );
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchArtworks(1);
  };

  return (
    <div className={styles.page}>
      {/* Hero Header */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <h1 className={styles.heroTitle}>作品画廊</h1>
          <p className={styles.heroSubtitle}>探索非遗皮雕艺术的魅力</p>
        </div>
      </section>

      {/* Content */}
      <div className={styles.container}>
      {/* Filters */}
      <div className={styles.filters}>
        <form onSubmit={handleSearch} className={styles.searchBar}>
          <input
            type="text"
            placeholder="搜索作品..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className={styles.searchInput}
          />
          <button type="submit" className={styles.searchBtn}>
            搜索
          </button>
        </form>

        <div className={styles.filterRow}>
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

          <div className={styles.sortWrap}>
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                className={`${styles.sortBtn} ${sortBy === opt.value ? styles.sortBtnActive : ''}`}
                onClick={() => setSortBy(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.techniqueChips}>
          {TECHNIQUES.map((t) => (
            <button
              key={t}
              className={`${styles.chip} ${selectedTechniques.includes(t) ? styles.chipActive : ''}`}
              onClick={() => toggleTechnique(t)}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Masonry Grid */}
      <div className={styles.masonry}>
        {artworks.map((artwork) => (
          <ArtworkCard key={artwork.id} artwork={artwork} />
        ))}
      </div>

      {/* Empty state */}
      {!loading && artworks.length === 0 && (
        <div className={styles.empty}>
          <p>暂无作品</p>
        </div>
      )}

      {/* Loader */}
      {hasMore && (
        <div ref={loaderRef} className={styles.loader}>
          {loading && <div className={styles.spinner} />}
        </div>
      )}
      </div>
    </div>
  );
}

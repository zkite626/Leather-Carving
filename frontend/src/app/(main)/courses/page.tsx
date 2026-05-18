'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getCourses, type CourseQuery } from '@/lib/course-api';
import { CourseCard } from '@/components/course/course-card/course-card';
import { PageHero } from '@/components/ui/page-hero/page-hero';
import { Pagination } from '@/components/ui/pagination/pagination';
import { Skeleton } from '@/components/ui/skeleton/skeleton';
import type { ICourse, CourseLevel } from '@/shared/types/course';
import styles from './page.module.css';

const LEVEL_OPTIONS: { value: CourseLevel; label: string }[] = [
  { value: 'BEGINNER', label: '入门' },
  { value: 'INTERMEDIATE', label: '进阶' },
  { value: 'ADVANCED', label: '精通' },
  { value: 'MASTER', label: '大师' },
];

const SORT_OPTIONS: { value: string; label: string; sortBy: CourseQuery['sortBy'] }[] = [
  { value: 'createdAt', label: '最新', sortBy: 'createdAt' },
  { value: 'enrollCount', label: '最热门', sortBy: 'enrollCount' },
  { value: 'rating', label: '评分最高', sortBy: 'rating' },
  { value: 'price', label: '价格', sortBy: 'price' },
];

export default function CoursesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [courses, setCourses] = useState<ICourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({ page: 1, pageSize: 12, total: 0, totalPages: 0 });

  const [level, setLevel] = useState<CourseLevel | ''>((searchParams.get('level') as CourseLevel) || '');
  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
  const [isFree, setIsFree] = useState<boolean | undefined>(
    searchParams.get('isFree') === 'true' ? true : searchParams.get('isFree') === 'false' ? false : undefined,
  );
  const [sortBy, setSortBy] = useState<CourseQuery['sortBy']>(
    (searchParams.get('sortBy') as CourseQuery['sortBy']) || 'createdAt',
  );
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get('page')) || 1);

  const syncSearchParams = useCallback(
    (overrides: Record<string, string | undefined>) => {
      const params = new URLSearchParams();
      const merged = {
        level: level || undefined,
        isFree: isFree !== undefined ? String(isFree) : undefined,
        keyword: keyword || undefined,
        sortBy: sortBy || 'createdAt',
        page: String(currentPage),
        ...overrides,
      };
      Object.entries(merged).forEach(([key, value]) => {
        if (value !== undefined && value !== '' && value !== '1' || key === 'sortBy') {
          if (key === 'page' && value === '1') return;
          if (key === 'sortBy' && value === 'createdAt' && !overrides.sortBy) return;
          params.set(key, value as string);
        }
      });
      const qs = params.toString();
      router.push(`/courses${qs ? `?${qs}` : ''}`, { scroll: false });
    },
    [level, isFree, keyword, sortBy, currentPage, router],
  );

  useEffect(() => {
    let cancelled = false;
    async function fetchCourses() {
      setLoading(true);
      setError('');
      try {
        const query: CourseQuery = { page: currentPage, pageSize: 12, sortBy, sortOrder: sortBy === 'price' ? 'asc' : 'desc' };
        if (level) query.level = level;
        if (isFree !== undefined) query.isFree = isFree;
        if (keyword) query.keyword = keyword;

        const res = await getCourses(query);
        if (!cancelled) {
          setCourses(res.data);
          setPagination(res.pagination);
        }
      } catch {
        if (!cancelled) {
          setCourses([]);
          setError('获取课程失败，请稍后重试');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchCourses();
    return () => { cancelled = true; };
  }, [currentPage, level, isFree, keyword, sortBy]);

  const handleLevelChange = (value: CourseLevel | '') => {
    setLevel(value);
    setCurrentPage(1);
    syncSearchParams({ level: value || undefined, page: undefined });
  };

  const handleFreeToggle = () => {
    const next = isFree === true ? undefined : !isFree;
    setIsFree(next);
    setCurrentPage(1);
    syncSearchParams({ isFree: next !== undefined ? String(next) : undefined, page: undefined });
  };

  const handleKeywordCommit = () => {
    setCurrentPage(1);
    syncSearchParams({ keyword: keyword || undefined, page: undefined });
  };

  const handleSortChange = (value: CourseQuery['sortBy']) => {
    setSortBy(value);
    setCurrentPage(1);
    syncSearchParams({ sortBy: value, page: undefined });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    syncSearchParams({ page: page === 1 ? undefined : String(page) });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClearFilters = () => {
    setLevel('');
    setIsFree(undefined);
    setKeyword('');
    setSortBy('createdAt');
    setCurrentPage(1);
    router.push('/courses');
  };

  const hasActiveFilters = level || isFree !== undefined || keyword;

  return (
    <div className={styles.page}>
      <PageHero title="课程中心" subtitle="探索非遗皮雕技艺，从入门到精通" />

      <div className={styles.container}>
        {/* Level Filter Bar */}
        <div className={styles.categoryBar}>
          <div className={styles.levelChips}>
            <button type="button"
              className={`${styles.levelChip} ${level === '' ? styles.levelChipActive : ''}`}
              onClick={() => handleLevelChange('')}>
              全部等级
            </button>
            {LEVEL_OPTIONS.map((opt) => (
              <button key={opt.value} type="button"
                className={`${styles.levelChip} ${level === opt.value ? styles.levelChipActive : ''}`}
                onClick={() => handleLevelChange(opt.value)}>
                {opt.label}
              </button>
            ))}
          </div>
          {hasActiveFilters && (
            <button type="button" className={styles.clearBtn} onClick={handleClearFilters}>
              清除筛选
            </button>
          )}
        </div>

        {/* Filter Row */}
        <div className={styles.filterRow}>
          <div className={styles.filterRowGroup}>
            <label className={styles.filterRowLabel}>价格</label>
            <button type="button" className={styles.freeToggle} onClick={handleFreeToggle}>
              <span className={`${styles.toggleDot} ${isFree === true ? styles.toggleDotActive : ''}`} />
              <span className={styles.toggleText}>
                {isFree === true ? '仅免费' : isFree === false ? '仅付费' : '全部'}
              </span>
            </button>
          </div>
          <div className={styles.filterRowGroup}>
            <label className={styles.filterRowLabel}>搜索</label>
            <input type="text" className={styles.filterRowInput} placeholder="搜索课程..." value={keyword}
              onChange={(e) => setKeyword(e.target.value)} onBlur={handleKeywordCommit}
              onKeyDown={(e) => { if (e.key === 'Enter') handleKeywordCommit(); }} />
          </div>
          <div className={styles.filterRowGroup}>
            <div className={styles.sortButtons}>
              {SORT_OPTIONS.map((opt) => (
                <button key={opt.value} type="button"
                  className={`${styles.sortButton} ${sortBy === opt.sortBy ? styles.sortButtonActive : ''}`}
                  onClick={() => handleSortChange(opt.sortBy)}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Result Count */}
        <div className={styles.resultBar}>
          {loading ? (
            <Skeleton width="120px" height="18px" />
          ) : (
            <span className={styles.resultCount}>
              共 <strong>{pagination.total}</strong> 门课程
            </span>
          )}
        </div>

        {/* Course Grid */}
        {loading ? (
          <div className={styles.grid}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={styles.skeletonCard}>
                <Skeleton variant="rectangular" height="180px" />
                <div className={styles.skeletonInfo}>
                  <Skeleton width="70%" height="20px" />
                  <Skeleton width="50%" height="16px" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h3 className={styles.emptyTitle}>{error}</h3>
          </div>
        ) : courses.length > 0 ? (
          <>
            <div className={styles.grid}>
              {courses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
            {pagination.totalPages > 1 && (
              <div className={styles.paginationWrapper}>
                <Pagination current={pagination.page} total={pagination.total} pageSize={pagination.pageSize} onChange={handlePageChange} />
              </div>
            )}
          </>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
              </svg>
            </div>
            <h3 className={styles.emptyTitle}>暂无课程</h3>
            <p className={styles.emptyText}>没有找到匹配的课程，试试调整筛选条件</p>
          </div>
        )}
      </div>
    </div>
  );
}

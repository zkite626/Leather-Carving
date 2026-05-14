'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getCourses, type CourseQuery } from '@/lib/course-api';
import { CourseCard } from '@/components/course/course-card/course-card';
import { Pagination } from '@/components/ui/pagination/pagination';
import { Skeleton } from '@/components/ui/skeleton/skeleton';
import type { ICourse, CourseLevel } from '@/shared/types/course';
import type { PaginatedResponse } from '@/shared/types/api';
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
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 12,
    total: 0,
    totalPages: 0,
  });

  // Filter states synced with URL
  const [level, setLevel] = useState<CourseLevel | ''>(
    (searchParams.get('level') as CourseLevel) || '',
  );
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [isFree, setIsFree] = useState<boolean | undefined>(
    searchParams.get('isFree') === 'true'
      ? true
      : searchParams.get('isFree') === 'false'
        ? false
        : undefined,
  );
  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
  const [sortBy, setSortBy] = useState<CourseQuery['sortBy']>(
    (searchParams.get('sortBy') as CourseQuery['sortBy']) || 'createdAt',
  );
  const [currentPage, setCurrentPage] = useState(
    Number(searchParams.get('page')) || 1,
  );

  // Build query string and push to URL
  const syncSearchParams = useCallback(
    (overrides: Record<string, string | undefined>) => {
      const params = new URLSearchParams();

      const merged: Record<string, string | undefined> = {
        level: level || undefined,
        category: category || undefined,
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
    [level, category, isFree, keyword, sortBy, currentPage, router],
  );

  // Fetch courses
  useEffect(() => {
    let cancelled = false;

    async function fetchCourses() {
      setLoading(true);
      try {
        const query: CourseQuery = {
          page: currentPage,
          pageSize: 12,
          sortBy,
          sortOrder: sortBy === 'price' ? 'asc' : 'desc',
        };
        if (level) query.level = level;
        if (category) query.category = category;
        if (isFree !== undefined) query.isFree = isFree;
        if (keyword) query.keyword = keyword;

        const res: PaginatedResponse<ICourse> = await getCourses(query);

        if (!cancelled) {
          setCourses(res.data);
          setPagination(res.pagination);
        }
      } catch {
        if (!cancelled) {
          setCourses([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchCourses();
    return () => {
      cancelled = true;
    };
  }, [currentPage, level, category, isFree, keyword, sortBy]);

  // Handlers
  const handleLevelChange = (value: CourseLevel | '') => {
    setLevel(value);
    setCurrentPage(1);
    syncSearchParams({ level: value || undefined, page: undefined });
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCategory(e.target.value);
  };

  const handleCategoryCommit = () => {
    setCurrentPage(1);
    syncSearchParams({ category: category || undefined, page: undefined });
  };

  const handleFreeToggle = () => {
    const next = isFree === true ? undefined : !isFree;
    setIsFree(next);
    setCurrentPage(1);
    syncSearchParams({
      isFree: next !== undefined ? String(next) : undefined,
      page: undefined,
    });
  };

  const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKeyword(e.target.value);
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
    window.scrollTo({ top: 200, behavior: 'smooth' });
  };

  const handleClearFilters = () => {
    setLevel('');
    setCategory('');
    setIsFree(undefined);
    setKeyword('');
    setSortBy('createdAt');
    setCurrentPage(1);
    router.push('/courses');
  };

  const hasActiveFilters = level || category || isFree !== undefined || keyword;

  return (
    <div className={styles.page}>
      {/* Hero Header */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <h1 className={styles.heroTitle}>课程中心</h1>
          <p className={styles.heroSubtitle}>
            探索非遗皮雕技艺，从入门到精通
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className={styles.container}>
        <div className={styles.layout}>
          {/* Sidebar Filters */}
          <aside className={styles.sidebar}>
            <div className={styles.filterCard}>
              <div className={styles.filterHeader}>
                <h2 className={styles.filterTitle}>筛选条件</h2>
                {hasActiveFilters && (
                  <button
                    type="button"
                    className={styles.clearButton}
                    onClick={handleClearFilters}
                  >
                    清除全部
                  </button>
                )}
              </div>

              {/* Level Filter */}
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>课程等级</label>
                <div className={styles.levelButtons}>
                  <button
                    type="button"
                    className={`${styles.levelButton} ${level === '' ? styles.levelButtonActive : ''}`}
                    onClick={() => handleLevelChange('')}
                  >
                    全部
                  </button>
                  {LEVEL_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      className={`${styles.levelButton} ${level === opt.value ? styles.levelButtonActive : ''}`}
                      onClick={() => handleLevelChange(opt.value)}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Filter */}
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel} htmlFor="category-input">
                  课程分类
                </label>
                <input
                  id="category-input"
                  type="text"
                  className={styles.filterInput}
                  placeholder="输入分类..."
                  value={category}
                  onChange={handleCategoryChange}
                  onBlur={handleCategoryCommit}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCategoryCommit();
                  }}
                />
              </div>

              {/* Free/Paid Toggle */}
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>价格类型</label>
                <button
                  type="button"
                  className={styles.toggleButton}
                  onClick={handleFreeToggle}
                  aria-pressed={isFree === true}
                >
                  <span
                    className={`${styles.toggleTrack} ${isFree === true ? styles.toggleActive : ''}`}
                  >
                    <span
                      className={`${styles.toggleThumb} ${isFree === true ? styles.toggleThumbActive : ''}`}
                    />
                  </span>
                  <span className={styles.toggleLabel}>
                    {isFree === true ? '仅免费课程' : isFree === false ? '仅付费课程' : '全部课程'}
                  </span>
                </button>
              </div>

              {/* Keyword Search */}
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel} htmlFor="keyword-input">
                  关键词搜索
                </label>
                <div className={styles.searchInputWrapper}>
                  <svg
                    className={styles.searchIcon}
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    aria-hidden="true"
                  >
                    <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M11 11L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  <input
                    id="keyword-input"
                    type="text"
                    className={styles.searchInput}
                    placeholder="搜索课程..."
                    value={keyword}
                    onChange={handleKeywordChange}
                    onBlur={handleKeywordCommit}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleKeywordCommit();
                    }}
                  />
                </div>
              </div>
            </div>
          </aside>

          {/* Course Content Area */}
          <main className={styles.content}>
            {/* Toolbar */}
            <div className={styles.toolbar}>
              <div className={styles.resultInfo}>
                {loading ? (
                  <Skeleton width="120px" height="20px" />
                ) : (
                  <span className={styles.resultCount}>
                    共 <strong>{pagination.total}</strong> 门课程
                  </span>
                )}
              </div>

              <div className={styles.sortButtons}>
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    className={`${styles.sortButton} ${sortBy === opt.sortBy ? styles.sortButtonActive : ''}`}
                    onClick={() => handleSortChange(opt.sortBy)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Course Grid */}
            {loading ? (
              <div className={styles.grid}>
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className={styles.skeletonCard}>
                    <Skeleton variant="rectangular" height="180px" />
                    <div className={styles.skeletonInfo}>
                      <Skeleton width="70%" height="20px" />
                      <Skeleton width="50%" height="16px" />
                      <Skeleton width="100%" height="16px" />
                    </div>
                  </div>
                ))}
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
                    <Pagination
                      current={pagination.page}
                      total={pagination.total}
                      pageSize={pagination.pageSize}
                      onChange={handlePageChange}
                    />
                  </div>
                )}
              </>
            ) : (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>
                  <svg width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden="true">
                    <path
                      d="M52 38V52H12V38"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M52 28H12V52H52V28Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M18 12H46V28H18V12Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M32 38V44"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <h3 className={styles.emptyTitle}>暂无课程</h3>
                <p className={styles.emptyText}>
                  没有找到匹配的课程，试试调整筛选条件
                </p>
                {hasActiveFilters && (
                  <button
                    type="button"
                    className={styles.emptyButton}
                    onClick={handleClearFilters}
                  >
                    清除筛选条件
                  </button>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

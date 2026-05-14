'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getMyCourses } from '@/lib/course-api';
import { CourseCard } from '@/components/course/course-card/course-card';
import { Pagination } from '@/components/ui/pagination/pagination';
import { Skeleton } from '@/components/ui/skeleton/skeleton';
import { Button } from '@/components/ui/button/button';
import type { IEnrollment, ICourse, EnrollmentStatus } from '@/shared/types/course';
import styles from './page.module.css';

type EnrollmentWithCourse = IEnrollment & { course: ICourse };

type TabValue = 'ALL' | 'ACTIVE' | 'COMPLETED';

interface TabOption {
  value: TabValue;
  label: string;
  status?: EnrollmentStatus;
}

const TAB_OPTIONS: TabOption[] = [
  { value: 'ALL', label: '全部' },
  { value: 'ACTIVE', label: '学习中', status: 'ACTIVE' },
  { value: 'COMPLETED', label: '已完成', status: 'COMPLETED' },
];

export default function MyCoursesPage() {
  const router = useRouter();

  const [allEnrollments, setAllEnrollments] = useState<EnrollmentWithCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabValue>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);

  const pageSize = 12;

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getMyCourses(1, 200);
      setAllEnrollments(res.data);
      setTotal(res.pagination.total);
    } catch {
      setAllEnrollments([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchCourses(); // eslint-disable-line react-hooks/set-state-in-effect -- data fetching pattern
  }, [fetchCourses]);

  // Filter by tab status
  const filteredEnrollments = activeTab === 'ALL'
    ? allEnrollments
    : allEnrollments.filter((e) => e.status === activeTab);

  // Client-side pagination over filtered results
  const filteredTotal = filteredEnrollments.length;
  const totalPages = Math.max(1, Math.ceil(filteredTotal / pageSize));
  const paginatedEnrollments = filteredEnrollments.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const handleTabChange = (tab: TabValue) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 200, behavior: 'smooth' });
  };

  return (
    <div className={styles.page}>
      {/* Header */}
      <section className={styles.header}>
        <div className={styles.headerInner}>
          <h1 className={styles.title}>我的课程</h1>
          {!loading && (
            <p className={styles.subtitle}>
              共 <strong>{total}</strong> 门课程
            </p>
          )}
        </div>
      </section>

      <div className={styles.container}>
        {/* Tab Filters */}
        <div className={styles.tabs}>
          {TAB_OPTIONS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              className={`${styles.tab} ${activeTab === tab.value ? styles.tabActive : ''}`}
              onClick={() => handleTabChange(tab.value)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className={styles.grid}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={styles.skeletonCard}>
                <Skeleton variant="rectangular" height="180px" />
                <div className={styles.skeletonInfo}>
                  <Skeleton width="70%" height="20px" />
                  <Skeleton width="50%" height="16px" />
                  <Skeleton width="100%" height="8px" />
                </div>
              </div>
            ))}
          </div>
        ) : paginatedEnrollments.length > 0 ? (
          <>
            <div className={styles.grid}>
              {paginatedEnrollments.map((enrollment) => (
                <div key={enrollment.id} className={styles.cardWrapper}>
                  <CourseCard
                    course={enrollment.course}
                    showProgress={true}
                    progress={enrollment.progress}
                  />
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className={styles.paginationWrapper}>
                <Pagination
                  current={currentPage}
                  total={filteredTotal}
                  pageSize={pageSize}
                  onChange={handlePageChange}
                />
              </div>
            )}
          </>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden="true">
                <rect x="8" y="12" width="48" height="40" rx="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M8 24H56" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M20 36H44" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M24 44H40" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M24 8V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M40 8V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <h3 className={styles.emptyTitle}>
              {activeTab === 'ALL'
                ? '还没有报名课程'
                : activeTab === 'ACTIVE'
                  ? '没有学习中的课程'
                  : '没有已完成的课程'}
            </h3>
            <p className={styles.emptyText}>
              {activeTab === 'ALL'
                ? '去课程中心探索精彩的皮雕技艺课程吧'
                : '切换到其他标签查看更多课程'}
            </p>
            {activeTab === 'ALL' && (
              <Button
                variant="primary"
                size="md"
                onClick={() => router.push('/courses')}
              >
                浏览课程
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

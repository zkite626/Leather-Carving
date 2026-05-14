'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getTeacherDashboard, type TeacherDashboard } from '@/lib/course-api';
import { Button } from '@/components/ui/button/button';
import { Skeleton } from '@/components/ui/skeleton/skeleton';
import { Avatar } from '@/components/ui/avatar/avatar';
import styles from './page.module.css';

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMinutes < 1) return '刚刚';
  if (diffMinutes < 60) return `${diffMinutes} 分钟前`;
  if (diffHours < 24) return `${diffHours} 小时前`;
  if (diffDays < 30) return `${diffDays} 天前`;

  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

function getInitials(name: string): string {
  return name.charAt(0).toUpperCase();
}

export default function TeacherDashboardPage() {
  const [data, setData] = useState<TeacherDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchDashboard() {
      try {
        setLoading(true);
        const dashboard = await getTeacherDashboard();
        if (!cancelled) {
          setData(dashboard);
        }
      } catch {
        if (!cancelled) {
          setError('加载工作台数据失败，请稍后重试');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchDashboard();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className={styles.skeletonPage}>
        <div className={styles.container}>
          <div className={styles.skeletonHeader}>
            <Skeleton width="180px" height="36px" />
            <Skeleton width="120px" height="40px" />
          </div>
          <div className={styles.skeletonStatsGrid}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className={styles.skeletonStatCard}>
                <Skeleton variant="rectangular" width={48} height={48} />
                <div style={{ flex: 1 }}>
                  <Skeleton width="60px" height="28px" />
                  <div style={{ marginTop: 8 }}>
                    <Skeleton width="80px" height="16px" />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className={styles.skeletonEnrollmentSection}>
            <Skeleton width="140px" height="24px" />
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className={styles.skeletonEnrollmentRow}>
                <Skeleton variant="circular" width={36} height={36} />
                <Skeleton width="100px" height="16px" />
                <Skeleton width="150px" height="16px" />
                <Skeleton width="80px" height="16px" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.header}>
            <h1 className={styles.title}>教师工作台</h1>
          </div>
          <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--lc-error)' }}>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const stats = data ?? {
    totalCourses: 0,
    publishedCourses: 0,
    totalStudents: 0,
    avgRating: 0,
    recentEnrollments: [],
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.title}>教师工作台</h1>
          <div className={styles.headerActions}>
            <Link href="/teacher/courses">
              <Button variant="ghost" size="sm">
                管理课程
              </Button>
            </Link>
            <Link href="/teacher/courses/create">
              <Button variant="primary" size="sm">
                创建新课程
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.statIconCourses}`}>
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M4 19.5A2.5 2.5 0 016.5 17H20"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className={styles.statContent}>
              <span className={styles.statValue}>{stats.totalCourses}</span>
              <span className={styles.statLabel}>课程总数</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.statIconPublished}`}>
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M22 11.08V12a10 10 0 11-5.93-9.14"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M22 4L12 14.01l-3-3"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className={styles.statContent}>
              <span className={styles.statValue}>{stats.publishedCourses}</span>
              <span className={styles.statLabel}>已发布课程</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.statIconStudents}`}>
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle
                  cx="9"
                  cy="7"
                  r="4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M23 21v-2a4 4 0 00-3-3.87"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M16 3.13a4 4 0 010 7.75"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className={styles.statContent}>
              <span className={styles.statValue}>{stats.totalStudents}</span>
              <span className={styles.statLabel}>学员总数</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.statIconRating}`}>
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className={styles.statContent}>
              <span className={styles.statValue}>
                {stats.avgRating.toFixed(1)}
              </span>
              <span className={styles.statLabel}>平均评分</span>
            </div>
          </div>
        </div>

        {/* Recent Enrollments */}
        <div className={styles.enrollmentsSection}>
          <div className={styles.enrollmentsHeader}>
            <h2 className={styles.enrollmentsTitle}>最近报名</h2>
            <Link href="/teacher/courses" className={styles.viewAllLink}>
              查看全部
            </Link>
          </div>

          {stats.recentEnrollments.length > 0 ? (
            <ul className={styles.enrollmentsList}>
              {stats.recentEnrollments.map((enrollment) => (
                <li key={enrollment.id} className={styles.enrollmentItem}>
                  <div className={styles.enrollmentStudent}>
                    <Avatar
                      src={enrollment.user.avatar}
                      alt={enrollment.user.nickname}
                      size="sm"
                      fallback={getInitials(enrollment.user.nickname)}
                    />
                    <span className={styles.studentName}>
                      {enrollment.user.nickname}
                    </span>
                  </div>
                  <span className={styles.enrollmentCourse}>
                    {enrollment.course.title}
                  </span>
                  <span className={styles.enrollmentDate}>
                    {formatDate(enrollment.enrolledAt)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className={styles.emptyEnrollments}>
              <div className={styles.emptyEnrollmentsIcon}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle
                    cx="9"
                    cy="7"
                    r="4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                </svg>
              </div>
              <p className={styles.emptyEnrollmentsText}>暂无学员报名记录</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

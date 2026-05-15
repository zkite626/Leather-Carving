'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  getTeacherCourses,
  deleteCourse,
  publishCourse,
  type CourseQuery,
} from '@/lib/course-api';
import { Button } from '@/components/ui/button/button';
import { Tag } from '@/components/ui/tag/tag';
import { Pagination } from '@/components/ui/pagination/pagination';
import { Modal } from '@/components/ui/modal/modal';
import { useToast } from '@/components/ui/toast/toast-provider';
import { Skeleton } from '@/components/ui/skeleton/skeleton';
import type { ICourse, CourseStatus } from '@/shared/types/course';
import Image from 'next/image';
import styles from './page.module.css';

const STATUS_CONFIG: Record<CourseStatus, { label: string; variant: 'default' | 'primary' | 'success' | 'warning' }> = {
  DRAFT: { label: '草稿', variant: 'warning' },
  PUBLISHED: { label: '已发布', variant: 'success' },
  REVIEWING: { label: '审核中', variant: 'primary' },
  ARCHIVED: { label: '已归档', variant: 'default' },
};

export default function TeacherCoursesPage() {
  const { success, error: showError } = useToast();

  const [courses, setCourses] = useState<ICourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  });
  const [currentPage, setCurrentPage] = useState(1);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<ICourse | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Publish loading state
  const [publishingId, setPublishingId] = useState<string | null>(null);

  const fetchCourses = useCallback(async (page: number) => {
    try {
      setLoading(true);
      const query: CourseQuery = {
        page,
        pageSize: 10,
      };
      const res = await getTeacherCourses(query);
      setCourses(res.data);
      setPagination(res.pagination);
    } catch {
      setCourses([]);
      setPagination({ page: 1, pageSize: 10, total: 0, totalPages: 0 });
      showError('加载失败', '无法获取课程列表，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    void fetchCourses(currentPage); // eslint-disable-line react-hooks/set-state-in-effect -- data fetching pattern
  }, [currentPage, fetchCourses]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePublish = async (course: ICourse) => {
    try {
      setPublishingId(course.id);
      await publishCourse(course.id);
      success('操作成功', course.status === 'DRAFT' ? '课程已发布' : '课程状态已更新');
      fetchCourses(currentPage);
    } catch {
      showError('操作失败', '发布课程失败，请稍后重试');
    } finally {
      setPublishingId(null);
    }
  };

  const handleDeleteClick = (course: ICourse) => {
    setDeleteTarget(course);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    try {
      setDeleting(true);
      await deleteCourse(deleteTarget.id);
      success('删除成功', `课程「${deleteTarget.title}」已删除`);
      setDeleteTarget(null);

      // Refetch current page; if page is empty, go to previous
      const newTotal = pagination.total - 1;
      const newTotalPages = Math.max(1, Math.ceil(newTotal / pagination.pageSize));
      const targetPage = currentPage > newTotalPages ? newTotalPages : currentPage;
      setCurrentPage(targetPage);
      fetchCourses(targetPage);
    } catch {
      showError('删除失败', '无法删除课程，请稍后重试');
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteTarget(null);
  };

  if (loading) {
    return (
      <div className={styles.skeletonPage}>
        <div className={styles.container}>
          <div className={styles.header}>
            <Skeleton width="160px" height="36px" />
            <Skeleton width="120px" height="40px" />
          </div>
          <div className={styles.tableWrapper}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className={styles.skeletonRow}>
                <Skeleton variant="rectangular" width={56} height={40} />
                <Skeleton width="200px" height="16px" />
                <Skeleton width="60px" height="24px" />
                <Skeleton width="40px" height="16px" />
                <Skeleton width="40px" height="16px" />
                <Skeleton width="80px" height="16px" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.title}>课程管理</h1>
          <Link href="/teacher/courses/create">
            <Button variant="primary" size="sm">
              创建课程
            </Button>
          </Link>
        </div>

        {/* Course Table or Empty State */}
        {courses.length > 0 ? (
          <>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead className={styles.tableHead}>
                  <tr>
                    <th className={styles.tableHeaderCell}>课程</th>
                    <th className={styles.tableHeaderCell}>状态</th>
                    <th className={`${styles.tableHeaderCell} ${styles.tableHeaderCellAlignRight}`}>
                      报名
                    </th>
                    <th className={`${styles.tableHeaderCell} ${styles.tableHeaderCellAlignRight}`}>
                      评分
                    </th>
                    <th className={`${styles.tableHeaderCell} ${styles.tableHeaderCellAlignRight}`}>
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className={styles.tableBody}>
                  {courses.map((course) => {
                    const statusConf = STATUS_CONFIG[course.status];
                    const isPublishing = publishingId === course.id;

                    return (
                      <tr key={course.id} className={styles.tableRow}>
                        <td className={styles.tableCell}>
                          <div className={styles.courseTitleCell}>
                            {course.coverImage ? (
                              <div style={{ position: 'relative' }}>
                                <Image
                                  src={course.coverImage}
                                  alt=""
                                  className={styles.courseCover}
                                  fill
                                  unoptimized
                                />
                              </div>
                            ) : (
                              <div className={styles.courseCoverPlaceholder}>
                                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                  <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
                                  <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="1.5" />
                                  <path d="M21 15l-5-5L5 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              </div>
                            )}
                            <span className={styles.courseTitleText}>
                              {course.title}
                            </span>
                          </div>
                        </td>
                        <td className={styles.tableCell}>
                          <Tag variant={statusConf.variant}>
                            {statusConf.label}
                          </Tag>
                        </td>
                        <td className={`${styles.tableCell} ${styles.cellAlignRight} ${styles.cellNumeric}`}>
                          {course.enrollCount}
                        </td>
                        <td className={`${styles.tableCell} ${styles.cellAlignRight}`}>
                          <span className={styles.cellRating}>
                            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                            {course.rating.toFixed(1)}
                          </span>
                        </td>
                        <td className={styles.tableCell}>
                          <div className={styles.actionsCell}>
                            <Link href={`/teacher/courses/${course.id}/edit`}>
                              <button
                                type="button"
                                className={styles.iconButton}
                                title="编辑课程"
                                aria-label="编辑课程"
                              >
                                <svg viewBox="0 0 24 24" fill="none">
                                  <path
                                    d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                  <path
                                    d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              </button>
                            </Link>
                            {(course.status === 'DRAFT' || course.status === 'ARCHIVED') && (
                              <button
                                type="button"
                                className={styles.iconButton}
                                title="发布课程"
                                aria-label="发布课程"
                                onClick={() => handlePublish(course)}
                                disabled={isPublishing}
                              >
                                <svg viewBox="0 0 24 24" fill="none">
                                  <path
                                    d="M22 2L11 13"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                  <path
                                    d="M22 2l-7 20-4-9-9-4 20-7z"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              </button>
                            )}
                            {course.status === 'PUBLISHED' && (
                              <button
                                type="button"
                                className={styles.iconButton}
                                title="归档课程"
                                aria-label="归档课程"
                                onClick={() => handlePublish(course)}
                                disabled={isPublishing}
                              >
                                <svg viewBox="0 0 24 24" fill="none">
                                  <path
                                    d="M21 8v13H3V8"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                  <path
                                    d="M1 3h22v5H1z"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                  <path
                                    d="M10 12h4"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              </button>
                            )}
                            <button
                              type="button"
                              className={styles.iconButtonDanger}
                              title="删除课程"
                              aria-label="删除课程"
                              onClick={() => handleDeleteClick(course)}
                            >
                              <svg viewBox="0 0 24 24" fill="none">
                                <path
                                  d="M3 6h18"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                <path
                                  d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                <path
                                  d="M10 11v6M14 11v6"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
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
          <div className={styles.tableWrapper}>
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M4 19.5A2.5 2.5 0 016.5 17H20"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12 7v6M9 10h6"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <h3 className={styles.emptyTitle}>暂无课程</h3>
              <p className={styles.emptyText}>
                你还没有创建任何课程，点击下方按钮开始创建
              </p>
              <Link href="/teacher/courses/create">
                <Button variant="primary" size="sm">
                  创建课程
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        open={!!deleteTarget}
        onClose={handleDeleteCancel}
        title="确认删除课程"
        size="sm"
        footer={
          <div className={styles.deleteModalFooter}>
            <Button variant="ghost" size="sm" onClick={handleDeleteCancel}>
              取消
            </Button>
            <Button
              variant="danger"
              size="sm"
              loading={deleting}
              onClick={handleDeleteConfirm}
            >
              确认删除
            </Button>
          </div>
        }
      >
        <div className={styles.deleteModalContent}>
          <p className={styles.deleteModalText}>
            确定要删除课程「{deleteTarget?.title}」吗？此操作不可撤销。
          </p>
          <div className={styles.deleteModalWarning}>
            删除后，该课程的所有数据（包括学员报名记录、课时内容等）将被永久清除。
          </div>
        </div>
      </Modal>
    </div>
  );
}

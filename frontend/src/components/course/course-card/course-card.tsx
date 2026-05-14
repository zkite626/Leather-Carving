'use client';

import React from 'react';
import Link from 'next/link';
import { Tag } from '@/components/ui/tag/tag';
import type { ICourse, CourseLevel } from '@/shared/types/course';
import styles from './course-card.module.css';

const LEVEL_LABELS: Record<CourseLevel, string> = {
  BEGINNER: '入门',
  INTERMEDIATE: '进阶',
  ADVANCED: '精通',
  MASTER: '大师',
};

const LEVEL_VARIANTS: Record<CourseLevel, 'default' | 'primary' | 'success' | 'warning' | 'error'> = {
  BEGINNER: 'success',
  INTERMEDIATE: 'primary',
  ADVANCED: 'warning',
  MASTER: 'error',
};

interface CourseCardProps {
  course: ICourse;
  layout?: 'vertical' | 'horizontal';
  showTeacher?: boolean;
  showProgress?: boolean;
  progress?: number;
}

export function CourseCard({
  course,
  layout = 'vertical',
  showTeacher = true,
  showProgress = false,
  progress = 0,
}: CourseCardProps) {
  const coverUrl = course.coverImage || '/images/placeholders/course-cover-placeholder.png';

  return (
    <Link href={`/courses/${course.slug}`} className={`${styles.card} ${styles[layout]}`}>
      <div className={styles.coverWrapper}>
        <img src={coverUrl} alt={course.title} className={styles.cover} />
        <div className={styles.levelBadge}>
          <Tag variant={LEVEL_VARIANTS[course.level]}>{LEVEL_LABELS[course.level]}</Tag>
        </div>
        {course.isFree && <span className={styles.freeBadge}>免费</span>}
      </div>

      <div className={styles.info}>
        <h3 className={styles.title}>{course.title}</h3>

        {showTeacher && course.teacher && (
          <div className={styles.teacher}>
            {course.teacher.avatar ? (
              <img
                src={course.teacher.avatar}
                alt={course.teacher.nickname}
                className={styles.teacherAvatar}
              />
            ) : (
              <div className={styles.teacherAvatarPlaceholder}>
                {course.teacher.nickname?.[0] ?? '师'}
              </div>
            )}
            <span className={styles.teacherName}>{course.teacher.nickname}</span>
          </div>
        )}

        <div className={styles.meta}>
          <div className={styles.price}>
            {course.isFree ? (
              <span className={styles.freePrice}>免费</span>
            ) : (
              <>
                <span className={styles.currentPrice}>
                  {'¥'}{Number(course.price).toFixed(0)}
                </span>
                {course.originalPrice && Number(course.originalPrice) > Number(course.price) && (
                  <span className={styles.originalPrice}>
                    {'¥'}{Number(course.originalPrice).toFixed(0)}
                  </span>
                )}
              </>
            )}
          </div>

          <div className={styles.stats}>
            <span className={styles.stat}>{course.enrollCount} 人学习</span>
            {Number(course.rating) > 0 && (
              <span className={styles.rating}>
                {'★'} {Number(course.rating).toFixed(1)}
              </span>
            )}
          </div>
        </div>

        {showProgress && (
          <div className={styles.progressWrapper}>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
            <span className={styles.progressText}>{Math.round(progress)}%</span>
          </div>
        )}
      </div>
    </Link>
  );
}

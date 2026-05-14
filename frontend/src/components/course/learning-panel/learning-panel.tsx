'use client';

import React, { useState } from 'react';
import type { IChapter, ILesson, CourseLevel } from '@/shared/types/course';
import type { ILessonProgress } from '@/shared/types/course';
import styles from './learning-panel.module.css';

interface LearningPanelProps {
  chapters: IChapter[];
  currentLessonId: string;
  lessonProgresses: Record<string, ILessonProgress>;
  onLessonChange: (lessonId: string) => void;
}

export function LearningPanel({
  chapters,
  currentLessonId,
  lessonProgresses,
  onLessonChange,
}: LearningPanelProps) {
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(
    new Set(chapters.map((c) => c.id)),
  );

  const toggleChapter = (chapterId: string) => {
    setExpandedChapters((prev) => {
      const next = new Set(prev);
      if (next.has(chapterId)) {
        next.delete(chapterId);
      } else {
        next.add(chapterId);
      }
      return next;
    });
  };

  const isCompleted = (lessonId: string) => {
    return lessonProgresses[lessonId]?.isCompleted ?? false;
  };

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    if (m === 0) return `${s}秒`;
    return `${m}分${s > 0 ? `${s}秒` : ''}`;
  };

  return (
    <nav className={styles.panel} aria-label="课程大纲">
      <h3 className={styles.heading}>课程大纲</h3>

      <div className={styles.chapters}>
        {chapters.map((chapter) => (
          <div key={chapter.id} className={styles.chapter}>
            <button
              className={styles.chapterHeader}
              onClick={() => toggleChapter(chapter.id)}
              aria-expanded={expandedChapters.has(chapter.id)}
              type="button"
            >
              <span className={styles.expandIcon}>
                {expandedChapters.has(chapter.id) ? '▼' : '▶'}
              </span>
              <span className={styles.chapterTitle}>{chapter.title}</span>
              <span className={styles.chapterMeta}>
                {chapter.lessons.length} 课时
              </span>
            </button>

            {expandedChapters.has(chapter.id) && (
              <ul className={styles.lessons}>
                {chapter.lessons.map((lesson) => (
                  <li key={lesson.id}>
                    <button
                      className={`${styles.lesson} ${
                        lesson.id === currentLessonId ? styles.active : ''
                      } ${isCompleted(lesson.id) ? styles.completed : ''}`}
                      onClick={() => onLessonChange(lesson.id)}
                      type="button"
                    >
                      <span className={styles.lessonStatus}>
                        {isCompleted(lesson.id) ? (
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="var(--lc-success)">
                            <circle cx="8" cy="8" r="8" />
                            <path d="M5 8L7 10L11 6" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        ) : lesson.id === currentLessonId ? (
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="var(--lc-primary)">
                            <circle cx="8" cy="8" r="8" opacity="0.2" />
                            <path d="M6 4L12 8L6 12V4Z" fill="var(--lc-primary)" />
                          </svg>
                        ) : (
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <circle cx="8" cy="8" r="7" stroke="var(--lc-border)" strokeWidth="1.5" />
                          </svg>
                        )}
                      </span>

                      <span className={styles.lessonInfo}>
                        <span className={styles.lessonTitle}>{lesson.title}</span>
                        {lesson.duration > 0 && (
                          <span className={styles.lessonDuration}>
                            {formatDuration(lesson.duration)}
                          </span>
                        )}
                      </span>

                      {lesson.isFreePreview && (
                        <span className={styles.freeTag}>试看</span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </nav>
  );
}

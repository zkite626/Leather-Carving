'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { VideoPlayer } from '@/components/course/video-player/video-player';
import { LearningPanel } from '@/components/course/learning-panel/learning-panel';
import { AIChatWidget } from '@/components/ai/ai-chat-widget';
import {
  getCourseById,
  getCourseProgress,
  updateLessonProgress,
} from '@/lib/course-api';
import type { IChapter, ILesson, ILessonProgress } from '@/shared/types/course';
import styles from './page.module.css';

/* ---- helpers ---- */

function findCurrentLesson(chapters: IChapter[], lessonId: string): ILesson | undefined {
  for (const chapter of chapters) {
    const found = chapter.lessons.find((l) => l.id === lessonId);
    if (found) return found;
  }
  return undefined;
}

function findNextLessonId(chapters: IChapter[], currentId: string): string | null {
  const flat = chapters.flatMap((c) => c.lessons);
  const idx = flat.findIndex((l) => l.id === currentId);
  if (idx >= 0 && idx < flat.length - 1) return flat[idx + 1].id;
  return null;
}

function lessonTypeLabel(type: ILesson['type']): string {
  const map: Record<ILesson['type'], string> = {
    VIDEO: '视频课时',
    ARTICLE: '图文课时',
    QUIZ: '测验',
    PRACTICE: '实践',
  };
  return map[type] ?? '课时';
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}分${s > 0 ? `${s}秒` : ''}` : `${s}秒`;
}

/* ---- page component ---- */

export default function LearnLessonPage() {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chapters, setChapters] = useState<IChapter[]>([]);
  const [courseTitle, setCourseTitle] = useState('');
  const [lessonProgressMap, setLessonProgressMap] = useState<Record<string, ILessonProgress>>({});
  const [nextLessonId, setNextLessonId] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showAI, setShowAI] = useState(false);

  // refs used inside callbacks to avoid stale closures
  const lessonIdRef = useRef(lessonId);
  lessonIdRef.current = lessonId;

  const progressMapRef = useRef(lessonProgressMap);
  progressMapRef.current = lessonProgressMap;

  /* ---------- load course + progress ---------- */

  const loadCourse = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [course, progressData] = await Promise.all([
        getCourseById(courseId),
        getCourseProgress(courseId).catch(() => null),
      ]);

      setCourseTitle(course.title);
      setChapters(course.chapters);

      // build lesson-progress lookup
      const progressMap: Record<string, ILessonProgress> = {};
      if (progressData?.lessonProgresses) {
        for (const lp of progressData.lessonProgresses) {
          progressMap[lp.lessonId] = lp;
        }
      }
      setLessonProgressMap(progressMap);

      // check current lesson exists in course
      const current = findCurrentLesson(course.chapters, lessonId);
      if (!current) {
        // invalid lessonId - fall back to first lesson
        const first = course.chapters[0]?.lessons[0];
        if (first) {
          router.replace(`/learn/${courseId}/${first.id}`);
          return;
        }
        setError('课程暂无课时内容');
        return;
      }

      setNextLessonId(findNextLessonId(course.chapters, lessonId));
      setIsCompleted(progressMap[lessonId]?.isCompleted ?? false);
    } catch {
      setError('无法加载课程内容，请稍后再试');
    } finally {
      setLoading(false);
    }
  }, [courseId, lessonId, router]);

  useEffect(() => {
    loadCourse();
  }, [loadCourse]);

  /* ---------- navigation ---------- */

  const handleLessonChange = useCallback(
    (newLessonId: string) => {
      router.push(`/learn/${courseId}/${newLessonId}`);
    },
    [courseId, router],
  );

  const handleGoBack = useCallback(() => {
    router.push(`/courses/${courseId}`);
  }, [courseId, router]);

  const handlePrevLesson = useCallback(() => {
    const flat = chapters.flatMap((c) => c.lessons);
    const idx = flat.findIndex((l) => l.id === lessonId);
    if (idx > 0) router.push(`/learn/${courseId}/${flat[idx - 1].id}`);
  }, [chapters, lessonId, courseId, router]);

  const handleNextLesson = useCallback(() => {
    if (nextLessonId) router.push(`/learn/${courseId}/${nextLessonId}`);
  }, [nextLessonId, courseId, router]);

  /* ---------- progress tracking ---------- */

  const handleVideoProgress = useCallback(
    (currentTime: number, duration: number) => {
      updateLessonProgress(lessonIdRef.current, {
        watchedDuration: Math.floor(currentTime),
        lastPosition: Math.floor(currentTime),
      }).catch(() => {
        // silently ignore progress save failures
      });
    },
    [],
  );

  const handleVideoComplete = useCallback(() => {
    const id = lessonIdRef.current;
    updateLessonProgress(id, {
      watchedDuration: 0,
      lastPosition: 0,
      isCompleted: true,
    })
      .then(() => {
        // update local progress map
        setLessonProgressMap((prev) => {
          const existing = prev[id];
          return {
            ...prev,
            [id]: {
              ...(existing ?? {
                id: '',
                enrollmentId: '',
                lessonId: id,
                watchedDuration: 0,
                lastPosition: 0,
              }),
              isCompleted: true,
              completedAt: new Date().toISOString(),
            },
          };
        });
        setIsCompleted(true);

        // auto-advance to next lesson
        const nextId = findNextLessonId(chapters, id);
        if (nextId) {
          setTimeout(() => router.push(`/learn/${courseId}/${nextId}`), 1500);
        }
      })
      .catch(() => {});
  }, [chapters, courseId, router]);

  const handleMarkComplete = useCallback(async () => {
    try {
      await updateLessonProgress(lessonId, {
        watchedDuration: 0,
        lastPosition: 0,
        isCompleted: true,
      });
      setLessonProgressMap((prev) => {
        const existing = prev[lessonId];
        return {
          ...prev,
          [lessonId]: {
            ...(existing ?? {
              id: '',
              enrollmentId: '',
              lessonId,
              watchedDuration: 0,
              lastPosition: 0,
            }),
            isCompleted: true,
            completedAt: new Date().toISOString(),
          },
        };
      });
      setIsCompleted(true);
    } catch {
      // silently fail
    }
  }, [lessonId]);

  /* ---------- derived data ---------- */

  const currentLesson = chapters.length > 0 ? findCurrentLesson(chapters, lessonId) : undefined;
  const hasPrev = (() => {
    const flat = chapters.flatMap((c) => c.lessons);
    return flat.findIndex((l) => l.id === lessonId) > 0;
  })();
  const resumePosition = progressMapRef.current[lessonId]?.lastPosition ?? 0;

  /* ==================== render ==================== */

  // -- Loading --
  if (loading) {
    return (
      <div className={styles.loadingPage}>
        <div className={styles.topBar}>
          <button
            type="button"
            className={styles.backBtn}
            onClick={handleGoBack}
            aria-label="返回课程详情"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path
                d="M11 4L6 9L11 14"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
        <div className={styles.loadingBody}>
          <div className={styles.loadingInner}>
            <div className={styles.spinner} />
            <p className={styles.loadingText}>正在加载课程内容...</p>
          </div>
        </div>
      </div>
    );
  }

  // -- Error --
  if (error || !currentLesson) {
    return (
      <div className={styles.errorPage}>
        <div className={styles.topBar}>
          <button
            type="button"
            className={styles.backBtn}
            onClick={handleGoBack}
            aria-label="返回课程详情"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path
                d="M11 4L6 9L11 14"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
        <div className={styles.errorBody}>
          <div className={styles.errorInner}>
            <div className={styles.errorIcon}>
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <circle cx="14" cy="14" r="13" stroke="currentColor" strokeWidth="2" />
                <path d="M14 8V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <circle cx="14" cy="20" r="1.5" fill="currentColor" />
              </svg>
            </div>
            <h2 className={styles.errorTitle}>加载失败</h2>
            <p className={styles.errorDesc}>{error ?? '未找到该课时内容'}</p>
            <button type="button" className={styles.retryBtn} onClick={loadCourse}>
              重新加载
            </button>
          </div>
        </div>
      </div>
    );
  }

  // -- Main layout --
  return (
    <>
    <div className={styles.learnPage}>
      {/* ===== Top Bar ===== */}
      <div className={styles.topBar}>
        <button
          type="button"
          className={styles.backBtn}
          onClick={handleGoBack}
          aria-label="返回课程详情"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path
              d="M11 4L6 9L11 14"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <div className={styles.topDivider} />

        <span className={styles.courseTitle}>{courseTitle}</span>
        <span className={styles.lessonTitleTop}>{currentLesson.title}</span>
      </div>

      {/* ===== Main Content ===== */}
      <div className={styles.mainArea}>
        {/* Left - Video + Content */}
        <div className={styles.leftPanel}>
          {/* Video area */}
          <div className={styles.videoSection}>
            {currentLesson.videoUrl ? (
              <VideoPlayer
                src={currentLesson.videoUrl}
                onProgress={handleVideoProgress}
                onComplete={handleVideoComplete}
                initialPosition={resumePosition}
              />
            ) : (
              <div className={styles.videoPlaceholder}>
                <div className={styles.placeholderInner}>
                  <div className={styles.placeholderIcon}>
                    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                      <path
                        d="M4 6C4 4.9 4.9 4 6 4H22C23.1 4 24 4.9 24 6V22C24 23.1 23.1 24 22 24H6C4.9 24 4 23.1 4 22V6Z"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      />
                      <path
                        d="M12 10L18 14L12 18V10Z"
                        fill="currentColor"
                      />
                    </svg>
                  </div>
                  <p className={styles.placeholderTitle}>{lessonTypeLabel(currentLesson.type)}</p>
                  <p className={styles.placeholderDesc}>
                    请通过右侧大纲选择课时进行学习
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Article / lesson content */}
          {currentLesson.type === 'ARTICLE' && currentLesson.content && (
            <div className={styles.lessonContent}>
              <div className={styles.contentHeader}>
                <h1 className={styles.contentTitle}>{currentLesson.title}</h1>
                <div className={styles.contentMeta}>
                  <span>{lessonTypeLabel(currentLesson.type)}</span>
                  <span className={styles.metaDot} />
                  {currentLesson.duration > 0 && (
                    <>
                      <span>{formatDuration(currentLesson.duration)}</span>
                      <span className={styles.metaDot} />
                    </>
                  )}
                  <span>
                    {currentLesson.isFreePreview ? '免费试看' : '正式课时'}
                  </span>
                </div>
              </div>
              <div
                className={styles.articleBody}
                dangerouslySetInnerHTML={{ __html: currentLesson.content }}
              />
            </div>
          )}
        </div>

        {/* Right - Sidebar */}
        <div className={styles.rightSidebar}>
          <div className={styles.sidebarContent}>
            <LearningPanel
              chapters={chapters}
              currentLessonId={lessonId}
              lessonProgresses={lessonProgressMap}
              onLessonChange={handleLessonChange}
            />
          </div>
        </div>
      </div>

      {/* ===== Bottom Bar ===== */}
      <div className={styles.bottomBar}>
        <div className={styles.navGroup}>
          <button
            type="button"
            className={styles.navBtn}
            onClick={handlePrevLesson}
            disabled={!hasPrev}
            aria-label="上一课时"
          >
            <span className={styles.navIcon}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d="M9 3L5 7L9 11"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            上一课
          </button>

          <button
            type="button"
            className={styles.navBtn}
            onClick={handleNextLesson}
            disabled={!nextLessonId}
            aria-label="下一课时"
          >
            下一课
            <span className={styles.navIcon}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d="M5 3L9 7L5 11"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </button>

          {!isCompleted ? (
            <button
              type="button"
              className={styles.completeBtn}
              onClick={handleMarkComplete}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d="M3 7L6 10L11 4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              标记为已完成
            </button>
          ) : (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 'var(--lc-space-2)',
                fontSize: 'var(--lc-text-sm)',
                fontWeight: 500,
                color: 'var(--lc-success, #7BA05B)',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" fill="var(--lc-success, #7BA05B)" />
                <path
                  d="M5 8L7 10L11 6"
                  stroke="white"
                  strokeWidth="1.5"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              已完成
            </span>
          )}
        </div>

        <button
          className={styles.aiPlaceholder}
          onClick={() => setShowAI(!showAI)}
        >
          <span className={styles.aiIcon}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M8 2C4.7 2 2 4.7 2 8C2 9.4 2.5 10.6 3.3 11.6L2 14L4.6 13.2C5.5 13.7 6.5 14 8 14C11.3 14 14 11.3 14 8C14 4.7 11.3 2 8 2Z"
                stroke="currentColor"
                strokeWidth="1.2"
              />
              <circle cx="5.5" cy="8" r="0.8" fill="currentColor" />
              <circle cx="8" cy="8" r="0.8" fill="currentColor" />
              <circle cx="10.5" cy="8" r="0.8" fill="currentColor" />
            </svg>
          </span>
          AI 学习助手
        </button>
      </div>
    </div>
      {/* AI Learning Assistant Panel */}
      {showAI && (
        <AIChatWidget
          position="inline"
          context={`当前课程: ${courseTitle}`}
          sessionId={`learn-${courseId}`}
          placeholder="问关于这节课的任何问题..."
        />
      )}
      {!showAI && (
        <AIChatWidget
          position="floating"
          context={`当前课程: ${courseTitle}`}
          sessionId={`learn-${courseId}`}
        />
      )}
    </>
  );
}

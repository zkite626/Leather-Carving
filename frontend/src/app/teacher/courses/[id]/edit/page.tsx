'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  getCourseById,
  updateCourse,
  createChapter,
  updateChapter,
  deleteChapter,
  createLesson,
  updateLesson,
  deleteLesson,
} from '@/lib/course-api';
import type {
  CreateChapterData,
  CreateLessonData,
} from '@/lib/course-api';
import { Button } from '@/components/ui/button/button';
import { Input } from '@/components/ui/input/input';
import { Textarea } from '@/components/ui/textarea/textarea';
import { useToast } from '@/components/ui/toast/toast-provider';
import { Skeleton } from '@/components/ui/skeleton/skeleton';
import type { ICourse, IChapter, ILesson, CourseLevel, LessonType } from '@/shared/types/course';
import Image from 'next/image';
import styles from './page.module.css';

// ---------------------
// Types
// ---------------------

type Step = 'info' | 'chapters' | 'pricing' | 'preview';

interface StepDef {
  key: Step;
  label: string;
}

const STEPS: StepDef[] = [
  { key: 'info', label: '基本信息' },
  { key: 'chapters', label: '章节课时' },
  { key: 'pricing', label: '定价' },
  { key: 'preview', label: '预览/发布' },
];

const LEVEL_OPTIONS: { value: CourseLevel; label: string }[] = [
  { value: 'BEGINNER', label: '入门' },
  { value: 'INTERMEDIATE', label: '进阶' },
  { value: 'ADVANCED', label: '精通' },
  { value: 'MASTER', label: '大师' },
];

const LESSON_TYPE_OPTIONS: { value: LessonType; label: string }[] = [
  { value: 'VIDEO', label: '视频' },
  { value: 'ARTICLE', label: '图文' },
  { value: 'QUIZ', label: '测验' },
  { value: 'PRACTICE', label: '实操' },
];

const LESSON_TYPE_LABELS: Record<LessonType, string> = {
  VIDEO: '视频',
  ARTICLE: '图文',
  QUIZ: '测验',
  PRACTICE: '实操',
};

// ---------------------
// Component
// ---------------------

export default function CourseEditorPage() {
  const params = useParams();
  const courseId = params.id as string;
  const { success, error: showError } = useToast();

  // Step management
  const [currentStep, setCurrentStep] = useState<Step>('info');
  const completedSteps = new Set<Step>();

  // Course data
  const [course, setCourse] = useState<(ICourse & { chapters: IChapter[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Step 1: Basic Info form
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [level, setLevel] = useState<CourseLevel>('BEGINNER');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [coverImage, setCoverImage] = useState('');

  // Step 2: Chapters
  const [chapters, setChapters] = useState<IChapter[]>([]);
  const [addingChapter, setAddingChapter] = useState(false);
  const [newChapterTitle, setNewChapterTitle] = useState('');
  const [editingChapterId, setEditingChapterId] = useState<string | null>(null);
  const [editingChapterTitle, setEditingChapterTitle] = useState('');

  // Adding lesson state
  const [addingLessonChapterId, setAddingLessonChapterId] = useState<string | null>(null);
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newLessonType, setNewLessonType] = useState<LessonType>('VIDEO');
  const [newLessonDuration, setNewLessonDuration] = useState('0');
  const [newLessonFree, setNewLessonFree] = useState(false);

  // Editing lesson state
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [editLessonTitle, setEditLessonTitle] = useState('');
  const [editLessonType, setEditLessonType] = useState<LessonType>('VIDEO');
  const [editLessonDuration, setEditLessonDuration] = useState('0');
  const [editLessonFree, setEditLessonFree] = useState(false);

  // Step 3: Pricing
  const [price, setPrice] = useState('0');
  const [originalPrice, setOriginalPrice] = useState('');
  const [isFree, setIsFree] = useState(false);

  // Determine completed steps
  if (title.trim()) completedSteps.add('info');
  if (chapters.length > 0 && chapters.some((ch) => ch.lessons.length > 0)) {
    completedSteps.add('chapters');
  }
  completedSteps.add('pricing');

  // ---------------------
  // Load course
  // ---------------------

  // ---------------------
  // Load course
  // ---------------------

  const loadCourse = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getCourseById(courseId);
      setCourse(data);

      // Populate form
      setTitle(data.title || '');
      setSubtitle(data.subtitle || '');
      setDescription(data.description || '');
      setLevel(data.level || 'BEGINNER');
      setCategory(data.category || '');
      setTags(data.tags || []);
      setCoverImage(data.coverImage || '');
      setPrice(String(data.price ?? 0));
      setOriginalPrice(data.originalPrice ? String(data.originalPrice) : '');
      setIsFree(data.isFree ?? false);

      if (data.chapters) {
        setChapters(data.chapters);
      }
    } catch {
      showError('加载失败', '无法获取课程数据');
    } finally {
      setLoading(false);
    }
  }, [courseId, showError, setLoading, setCourse, setTitle, setSubtitle, setDescription,
      setLevel, setCategory, setTags, setCoverImage, setPrice,
      setOriginalPrice, setIsFree, setChapters]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- standard data-fetching pattern
    void loadCourse();
  }, [loadCourse]);

  // ---------------------
  // Step 1: Save Basic Info
  // ---------------------

  const handleSaveBasicInfo = async () => {
    if (!title.trim()) {
      showError('请填写标题', '课程标题不能为空');
      return;
    }

    try {
      setSaving(true);
      await updateCourse(courseId, {
        title: title.trim(),
        subtitle: subtitle.trim() || undefined,
        description: description.trim() || undefined,
        level,
        category: category.trim() || undefined,
        tags,
        coverImage: coverImage.trim() || undefined,
      });
      success('保存成功', '基本信息已更新');
    } catch {
      showError('保存失败', '无法更新基本信息');
    } finally {
      setSaving(false);
    }
  };

  // ---------------------
  // Tags
  // ---------------------

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags((prev) => [...prev, trimmed]);
    }
    setTagInput('');
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  };

  // ---------------------
  // Step 2: Chapters
  // ---------------------

  const handleAddChapter = async () => {
    if (!newChapterTitle.trim()) return;

    try {
      const data: CreateChapterData = {
        title: newChapterTitle.trim(),
        sortOrder: chapters.length,
      };
      const chapter = await createChapter(courseId, data);
      setChapters((prev) => [...prev, { ...chapter, lessons: chapter.lessons ?? [] }]);
      setNewChapterTitle('');
      setAddingChapter(false);
      success('章节已添加');
    } catch {
      showError('添加失败', '无法创建章节');
    }
  };

  const handleUpdateChapter = async (chapterId: string) => {
    if (!editingChapterTitle.trim()) return;

    try {
      await updateChapter(chapterId, { title: editingChapterTitle.trim() });
      setChapters((prev) =>
        prev.map((ch) =>
          ch.id === chapterId ? { ...ch, title: editingChapterTitle.trim() } : ch,
        ),
      );
      setEditingChapterId(null);
      setEditingChapterTitle('');
      success('章节已更新');
    } catch {
      showError('更新失败', '无法更新章节');
    }
  };

  const handleDeleteChapter = async (chapterId: string) => {
    try {
      await deleteChapter(chapterId);
      setChapters((prev) => prev.filter((ch) => ch.id !== chapterId));
      success('章节已删除');
    } catch {
      showError('删除失败', '无法删除章节');
    }
  };

  // ---------------------
  // Step 2: Lessons
  // ---------------------

  const handleAddLesson = async (chapterId: string) => {
    if (!newLessonTitle.trim()) return;

    try {
      const data: CreateLessonData = {
        title: newLessonTitle.trim(),
        type: newLessonType,
        duration: parseInt(newLessonDuration, 10) || 0,
        isFreePreview: newLessonFree,
      };
      const lesson = await createLesson(chapterId, data);
      setChapters((prev) =>
        prev.map((ch) =>
          ch.id === chapterId
            ? { ...ch, lessons: [...ch.lessons, lesson] }
            : ch,
        ),
      );
      setAddingLessonChapterId(null);
      setNewLessonTitle('');
      setNewLessonType('VIDEO');
      setNewLessonDuration('0');
      setNewLessonFree(false);
      success('课时已添加');
    } catch {
      showError('添加失败', '无法创建课时');
    }
  };

  const handleStartEditLesson = (lesson: ILesson) => {
    setEditingLessonId(lesson.id);
    setEditLessonTitle(lesson.title);
    setEditLessonType(lesson.type);
    setEditLessonDuration(String(lesson.duration));
    setEditLessonFree(lesson.isFreePreview);
  };

  const handleUpdateLesson = async () => {
    if (!editingLessonId || !editLessonTitle.trim()) return;

    try {
      await updateLesson(editingLessonId, {
        title: editLessonTitle.trim(),
        type: editLessonType,
        duration: parseInt(editLessonDuration, 10) || 0,
        isFreePreview: editLessonFree,
      });
      setChapters((prev) =>
        prev.map((ch) => ({
          ...ch,
          lessons: ch.lessons.map((ls) =>
            ls.id === editingLessonId
              ? {
                  ...ls,
                  title: editLessonTitle.trim(),
                  type: editLessonType,
                  duration: parseInt(editLessonDuration, 10) || 0,
                  isFreePreview: editLessonFree,
                }
              : ls,
          ),
        })),
      );
      setEditingLessonId(null);
      success('课时已更新');
    } catch {
      showError('更新失败', '无法更新课时');
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    try {
      await deleteLesson(lessonId);
      setChapters((prev) =>
        prev.map((ch) => ({
          ...ch,
          lessons: ch.lessons.filter((ls) => ls.id !== lessonId),
        })),
      );
      success('课时已删除');
    } catch {
      showError('删除失败', '无法删除课时');
    }
  };

  const handleToggleLessonFree = async (lesson: ILesson) => {
    try {
      await updateLesson(lesson.id, { isFreePreview: !lesson.isFreePreview });
      setChapters((prev) => {
        return prev.map((ch) => {
          return {
            ...ch,
            lessons: ch.lessons.map((ls) => {
              if (ls.id === lesson.id) {
                return { ...ls, isFreePreview: !ls.isFreePreview };
              }
              return ls;
            }),
          };
        });
      });
    } catch {
      showError('操作失败', '无法更新课时状态');
    }
  };

  // ---------------------
  // Step 3: Save Pricing
  // ---------------------

  const handleSavePricing = async () => {
    try {
      setSaving(true);
      await updateCourse(courseId, {
        price: parseFloat(price) || 0,
        originalPrice: originalPrice ? parseFloat(originalPrice) : undefined,
        isFree,
      });
      success('保存成功', '定价信息已更新');
    } catch {
      showError('保存失败', '无法更新定价信息');
    } finally {
      setSaving(false);
    }
  };

  // ---------------------
  // Step 4: Publish
  // ---------------------

  const handlePublish = async () => {
    try {
      setSaving(true);
      const { publishCourse } = await import('@/lib/course-api');
      await publishCourse(courseId);
      success('发布成功', '课程已提交审核');
      loadCourse();
    } catch {
      showError('发布失败', '无法发布课程');
    } finally {
      setSaving(false);
    }
  };

  // ---------------------
  // Helpers
  // ---------------------

  const formatDuration = (minutes: number): string => {
    if (minutes < 60) return `${minutes} 分钟`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h} 小时 ${m} 分钟` : `${h} 小时`;
  };

  const totalLessons = chapters.reduce((sum, ch) => sum + ch.lessons.length, 0);
  const totalDuration = chapters.reduce(
    (sum, ch) => sum + ch.lessons.reduce((s, l) => s + l.duration, 0),
    0,
  );

  // ---------------------
  // Loading state
  // ---------------------

  if (loading) {
    return (
      <div className={styles.skeletonPage}>
        <div className={styles.container}>
          <Skeleton width="200px" height="36px" />
          <div style={{ marginTop: 32 }}>
            <Skeleton variant="rectangular" height={56} />
          </div>
          <div className={styles.skeletonContent} style={{ marginTop: 32 }}>
            <Skeleton variant="rectangular" height={300} />
          </div>
        </div>
      </div>
    );
  }

  // ---------------------
  // Render
  // ---------------------

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <Link href="/teacher/courses" className={styles.backLink} aria-label="返回课程列表">
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M19 12H5M12 19l-7-7 7-7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
            <h1 className={styles.title}>编辑课程</h1>
          </div>
          <span style={{ fontSize: 'var(--lc-text-sm)', color: 'var(--lc-text-muted)' }}>
            {course?.title}
          </span>
        </div>

        {/* Step Indicator */}
        <nav className={styles.stepIndicator} aria-label="编辑步骤">
          {STEPS.map((step, index) => {
            const isActive = step.key === currentStep;
            const isCompleted = completedSteps.has(step.key);
            const stepClass = [
              styles.stepItem,
              isActive ? styles.stepActive : '',
              !isActive && isCompleted ? styles.stepCompleted : '',
            ]
              .filter(Boolean)
              .join(' ');

            return (
              <React.Fragment key={step.key}>
                {index > 0 && (
                  <div
                    className={`${styles.stepConnector} ${
                      isCompleted ? styles.stepConnectorCompleted : ''
                    }`}
                  />
                )}
                <button
                  type="button"
                  className={stepClass}
                  onClick={() => setCurrentStep(step.key)}
                  aria-current={isActive ? 'step' : undefined}
                >
                  <span className={styles.stepNumber}>
                    <span className={styles.stepNumberText}>{index + 1}</span>
                    <span className={styles.stepCheckmark}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M20 6L9 17l-5-5"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  </span>
                  <span className={styles.stepLabel}>{step.label}</span>
                </button>
              </React.Fragment>
            );
          })}
        </nav>

        {/* Step 1: Basic Info */}
        {currentStep === 'info' && (
          <div className={styles.formPanel}>
            <h2 className={styles.panelTitle}>基本信息</h2>
            <div className={styles.formGroup}>
              <div>
                <Input
                  label="课程标题"
                  placeholder="输入课程标题"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div>
                <Input
                  label="副标题"
                  placeholder="一句话介绍课程亮点"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                />
              </div>
              <div>
                <Textarea
                  label="课程描述"
                  placeholder="详细描述课程内容、适合人群、学习收获等"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={6}
                />
              </div>
              <div className={styles.formRow + ' ' + styles.formRowTwoCol}>
                <div>
                  <label className={styles.fieldLabel}>
                    课程等级 <span className={styles.fieldRequired}>*</span>
                  </label>
                  <select
                    className={styles.select}
                    value={level}
                    onChange={(e) => setLevel(e.target.value as CourseLevel)}
                  >
                    {LEVEL_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Input
                    label="课程分类"
                    placeholder="如：基础技法、刀具使用"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className={styles.fieldLabel}>标签</label>
                <div
                  className={styles.tagsInput}
                  onClick={() => {
                    const input = document.querySelector<HTMLInputElement>(
                      `.${styles.tagsInputField}`,
                    );
                    input?.focus();
                  }}
                >
                  {tags.map((tag) => (
                    <span key={tag} className={styles.tagChip}>
                      {tag}
                      <button
                        type="button"
                        className={styles.tagRemove}
                        onClick={() => handleRemoveTag(tag)}
                        aria-label={`移除标签 ${tag}`}
                      >
                        <svg viewBox="0 0 12 12" fill="none">
                          <path
                            d="M9 3L3 9M3 3L9 9"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                          />
                        </svg>
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    className={styles.tagsInputField}
                    placeholder={tags.length === 0 ? '输入标签后按回车添加' : '继续添加...'}
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                  />
                </div>
              </div>
              <div>
                <Input
                  label="封面图链接"
                  placeholder="https://example.com/cover.jpg"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                />
                {coverImage && (
                  <div className={styles.coverPreview} style={{ position: 'relative' }}>
                    <Image
                      src={coverImage}
                      alt="课程封面预览"
                      className={styles.coverPreviewImage}
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                      fill
                      unoptimized
                    />
                  </div>
                )}
              </div>
            </div>
            <div className={styles.stepNavigation} style={{ marginTop: 'var(--lc-space-6)' }}>
              <div />
              <Button
                variant="primary"
                onClick={async () => {
                  await handleSaveBasicInfo();
                  setCurrentStep('chapters');
                }}
                loading={saving}
              >
                保存并继续
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Chapters & Lessons */}
        {currentStep === 'chapters' && (
          <div className={styles.formPanel}>
            <h2 className={styles.panelTitle}>章节课时</h2>

            <div className={styles.chapterList}>
              {chapters.map((chapter, chIndex) => (
                <div key={chapter.id} className={styles.chapterCard}>
                  <div className={styles.chapterHeader}>
                    {editingChapterId === chapter.id ? (
                      <div
                        style={{
                          display: 'flex',
                          flex: 1,
                          gap: 'var(--lc-space-2)',
                          alignItems: 'center',
                        }}
                      >
                        <input
                          type="text"
                          value={editingChapterTitle}
                          onChange={(e) => setEditingChapterTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleUpdateChapter(chapter.id);
                            if (e.key === 'Escape') setEditingChapterId(null);
                          }}
                          autoFocus
                          style={{
                            flex: 1,
                            padding: 'var(--lc-space-2) var(--lc-space-3)',
                            border: '1px solid var(--lc-primary)',
                            borderRadius: 'var(--lc-radius-sm)',
                            fontSize: 'var(--lc-text-sm)',
                            fontFamily: 'inherit',
                            background: 'var(--lc-bg)',
                            color: 'var(--lc-text)',
                          }}
                        />
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleUpdateChapter(chapter.id)}
                        >
                          保存
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingChapterId(null)}
                        >
                          取消
                        </Button>
                      </div>
                    ) : (
                      <>
                        <span className={styles.chapterTitle}>
                          第 {chIndex + 1} 章: {chapter.title}
                        </span>
                        <div className={styles.chapterActions}>
                          <button
                            type="button"
                            className={styles.iconButton}
                            title="编辑章节"
                            aria-label="编辑章节"
                            onClick={() => {
                              setEditingChapterId(chapter.id);
                              setEditingChapterTitle(chapter.title);
                            }}
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
                          <button
                            type="button"
                            className={`${styles.iconButton} ${styles.iconButtonDanger}`}
                            title="删除章节"
                            aria-label="删除章节"
                            onClick={() => handleDeleteChapter(chapter.id)}
                          >
                            <svg viewBox="0 0 24 24" fill="none">
                              <path
                                d="M3 6h18"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                              />
                              <path
                                d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </button>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Lessons list */}
                  <ul className={styles.lessonList}>
                    {chapter.lessons.map((lesson) => (
                      <li key={lesson.id} className={styles.lessonItem}>
                        {editingLessonId === lesson.id ? (
                          <div
                            className={styles.inlineForm}
                            style={{ width: '100%', padding: 0, background: 'transparent' }}
                          >
                            <div className={styles.inlineFormRow}>
                              <input
                                type="text"
                                value={editLessonTitle}
                                onChange={(e) => setEditLessonTitle(e.target.value)}
                                placeholder="课时标题"
                                style={{
                                  flex: 1,
                                  padding: 'var(--lc-space-2) var(--lc-space-3)',
                                  border: '1px solid var(--lc-border)',
                                  borderRadius: 'var(--lc-radius-sm)',
                                  fontSize: 'var(--lc-text-sm)',
                                  fontFamily: 'inherit',
                                  background: 'var(--lc-bg)',
                                  color: 'var(--lc-text)',
                                }}
                              />
                              <select
                                className={styles.select}
                                value={editLessonType}
                                onChange={(e) => setEditLessonType(e.target.value as LessonType)}
                                style={{ width: 'auto', minWidth: 80 }}
                              >
                                {LESSON_TYPE_OPTIONS.map((opt) => (
                                  <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                  </option>
                                ))}
                              </select>
                              <input
                                type="number"
                                value={editLessonDuration}
                                onChange={(e) => setEditLessonDuration(e.target.value)}
                                placeholder="时长(分钟)"
                                min="0"
                                style={{
                                  width: 90,
                                  padding: 'var(--lc-space-2) var(--lc-space-3)',
                                  border: '1px solid var(--lc-border)',
                                  borderRadius: 'var(--lc-radius-sm)',
                                  fontSize: 'var(--lc-text-sm)',
                                  fontFamily: 'inherit',
                                  background: 'var(--lc-bg)',
                                  color: 'var(--lc-text)',
                                }}
                              />
                              <label
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 'var(--lc-space-1)',
                                  fontSize: 'var(--lc-text-xs)',
                                  color: 'var(--lc-text-secondary)',
                                  cursor: 'pointer',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                <input
                                  type="checkbox"
                                  checked={editLessonFree}
                                  onChange={(e) => setEditLessonFree(e.target.checked)}
                                />
                                免费试看
                              </label>
                            </div>
                            <div className={styles.inlineFormActions}>
                              <Button variant="ghost" size="sm" onClick={() => setEditingLessonId(null)}>
                                取消
                              </Button>
                              <Button variant="primary" size="sm" onClick={handleUpdateLesson}>
                                保存
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <span className={styles.lessonDragHandle} aria-hidden="true">
                              <svg viewBox="0 0 24 24" fill="currentColor">
                                <circle cx="9" cy="6" r="1.5" />
                                <circle cx="15" cy="6" r="1.5" />
                                <circle cx="9" cy="12" r="1.5" />
                                <circle cx="15" cy="12" r="1.5" />
                                <circle cx="9" cy="18" r="1.5" />
                                <circle cx="15" cy="18" r="1.5" />
                              </svg>
                            </span>
                            <div className={styles.lessonInfo}>
                              <span className={styles.lessonTitle}>{lesson.title}</span>
                              <div className={styles.lessonMeta}>
                                <span className={styles.lessonTypeTag}>
                                  {LESSON_TYPE_LABELS[lesson.type]}
                                </span>
                                <span className={styles.lessonDuration}>
                                  {formatDuration(lesson.duration)}
                                </span>
                                {lesson.isFreePreview && (
                                  <span className={styles.lessonFreeTag}>免费试看</span>
                                )}
                              </div>
                            </div>
                            <div className={styles.lessonActions}>
                              <button
                                type="button"
                                className={styles.iconButton}
                                title={lesson.isFreePreview ? '取消免费试看' : '设为免费试看'}
                                aria-label={lesson.isFreePreview ? '取消免费试看' : '设为免费试看'}
                                onClick={() => handleToggleLessonFree(lesson)}
                              >
                                <svg viewBox="0 0 24 24" fill="none">
                                  <path
                                    d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                  <circle
                                    cx="12"
                                    cy="12"
                                    r="3"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                  />
                                </svg>
                              </button>
                              <button
                                type="button"
                                className={styles.iconButton}
                                title="编辑课时"
                                aria-label="编辑课时"
                                onClick={() => handleStartEditLesson(lesson)}
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
                              <button
                                type="button"
                                className={`${styles.iconButton} ${styles.iconButtonDanger}`}
                                title="删除课时"
                                aria-label="删除课时"
                                onClick={() => handleDeleteLesson(lesson.id)}
                              >
                                <svg viewBox="0 0 24 24" fill="none">
                                  <path
                                    d="M3 6h18"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                  />
                                  <path
                                    d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              </button>
                            </div>
                          </>
                        )}
                      </li>
                    ))}
                  </ul>

                  {/* Add lesson form */}
                  {addingLessonChapterId === chapter.id ? (
                    <div className={styles.inlineForm}>
                      <div className={styles.inlineFormRow}>
                        <input
                          type="text"
                          value={newLessonTitle}
                          onChange={(e) => setNewLessonTitle(e.target.value)}
                          placeholder="课时标题"
                          autoFocus
                          className={styles.inlineInput}
                          style={{
                            padding: 'var(--lc-space-2) var(--lc-space-3)',
                            border: '1px solid var(--lc-border)',
                            borderRadius: 'var(--lc-radius-sm)',
                            fontSize: 'var(--lc-text-sm)',
                            fontFamily: 'inherit',
                            background: 'var(--lc-bg)',
                            color: 'var(--lc-text)',
                          }}
                        />
                        <select
                          className={styles.select}
                          value={newLessonType}
                          onChange={(e) => setNewLessonType(e.target.value as LessonType)}
                          style={{ width: 'auto', minWidth: 80 }}
                        >
                          {LESSON_TYPE_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                        <input
                          type="number"
                          value={newLessonDuration}
                          onChange={(e) => setNewLessonDuration(e.target.value)}
                          placeholder="时长(分钟)"
                          min="0"
                          style={{
                            width: 90,
                            padding: 'var(--lc-space-2) var(--lc-space-3)',
                            border: '1px solid var(--lc-border)',
                            borderRadius: 'var(--lc-radius-sm)',
                            fontSize: 'var(--lc-text-sm)',
                            fontFamily: 'inherit',
                            background: 'var(--lc-bg)',
                            color: 'var(--lc-text)',
                          }}
                        />
                        <label
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--lc-space-1)',
                            fontSize: 'var(--lc-text-xs)',
                            color: 'var(--lc-text-secondary)',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={newLessonFree}
                            onChange={(e) => setNewLessonFree(e.target.checked)}
                          />
                          免费试看
                        </label>
                      </div>
                      <div className={styles.inlineFormActions}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setAddingLessonChapterId(null);
                            setNewLessonTitle('');
                          }}
                        >
                          取消
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleAddLesson(chapter.id)}
                        >
                          添加
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className={styles.addLessonButton}
                      onClick={() => setAddingLessonChapterId(chapter.id)}
                    >
                      <svg viewBox="0 0 24 24" fill="none">
                        <path
                          d="M12 5v14M5 12h14"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      添加课时
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Add chapter */}
            {addingChapter ? (
              <div
                className={styles.inlineForm}
                style={{
                  marginTop: 'var(--lc-space-4)',
                  border: '1px dashed var(--lc-border)',
                  borderRadius: 'var(--lc-radius-md)',
                }}
              >
                <div className={styles.inlineFormRow}>
                  <input
                    type="text"
                    value={newChapterTitle}
                    onChange={(e) => setNewChapterTitle(e.target.value)}
                    placeholder="章节标题"
                    autoFocus
                    className={styles.inlineInput}
                    style={{
                      flex: 1,
                      padding: 'var(--lc-space-2) var(--lc-space-3)',
                      border: '1px solid var(--lc-border)',
                      borderRadius: 'var(--lc-radius-sm)',
                      fontSize: 'var(--lc-text-sm)',
                      fontFamily: 'inherit',
                      background: 'var(--lc-bg)',
                      color: 'var(--lc-text)',
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddChapter();
                      if (e.key === 'Escape') {
                        setAddingChapter(false);
                        setNewChapterTitle('');
                      }
                    }}
                  />
                </div>
                <div className={styles.inlineFormActions}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setAddingChapter(false);
                      setNewChapterTitle('');
                    }}
                  >
                    取消
                  </Button>
                  <Button variant="primary" size="sm" onClick={handleAddChapter}>
                    添加章节
                  </Button>
                </div>
              </div>
            ) : (
              <div style={{ marginTop: 'var(--lc-space-4)' }}>
                <Button
                  variant="ghost"
                  fullWidth
                  onClick={() => setAddingChapter(true)}
                >
                  + 添加新章节
                </Button>
              </div>
            )}

            <div className={styles.stepNavigation} style={{ marginTop: 'var(--lc-space-6)' }}>
              <Button variant="ghost" onClick={() => setCurrentStep('info')}>
                上一步
              </Button>
              <Button variant="primary" onClick={() => setCurrentStep('pricing')}>
                下一步
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Pricing */}
        {currentStep === 'pricing' && (
          <div className={styles.formPanel}>
            <h2 className={styles.panelTitle}>定价</h2>
            <div className={styles.pricingSection}>
              <div className={styles.freeToggle}>
                <button
                  type="button"
                  className={styles.toggleButton}
                  onClick={() => {
                    setIsFree((prev) => !prev);
                  }}
                  aria-pressed={isFree}
                >
                  <span
                    className={`${styles.toggleTrack} ${isFree ? styles.toggleActive : ''}`}
                  >
                    <span
                      className={`${styles.toggleThumb} ${isFree ? styles.toggleThumbActive : ''}`}
                    />
                  </span>
                  <span className={styles.toggleLabel}>
                    {isFree ? '免费课程' : '付费课程'}
                  </span>
                </button>
              </div>

              {!isFree && (
                <div className={styles.priceFields}>
                  <div>
                    <Input
                      label="课程价格"
                      placeholder="0.00"
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      prefix={<span className={styles.pricePrefix}>CNY</span>}
                    />
                  </div>
                  <div>
                    <Input
                      label="原价（可选）"
                      placeholder="0.00"
                      type="number"
                      value={originalPrice}
                      onChange={(e) => setOriginalPrice(e.target.value)}
                      prefix={<span className={styles.pricePrefix}>CNY</span>}
                      hint="填写后会显示划线价格"
                    />
                  </div>
                </div>
              )}
            </div>
            <div className={styles.stepNavigation} style={{ marginTop: 'var(--lc-space-6)' }}>
              <Button variant="ghost" onClick={() => setCurrentStep('chapters')}>
                上一步
              </Button>
              <Button
                variant="primary"
                onClick={async () => {
                  await handleSavePricing();
                  setCurrentStep('preview');
                }}
                loading={saving}
              >
                保存并继续
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Preview / Publish */}
        {currentStep === 'preview' && (
          <div className={styles.formPanel}>
            <h2 className={styles.panelTitle}>预览 / 发布</h2>

            <div className={styles.previewCard}>
              <div className={styles.previewCover} style={{ position: 'relative' }}>
                {coverImage ? (
                  <Image
                    src={coverImage}
                    alt={title}
                    className={styles.previewCoverImage}
                    fill
                    unoptimized
                  />
                ) : (
                  '暂无封面图片'
                )}
              </div>
              <div className={styles.previewBody}>
                <h3 className={styles.previewTitle}>{title || '未填写标题'}</h3>
                {subtitle && <p className={styles.previewSubtitle}>{subtitle}</p>}
                <div className={styles.previewMeta}>
                  <span className={styles.previewMetaItem}>
                    {LEVEL_OPTIONS.find((l) => l.value === level)?.label || level}
                  </span>
                  {category && (
                    <span className={styles.previewMetaItem}>{category}</span>
                  )}
                  <span className={styles.previewMetaItem}>
                    {chapters.length} 个章节
                  </span>
                  <span className={styles.previewMetaItem}>
                    {totalLessons} 个课时
                  </span>
                  {totalDuration > 0 && (
                    <span className={styles.previewMetaItem}>
                      {formatDuration(totalDuration)}
                    </span>
                  )}
                </div>
                {tags.length > 0 && (
                  <div style={{ display: 'flex', gap: 'var(--lc-space-2)', flexWrap: 'wrap' }}>
                    {tags.map((tag) => (
                      <span key={tag} className={styles.tagChip}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                {description && (
                  <p className={styles.previewDescription}>{description}</p>
                )}
                {chapters.length > 0 && (
                  <div className={styles.previewChaptersSummary}>
                    {chapters.map((ch, idx) => (
                      <div key={ch.id} className={styles.previewChapterItem}>
                        <span className={styles.previewChapterTitle}>
                          第 {idx + 1} 章: {ch.title}
                        </span>
                        <span className={styles.previewChapterCount}>
                          {ch.lessons.length} 课时
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                <div>
                  {isFree ? (
                    <span className={styles.previewPrice + ' ' + styles.previewPriceFree}>
                      免费
                    </span>
                  ) : (
                    <>
                      <span className={styles.previewPrice}>
                        {'¥'}{parseFloat(price || '0').toFixed(2)}
                      </span>
                      {originalPrice && parseFloat(originalPrice) > 0 && (
                        <span className={styles.previewOriginalPrice}>
                          {'¥'}{parseFloat(originalPrice).toFixed(2)}
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className={styles.stepNavigation} style={{ marginTop: 'var(--lc-space-6)' }}>
              <Button variant="ghost" onClick={() => setCurrentStep('pricing')}>
                上一步
              </Button>
              <div style={{ display: 'flex', gap: 'var(--lc-space-3)' }}>
                {course?.status !== 'PUBLISHED' && (
                  <Button
                    variant="primary"
                    onClick={handlePublish}
                    loading={saving}
                  >
                    发布课程
                  </Button>
                )}
                {course?.status === 'PUBLISHED' && (
                  <span
                    style={{
                      fontSize: 'var(--lc-text-sm)',
                      color: 'var(--lc-success)',
                      fontWeight: 500,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    课程已发布
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

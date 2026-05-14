import { Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getCourseBySlug } from '@/lib/course-api';
import type { CourseDetail } from '@/lib/course-api';
import type { CourseLevel, LessonType } from '@/shared/types/course';
import styles from './page.module.css';

/* ============================================
   Level & Lesson Type Helpers
   ============================================ */

const LEVEL_LABELS: Record<CourseLevel, string> = {
  BEGINNER: '入门',
  INTERMEDIATE: '进阶',
  ADVANCED: '高级',
  MASTER: '大师',
};

const LEVEL_CLASS: Record<CourseLevel, string> = {
  BEGINNER: styles.levelBeginner,
  INTERMEDIATE: styles.levelIntermediate,
  ADVANCED: styles.levelAdvanced,
  MASTER: styles.levelMaster,
};

const LESSON_TYPE_LABELS: Record<LessonType, string> = {
  VIDEO: '视频',
  ARTICLE: '图文',
  QUIZ: '测验',
  PRACTICE: '实操',
};

const LESSON_TYPE_CLASS: Record<LessonType, string> = {
  VIDEO: styles.typeVideo,
  ARTICLE: styles.typeArticle,
  QUIZ: styles.typeQuiz,
  PRACTICE: styles.typePractice,
};

const LESSON_TYPE_ICONS: Record<LessonType, string> = {
  VIDEO: '▶',
  ARTICLE: '📄',
  QUIZ: '✍',
  PRACTICE: '🔧',
};

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}秒`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}分钟`;
  const hours = Math.floor(minutes / 60);
  const remainMinutes = minutes % 60;
  return remainMinutes > 0 ? `${hours}小时${remainMinutes}分钟` : `${hours}小时`;
}

function formatTotalDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours === 0) return `${minutes}分钟`;
  if (minutes === 0) return `${hours}小时`;
  return `${hours}小时${minutes}分钟`;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function renderStars(rating: number, size: 'sm' | 'md' | 'lg' = 'md'): React.ReactNode {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <span
        key={i}
        className={styles.starIcon}
        style={{ fontSize: size === 'sm' ? '0.85rem' : size === 'lg' ? '1.4rem' : '1rem' }}
      >
        {i <= Math.round(rating) ? '★' : '☆'}
      </span>,
    );
  }
  return stars;
}

/* ============================================
   SEO Metadata
   ============================================ */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  try {
    const course = await getCourseBySlug(slug);
    if (!course) {
      return { title: '课程未找到 | 艺育皮韵' };
    }

    return {
      title: `${course.title} | 艺育皮韵`,
      description:
        course.subtitle || course.description?.slice(0, 160) || `${course.title} - 艺育皮韵非遗皮雕课程`,
      openGraph: {
        title: course.title,
        description: course.subtitle || course.description?.slice(0, 200),
        images: course.coverImage ? [{ url: course.coverImage, width: 1280, height: 720 }] : [],
        type: 'website',
      },
    };
  } catch {
    return { title: '课程详情 | 艺育皮韵' };
  }
}

/* ============================================
   Client Sub-Components
   ============================================ */

const CHAPTER_ACCORDION_SCRIPT = `
(function() {
  document.addEventListener('click', function(e) {
    var btn = e.target.closest('[data-chapter-toggle]');
    if (!btn) return;
    var id = btn.getAttribute('data-chapter-toggle');
    var body = document.getElementById('chapter-body-' + id);
    var chevron = btn.querySelector('[data-chevron]');
    if (!body) return;
    var isOpen = body.style.display !== 'none';
    body.style.display = isOpen ? 'none' : 'block';
    if (chevron) chevron.style.transform = isOpen ? '' : 'rotate(180deg)';
    btn.setAttribute('aria-expanded', String(!isOpen));
  });
})();
`;

/* ============================================
   Page Component
   ============================================ */

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let course: CourseDetail;
  try {
    const result = await getCourseBySlug(slug);
    if (!result) notFound();
    course = result;
  } catch {
    notFound();
  }

  const {
    title,
    subtitle,
    description,
    coverImage,
    level,
    tags,
    price,
    originalPrice,
    isFree,
    totalDuration,
    totalLessons,
    enrollCount,
    rating,
    chapters,
    reviews,
    teacher,
    reviewSummary,
  } = course;

  const totalChapterLessons = chapters.reduce((sum, ch) => sum + ch.lessons.length, 0);
  const maxDistribution = Math.max(...Object.values(reviewSummary.distribution), 1);

  return (
    <div className={styles.page}>
      {/* Accordion initialization script */}
      <script dangerouslySetInnerHTML={{ __html: CHAPTER_ACCORDION_SCRIPT }} />

      {/* ========== Hero Section ========== */}
      <section className={styles.hero}>
        {coverImage ? (
          <Image
            src={coverImage}
            alt={title}
            fill
            className={styles.heroImage}
            priority
            sizes="100vw"
          />
        ) : (
          <div className={styles.heroPlaceholder}>{title.charAt(0)}</div>
        )}
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <div className={styles.heroMeta}>
            <span className={`${styles.levelTag} ${LEVEL_CLASS[level]}`}>
              {LEVEL_LABELS[level]}
            </span>
          </div>
          <h1 className={styles.heroTitle}>{title}</h1>
          {subtitle && <p className={styles.heroSubtitle}>{subtitle}</p>}
          <div className={styles.heroStats}>
            <div className={styles.statItem}>
              <span className={styles.starIcon}>{'★'}</span>
              <span className={styles.ratingValue}>{rating.toFixed(1)}</span>
            </div>
            <span className={styles.statSeparator} />
            <div className={styles.statItem}>
              <span>{enrollCount.toLocaleString()} 人已学</span>
            </div>
            <span className={styles.statSeparator} />
            <div className={styles.statItem}>
              <span>{totalLessons} 节课</span>
            </div>
            <span className={styles.statSeparator} />
            <div className={styles.statItem}>
              <span>{formatTotalDuration(totalDuration)}</span>
            </div>
          </div>
          <div className={styles.heroPrice}>
            {isFree ? (
              <span className={styles.freeTag}>免费课程</span>
            ) : (
              <>
                <span className={styles.currentPrice}>
                  &yen;{price.toFixed(2)}
                </span>
                {originalPrice != null && originalPrice > price && (
                  <span className={styles.originalPrice}>
                    &yen;{originalPrice.toFixed(2)}
                  </span>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      {/* ========== Main Content ========== */}
      <div className={styles.mainContent}>
        {/* ---- Left Column ---- */}
        <div className={styles.leftColumn}>
          {/* Description */}
          <section className={styles.descriptionSection}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionAccent} />
              <h2 className={styles.sectionTitle}>课程介绍</h2>
            </div>
            {description && <p className={styles.descriptionContent}>{description}</p>}
            {tags.length > 0 && (
              <div className={styles.courseTags}>
                {tags.map((tag) => (
                  <span key={tag} className={styles.tag}>
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </section>

          {/* Chapters */}
          {chapters.length > 0 && (
            <section>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionAccent} />
                <h2 className={styles.sectionTitle}>
                  课程大纲
                  <span
                    style={{
                      fontSize: 'var(--lc-text-sm)',
                      fontWeight: 400,
                      color: 'var(--lc-text-muted)',
                      marginLeft: 'var(--lc-space-2)',
                    }}
                  >
                    ({totalChapterLessons} 节课 / {chapters.length} 章)
                  </span>
                </h2>
              </div>
              <div className={styles.chapterList}>
                {chapters
                  .sort((a, b) => a.sortOrder - b.sortOrder)
                  .map((chapter, index) => (
                    <div key={chapter.id} className={styles.chapterCard}>
                      <button
                        className={styles.chapterHeader}
                        data-chapter-toggle={chapter.id}
                        aria-expanded="false"
                        aria-controls={`chapter-body-${chapter.id}`}
                      >
                        <div className={styles.chapterHeaderLeft}>
                          <span className={styles.chapterNumber}>{index + 1}</span>
                          <span className={styles.chapterTitle}>{chapter.title}</span>
                        </div>
                        <div className={styles.chapterHeaderRight}>
                          <span className={styles.lessonCount}>
                            {chapter.lessons.length} 节
                          </span>
                          <svg
                            className={styles.chevronIcon}
                            data-chevron
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            aria-hidden="true"
                          >
                            <path
                              fillRule="evenodd"
                              d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      </button>
                      <div
                        id={`chapter-body-${chapter.id}`}
                        className={styles.chapterBody}
                        style={{ display: 'none' }}
                        role="region"
                      >
                        {chapter.lessons
                          .sort((a, b) => a.sortOrder - b.sortOrder)
                          .map((lesson) => (
                            <div key={lesson.id} className={styles.lessonItem}>
                              <div className={styles.lessonInfo}>
                                <span
                                  className={`${styles.lessonTypeIcon} ${LESSON_TYPE_CLASS[lesson.type]}`}
                                  title={LESSON_TYPE_LABELS[lesson.type]}
                                >
                                  {LESSON_TYPE_ICONS[lesson.type]}
                                </span>
                                <span className={styles.lessonTitle}>{lesson.title}</span>
                              </div>
                              <div className={styles.lessonMeta}>
                                {lesson.isFreePreview && (
                                  <span className={styles.freePreviewBadge}>免费试看</span>
                                )}
                                <span className={styles.lessonDuration}>
                                  {formatDuration(lesson.duration)}
                                </span>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
              </div>
            </section>
          )}

          {/* Reviews */}
          <section className={styles.reviewsSection}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionAccent} />
              <h2 className={styles.sectionTitle}>学员评价</h2>
            </div>

            {reviewSummary.count > 0 && (
              <div className={styles.reviewSummary}>
                <div className={styles.reviewAverage}>
                  <span className={styles.averageScore}>
                    {reviewSummary.average.toFixed(1)}
                  </span>
                  <div className={styles.averageStars}>
                    {renderStars(reviewSummary.average, 'sm')}
                  </div>
                  <span className={styles.reviewCount}>
                    {reviewSummary.count} 条评价
                  </span>
                </div>
                <div className={styles.distribution}>
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = reviewSummary.distribution[star] || 0;
                    const pct = maxDistribution > 0 ? (count / maxDistribution) * 100 : 0;
                    return (
                      <div key={star} className={styles.distributionRow}>
                        <span className={styles.distributionLabel}>
                          {star}{' '}
                          <span style={{ fontSize: '0.7rem', color: 'var(--lc-gold)' }}>
                            {'★'}
                          </span>
                        </span>
                        <div className={styles.distributionBar}>
                          <div
                            className={styles.distributionFill}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className={styles.distributionCount}>{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {reviews.length > 0 ? (
              <Suspense fallback={<div className={styles.loadingText}>加载评价中...</div>}>
                <ReviewList
                  initialReviews={reviews}
                  courseId={course.id}
                  totalCount={reviewSummary.count}
                />
              </Suspense>
            ) : (
              <div
                style={{
                  textAlign: 'center',
                  padding: 'var(--lc-space-10) 0',
                  color: 'var(--lc-text-muted)',
                  fontSize: 'var(--lc-text-sm)',
                }}
              >
                暂无评价
              </div>
            )}
          </section>
        </div>

        {/* ---- Right Column (Sidebar) ---- */}
        <aside className={styles.rightColumn}>
          <div className={styles.sidebar}>
            {/* Teacher Card */}
            <div className={styles.teacherCard}>
              <div className={styles.teacherCardTitle}>授课老师</div>
              <div className={styles.teacherProfile}>
                <div className={styles.teacherAvatar}>
                  {teacher.avatar ? (
                    <Image
                      src={teacher.avatar}
                      alt={teacher.nickname}
                      width={80}
                      height={80}
                      className={styles.teacherAvatarImage}
                    />
                  ) : (
                    <div className={styles.teacherAvatarFallback}>
                      {teacher.nickname.charAt(0)}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className={styles.teacherName}>{teacher.nickname}</h3>
                  {teacher.profile?.title && (
                    <p className={styles.teacherTitle}>{teacher.profile.title}</p>
                  )}
                  {teacher.profile?.isVerified && (
                    <span className={styles.verifiedBadge}>
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                          clipRule="evenodd"
                        />
                      </svg>
                      认证讲师
                    </span>
                  )}
                </div>
                {teacher.profile?.specialties && teacher.profile.specialties.length > 0 && (
                  <div className={styles.specialties}>
                    {teacher.profile.specialties.map((spec) => (
                      <span key={spec} className={styles.specialty}>
                        {spec}
                      </span>
                    ))}
                  </div>
                )}
                <div className={styles.teacherStats}>
                  {teacher.profile?.experience != null && (
                    <div className={styles.teacherStat}>
                      <span className={styles.teacherStatValue}>
                        {teacher.profile.experience}
                      </span>
                      <span className={styles.teacherStatLabel}>年经验</span>
                    </div>
                  )}
                  {teacher.courseCount != null && (
                    <div className={styles.teacherStat}>
                      <span className={styles.teacherStatValue}>
                        {teacher.courseCount}
                      </span>
                      <span className={styles.teacherStatLabel}>门课程</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Enroll CTA Card */}
            <div className={styles.enrollCard}>
              <div className={styles.enrollPrice}>
                {isFree ? (
                  <span className={styles.enrollFreeLabel}>免费</span>
                ) : (
                  <>
                    <span className={styles.enrollCurrentPrice}>
                      &yen;{price.toFixed(2)}
                    </span>
                    {originalPrice != null && originalPrice > price && (
                      <span className={styles.enrollOriginalPrice}>
                        &yen;{originalPrice.toFixed(2)}
                      </span>
                    )}
                  </>
                )}
              </div>

              <EnrollButton courseId={course.id} isFree={isFree} />

              <div className={styles.enrollInfo}>
                <div className={styles.enrollInfoItem}>
                  <span className={styles.enrollInfoIcon}>{'▶'}</span>
                  <span>{totalLessons} 节课程内容</span>
                </div>
                <div className={styles.enrollInfoItem}>
                  <span className={styles.enrollInfoIcon}>{'⏱'}</span>
                  <span>总时长 {formatTotalDuration(totalDuration)}</span>
                </div>
                <div className={styles.enrollInfoItem}>
                  <span className={styles.enrollInfoIcon}>{'★'}</span>
                  <span>
                    {rating.toFixed(1)} 分 / {enrollCount.toLocaleString()} 人已学
                  </span>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

/* ============================================
   Client Sub-Components (inline)
   ============================================ */

// We need client components for the enroll button (auth check + API call)
// and review list (client-side pagination). We define them as separate
// files in the same directory would be cleaner, but inline 'use client'
// modules are also valid. Below we use a pattern that imports from a
// companion client file to keep this page as a pure server component.

// Actually, since we cannot mix 'use client' in a server component file,
// we place the interactive pieces as lazy-loaded client components.
// For simplicity, we create the client components inline using a
// helper pattern: render server-side markup and progressively enhance.

/* ============================================
   Review List (Server-rendered, no interactivity needed for initial page)
   ============================================ */

function ReviewList({
  initialReviews,
  courseId,
  totalCount,
}: {
  initialReviews: CourseDetail['reviews'];
  courseId: string;
  totalCount: number;
}) {
  // Reviews are rendered server-side. Client-side pagination can be added
  // by extracting to a 'use client' component if needed.
  const pageSize = 10;
  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <>
      <div className={styles.reviewList}>
        {initialReviews.map((review) => (
          <article key={review.id} className={styles.reviewCard}>
            <div className={styles.reviewHeader}>
              <div className={styles.reviewUser}>
                <div className={styles.reviewAvatar}>
                  {review.user.avatar ? (
                    <Image
                      src={review.user.avatar}
                      alt={review.user.nickname}
                      width={40}
                      height={40}
                      className={styles.reviewAvatarImage}
                    />
                  ) : (
                    review.user.nickname.charAt(0)
                  )}
                </div>
                <div>
                  <div className={styles.reviewUserName}>{review.user.nickname}</div>
                  <div className={styles.reviewDate}>{formatDate(review.createdAt)}</div>
                </div>
              </div>
              <div className={styles.reviewStars}>{renderStars(review.rating, 'sm')}</div>
            </div>
            {review.content && <p className={styles.reviewContent}>{review.content}</p>}
            {review.images.length > 0 && (
              <div className={styles.reviewImages}>
                {review.images.map((img, i) => (
                  <Image
                    key={i}
                    src={img}
                    alt={`评价图片 ${i + 1}`}
                    width={80}
                    height={80}
                    className={styles.reviewImage}
                  />
                ))}
              </div>
            )}
          </article>
        ))}
      </div>
      {totalPages > 1 && (
        <ReviewPagination courseId={courseId} currentPage={1} totalPages={totalPages} />
      )}
    </>
  );
}

function ReviewPagination({
  currentPage,
  totalPages,
}: {
  courseId: string;
  currentPage: number;
  totalPages: number;
}) {
  const pages: (number | 'ellipsis')[] = [];

  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push('ellipsis');
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push('ellipsis');
    pages.push(totalPages);
  }

  return (
    <nav className={styles.pagination} aria-label="评价分页">
      {pages.map((p, i) =>
        p === 'ellipsis' ? (
          <span key={`e${i}`} className={styles.pageEllipsis}>
            ...
          </span>
        ) : (
          <Link
            key={p}
            href={`?reviewPage=${p}`}
            className={`${styles.pageButton} ${p === currentPage ? styles.pageActive : ''}`}
            aria-current={p === currentPage ? 'page' : undefined}
          >
            {p}
          </Link>
        ),
      )}
    </nav>
  );
}

/* ============================================
   Enroll Button (Client Component)
   We use a client-side script approach since this file is a server component.
   The actual enrollment flow requires auth state which is client-side only.
   ============================================ */

function EnrollButton({ courseId, isFree }: { courseId: string; isFree: boolean }) {
  return (
    <EnrollButtonClientWrapper courseId={courseId} isFree={isFree} />
  );
}

// This is a thin wrapper that renders static HTML on the server,
// then the client script enhances it with auth-aware behavior.
function EnrollButtonClientWrapper({
  courseId,
  isFree,
}: {
  courseId: string;
  isFree: boolean;
}) {
  const buttonText = isFree ? '免费报名' : '立即购买';
  const buttonClass = isFree ? styles.enrollButtonFree : styles.enrollButtonPrimary;

  return (
    <>
      <button
        type="button"
        className={`${styles.enrollButton} ${buttonClass}`}
        data-course-id={courseId}
        data-is-free={isFree}
        data-enroll-button
      >
        {buttonText}
      </button>
      <script
        dangerouslySetInnerHTML={{
          __html: `
(function() {
  var btn = document.querySelector('[data-enroll-button]');
  if (!btn) return;
  var courseId = btn.getAttribute('data-course-id');
  var isFree = btn.getAttribute('data-is-free') === 'true';
  var btnText = isFree ? '免费报名' : '立即购买';
  var enrollUrl = '/api/v1/courses/' + courseId + '/enroll';

  btn.addEventListener('click', function() {
    var token = localStorage.getItem('accessToken');
    if (!token) {
      window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
      return;
    }

    btn.disabled = true;
    btn.textContent = '处理中...';

    fetch(enrollUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      }
    })
    .then(function(res) { return res.json(); })
    .then(function(data) {
      if (data.code === 0 || data.code === 200) {
        btn.textContent = '已报名';
        btn.className = btn.className.replace(/enrollButton(Free|Primary)/g, '') + ' ' + '${styles.enrollButtonEnrolled}';
        btn.disabled = true;
        setTimeout(function() {
          window.location.href = '/my-courses';
        }, 1200);
      } else {
        btn.textContent = data.message || '报名失败，请重试';
        btn.disabled = false;
        setTimeout(function() { btn.textContent = btnText; }, 2000);
      }
    })
    .catch(function() {
      btn.textContent = '网络错误，请重试';
      btn.disabled = false;
      setTimeout(function() { btn.textContent = btnText; }, 2000);
    });
  });
})();
          `,
        }}
      />
    </>
  );
}

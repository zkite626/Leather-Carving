import Link from 'next/link';
import Image from 'next/image';
import { SiteHeader } from '@/components/layout/site-header/site-header';
import { Footer } from '@/components/layout/footer/footer';
import { CourseCard } from '@/components/course/course-card/course-card';
import { ArtworkCard } from '@/components/artwork/artwork-card/artwork-card';
import { ProductCard } from '@/components/product/product-card/product-card';
import { getCourses } from '@/lib/course-api';
import { getArtworks } from '@/lib/artwork-api';
import { getProducts, getGuangxiProducts } from '@/lib/product-api';
import { AnimatedStats } from './_components/animated-stats';
import { HeroContent } from './_components/hero-content';
import styles from './page.module.css';
import type { ICourse } from '@/shared/types/course';
import type { IArtwork } from '@/shared/types/community';
import type { IProduct } from '@/shared/types/product';

/* ------------------------------------------------------------------ */
/* Static data for sections that don't come from API                   */
/* ------------------------------------------------------------------ */

const CORE_SECTIONS = [
  {
    key: 'learn',
    title: '学技艺',
    subtitle: 'Learn the Craft',
    description: '从零基础到大师级，跟随非遗传承人系统学习皮雕技艺。视频教学、实操作业、AI 辅导，让学习有章可循。',
    href: '/courses',
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <rect x="4" y="6" width="28" height="36" rx="3" stroke="currentColor" strokeWidth="2.5" />
        <path d="M12 16H24M12 22H24M12 28H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="36" cy="32" r="10" fill="var(--lc-primary)" stroke="currentColor" strokeWidth="2.5" />
        <path d="M36 27V32H40" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    key: 'gallery',
    title: '赏作品',
    subtitle: 'Gallery',
    description: '浏览匠人们的精美皮雕作品，从传统纹样到现代设计，感受每一刀的匠心与温度。',
    href: '/gallery',
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <rect x="4" y="8" width="40" height="32" rx="3" stroke="currentColor" strokeWidth="2.5" />
        <circle cx="17" cy="21" r="5" stroke="currentColor" strokeWidth="2" />
        <path d="M4 32L14 24L22 30L32 20L44 32" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    key: 'shop',
    title: '购好物',
    subtitle: 'Shop',
    description: '精选匠人手作皮雕好物，广西非遗联名系列。每一件都是手工的温度，适合自用或馈赠。',
    href: '/shop',
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <path d="M6 6H10L14 30H38L42 12H12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="18" cy="38" r="4" stroke="currentColor" strokeWidth="2.5" />
        <circle cx="34" cy="38" r="4" stroke="currentColor" strokeWidth="2.5" />
        <path d="M20 18H32V26H20V18Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    key: 'community',
    title: '入圈子',
    subtitle: 'Community',
    description: '加入皮雕爱好者社区，参加创作挑战，分享心得，结识同好。让传统手艺在交流中传承。',
    href: '/community',
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <circle cx="24" cy="16" r="8" stroke="currentColor" strokeWidth="2.5" />
        <path d="M8 42C8 34.268 15.163 28 24 28C32.837 28 40 34.268 40 42" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="38" cy="18" r="5" stroke="currentColor" strokeWidth="2" />
        <circle cx="10" cy="18" r="5" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
  },
];

const HERITAGE_TEACHERS = [
  {
    name: '黄师傅',
    title: '壮族皮雕非遗传承人',
    specialty: '壮锦纹样雕刻',
    years: 30,
    quote: '每一刀都要对得起这块皮子。',
  },
  {
    name: '韦老师',
    title: '广西工艺美术大师',
    specialty: '染色与做旧工艺',
    years: 25,
    quote: '颜色是皮革的灵魂，做旧是时间的馈赠。',
  },
  {
    name: '覃师傅',
    title: '瑶族皮艺传承人',
    specialty: '浮雕与立体造型',
    years: 20,
    quote: '让传统纹样在现代设计中活起来。',
  },
  {
    name: '李老师',
    title: '中国皮革艺术协会会员',
    specialty: '植鞣革手缝工艺',
    years: 18,
    quote: '手缝一针一线，缝进去的是耐心。',
  },
  {
    name: '陈师傅',
    title: '桂林非遗工坊主理人',
    specialty: '山水题材皮雕',
    years: 22,
    quote: '桂林山水甲天下，刀下山水亦传神。',
  },
];

/* ------------------------------------------------------------------ */
/* Page (Server Component)                                             */
/* ------------------------------------------------------------------ */

export default async function HomePage() {
  /* ---------- Fetch data in parallel with fallbacks ---------- */
  const [coursesRes, artworksRes, guangxiRes, hotProductsRes] = await Promise.allSettled([
    getCourses({ pageSize: 6, sortBy: 'createdAt', sortOrder: 'desc' }),
    getArtworks({ pageSize: 8, sortBy: 'likeCount' }),
    getGuangxiProducts(),
    getProducts({ pageSize: 6, sortBy: 'sales', sortOrder: 'desc' }),
  ]);

  const courses: ICourse[] =
    coursesRes.status === 'fulfilled' ? coursesRes.value?.data ?? [] : [];
  const artworks: IArtwork[] =
    artworksRes.status === 'fulfilled' ? artworksRes.value?.data ?? [] : [];
  const guangxiProducts: IProduct[] =
    guangxiRes.status === 'fulfilled' && Array.isArray(guangxiRes.value) ? guangxiRes.value : [];
  const hotProducts: IProduct[] =
    hotProductsRes.status === 'fulfilled' ? hotProductsRes.value?.data ?? [] : [];

  return (
    <>
      <SiteHeader />

      <main>
        {/* ========== 1. HERO ========== */}
        <section className={styles.hero} aria-label="欢迎来到艺育皮韵">
          <div className={styles.heroImageWrap}>
            <Image
              src="/images/placeholders/hero-workshop-placeholder.png"
              alt="皮雕工坊"
              fill
              priority
              className={styles.heroImage}
              sizes="100vw"
            />
            <div className={styles.heroOverlay} />
          </div>
          <HeroContent />
        </section>

        {/* ========== 2. ANIMATED STATS ========== */}
        <AnimatedStats
          stats={[
            { value: 1200, label: '精品课程', suffix: '+' },
            { value: 350, label: '认证匠人', suffix: '+' },
            { value: 50000, label: '学习用户', suffix: '+' },
            { value: 98, label: '好评率', suffix: '%' },
          ]}
        />

        {/* ========== 3. FOUR CORE SECTIONS ========== */}
        <section className={styles.coreSection} aria-label="四大核心板块">
          <div className="container">
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>探索皮雕世界</h2>
              <p className={styles.sectionSubtitle}>学、赏、购、交 &mdash; 一站式非遗皮雕体验平台</p>
            </div>
            <div className={styles.coreGrid}>
              {CORE_SECTIONS.map((s) => (
                <Link key={s.key} href={s.href} className={styles.coreCard}>
                  <div className={styles.coreCardFront}>
                    <div className={styles.coreIcon}>{s.icon}</div>
                    <h3 className={styles.coreTitle}>{s.title}</h3>
                    <span className={styles.coreSubtitle}>{s.subtitle}</span>
                  </div>
                  <div className={styles.coreCardBack}>
                    <h3 className={styles.coreBackTitle}>{s.title}</h3>
                    <p className={styles.coreDescription}>{s.description}</p>
                    <span className={styles.coreCta}>
                      立即探索
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                        <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ========== 4. GUANGXI SPECIALTY (horizontal scroll) ========== */}
        {guangxiProducts.length > 0 && (
          <section className={styles.guangxiSection} aria-label="广西非遗专区">
            <div className="container">
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>
                  <span className={styles.guangxiBadge}>广西非遗</span>
                  壮锦皮韵 &middot; 匠心好物
                </h2>
                <p className={styles.sectionSubtitle}>
                  融合壮锦纹样与现代皮雕工艺，每件作品都承载着广西非遗文化的独特魅力
                </p>
              </div>
            </div>
            <div className={styles.guangxiScroll}>
              <div className={styles.guangxiTrack}>
                {guangxiProducts.map((product) => (
                  <div key={product.id} className={styles.guangxiItem}>
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ========== 5. FEATURED COURSES ========== */}
        {courses.length > 0 && (
          <section className={styles.section} aria-label="精选课程">
            <div className="container">
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>精选课程</h2>
                <p className={styles.sectionSubtitle}>
                  从入门到精通，跟随非遗传承人系统学习皮雕技艺
                </p>
                <Link href="/courses" className={styles.viewAll}>
                  查看全部
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
              </div>
              <div className={styles.courseGrid}>
                {courses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ========== 6. FEATURED ARTWORKS ========== */}
        {artworks.length > 0 && (
          <section className={styles.section} style={{ background: 'var(--lc-bg-secondary)' }} aria-label="作品精选">
            <div className="container">
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>作品精选</h2>
                <p className={styles.sectionSubtitle}>
                  欣赏匠人们的精美创作，感受皮雕艺术的无限可能
                </p>
                <Link href="/gallery" className={styles.viewAll}>
                  进入画廊
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
              </div>
              <div className={styles.artworkGrid}>
                {artworks.map((artwork) => (
                  <ArtworkCard key={artwork.id} artwork={artwork} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ========== 7. HOT PRODUCTS ========== */}
        {hotProducts.length > 0 && (
          <section className={styles.section} aria-label="热门好物">
            <div className="container">
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>热门好物</h2>
                <p className={styles.sectionSubtitle}>
                  精选匠人手作，每一件都承载着手工的温度
                </p>
                <Link href="/shop" className={styles.viewAll}>
                  进入商城
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
              </div>
              <div className={styles.productGrid}>
                {hotProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ========== 8. HERITAGE TEACHERS ========== */}
        <section className={styles.teachersSection} aria-label="传承匠人">
          <div className="container">
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>传承匠人</h2>
              <p className={styles.sectionSubtitle}>
                跟随经验丰富的非遗传承人与工艺大师，学习真正的皮雕技艺
              </p>
            </div>
            <div className={styles.teacherGrid}>
              {HERITAGE_TEACHERS.map((teacher) => (
                <div key={teacher.name} className={styles.teacherCard}>
                  <div className={styles.teacherAvatar}>
                    <div className={styles.teacherAvatarPlaceholder}>
                      {teacher.name[0]}
                    </div>
                  </div>
                  <div className={styles.teacherInfo}>
                    <h3 className={styles.teacherName}>{teacher.name}</h3>
                    <p className={styles.teacherTitle}>{teacher.title}</p>
                    <div className={styles.teacherMeta}>
                      <span className={styles.teacherSpecialty}>{teacher.specialty}</span>
                      <span className={styles.teacherYears}>{teacher.years}年经验</span>
                    </div>
                    <blockquote className={styles.teacherQuote}>
                      &ldquo;{teacher.quote}&rdquo;
                    </blockquote>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ========== 9. CTA BANNER ========== */}
        <section className={styles.ctaBanner} aria-label="立即加入">
          <div className="container">
            <div className={styles.ctaInner}>
              <h2 className={styles.ctaTitle}>开启你的皮雕之旅</h2>
              <p className={styles.ctaDescription}>
                无论你是零基础的爱好者，还是想精进技艺的匠人，这里都有属于你的课程和圈子。
              </p>
              <div className={styles.ctaButtons}>
                <Link href="/register" className={styles.ctaPrimary}>
                  免费注册
                </Link>
                <Link href="/courses" className={styles.ctaSecondary}>
                  浏览课程
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

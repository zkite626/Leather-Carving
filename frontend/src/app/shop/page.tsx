'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import {
  getProducts,
  getCategories,
  getGuangxiProducts,
  getHotProducts,
  getNewProducts,
  type ProductQuery,
} from '@/lib/product-api';
import { ProductCard } from '@/components/product/product-card/product-card';
import { Pagination } from '@/components/ui/pagination/pagination';
import { Skeleton } from '@/components/ui/skeleton/skeleton';
import type { ApiResponse, PaginatedResponse } from '@/shared/types/api';
import type { IProduct, IProductCategory } from '@/shared/types/product';
import styles from './page.module.css';

/* ---- Banner types ---- */
interface Banner {
  id: string;
  title: string;
  imageUrl: string;
  link?: string;
}

const SORT_OPTIONS: { value: string; label: string; sortBy: ProductQuery['sortBy'] }[] = [
  { value: 'createdAt', label: '最新', sortBy: 'createdAt' },
  { value: 'sales', label: '最热销', sortBy: 'sales' },
  { value: 'price', label: '价格', sortBy: 'price' },
  { value: 'rating', label: '评分', sortBy: 'rating' },
];

/* ---- Category emoji fallback map ---- */
const CATEGORY_EMOJI: Record<string, string> = {
  default: '📦',
};

export default function ShopPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  /* ========== Banner state ========== */
  const [banners, setBanners] = useState<Banner[]>([]);
  const [bannerIndex, setBannerIndex] = useState(0);
  const bannerTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* ========== Category nav state ========== */
  const [categories, setCategories] = useState<IProductCategory[]>([]);

  /* ========== Featured sections state ========== */
  const [guangxiProducts, setGuangxiProducts] = useState<IProduct[]>([]);
  const [hotProducts, setHotProducts] = useState<IProduct[]>([]);
  const [newProducts, setNewProducts] = useState<IProduct[]>([]);
  const [sectionsLoading, setSectionsLoading] = useState(true);

  /* ========== All-products listing state ========== */
  const [products, setProducts] = useState<IProduct[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 12,
    total: 0,
    totalPages: 0,
  });

  /* Filter states synced with URL */
  const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || '');
  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [sortBy, setSortBy] = useState<ProductQuery['sortBy']>(
    (searchParams.get('sortBy') as ProductQuery['sortBy']) || 'createdAt',
  );
  const [currentPage, setCurrentPage] = useState(
    Number(searchParams.get('page')) || 1,
  );

  /* ========== Fetch banners ========== */
  useEffect(() => {
    let cancelled = false;
    async function fetchBanners() {
      try {
        const res = await apiClient.get<ApiResponse<Banner[]>>('/banners?position=shop');
        if (!cancelled) {
          setBanners(res.data.data ?? []);
        }
      } catch {
        // silently fail - will show static hero
      }
    }
    fetchBanners();
    return () => { cancelled = true; };
  }, []);

  /* Banner auto-rotate */
  useEffect(() => {
    if (banners.length <= 1) return;
    bannerTimerRef.current = setInterval(() => {
      setBannerIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => {
      if (bannerTimerRef.current) clearInterval(bannerTimerRef.current);
    };
  }, [banners.length]);

  const goToBanner = (index: number) => {
    setBannerIndex(index);
    if (bannerTimerRef.current) clearInterval(bannerTimerRef.current);
    bannerTimerRef.current = setInterval(() => {
      setBannerIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
  };

  /* ========== Fetch categories + featured sections ========== */
  useEffect(() => {
    let cancelled = false;
    async function fetchSections() {
      setSectionsLoading(true);
      try {
        const [cats, guangxi, hot, newItems] = await Promise.all([
          getCategories(),
          getGuangxiProducts(),
          getHotProducts(),
          getNewProducts(),
        ]);
        if (!cancelled) {
          setCategories(cats);
          setGuangxiProducts(guangxi);
          setHotProducts(hot);
          setNewProducts(newItems);
        }
      } catch {
        // empty arrays stay
      } finally {
        if (!cancelled) setSectionsLoading(false);
      }
    }
    fetchSections();
    return () => { cancelled = true; };
  }, []);

  /* ========== URL sync helpers ========== */
  const syncSearchParams = useCallback(
    (overrides: Record<string, string | undefined>) => {
      const params = new URLSearchParams();

      const merged: Record<string, string | undefined> = {
        category: activeCategory || undefined,
        keyword: keyword || undefined,
        minPrice: minPrice || undefined,
        maxPrice: maxPrice || undefined,
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
      router.push(`/shop${qs ? `?${qs}` : ''}`, { scroll: false });
    },
    [activeCategory, keyword, minPrice, maxPrice, sortBy, currentPage, router],
  );

  /* ========== Fetch all products ========== */
  useEffect(() => {
    let cancelled = false;

    async function fetchProducts() {
      setProductsLoading(true);
      try {
        const query: ProductQuery = {
          page: currentPage,
          pageSize: 12,
          sortBy,
          sortOrder: sortBy === 'price' ? 'asc' : 'desc',
        };
        if (activeCategory) {
          // Find category id from the slug
          const cat = findCategoryBySlug(categories, activeCategory);
          if (cat) query.categoryId = cat.id;
        }
        if (minPrice) query.minPrice = Number(minPrice);
        if (maxPrice) query.maxPrice = Number(maxPrice);
        if (keyword) query.keyword = keyword;

        const res: PaginatedResponse<IProduct> = await getProducts(query);

        if (!cancelled) {
          setProducts(res.data);
          setPagination(res.pagination);
        }
      } catch {
        if (!cancelled) {
          setProducts([]);
        }
      } finally {
        if (!cancelled) {
          setProductsLoading(false);
        }
      }
    }

    // Only fetch products after categories have loaded (or if no category filter)
    if (!activeCategory || categories.length > 0) {
      fetchProducts();
    }

    return () => { cancelled = true; };
  }, [currentPage, activeCategory, keyword, minPrice, maxPrice, sortBy, categories]);

  /* ========== Handlers ========== */
  const handleCategoryNavClick = (slug: string) => {
    setActiveCategory(slug);
    setCurrentPage(1);
    syncSearchParams({ category: slug || undefined, page: undefined });
    // Scroll to all-products section
    const el = document.getElementById('all-products');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleSidebarCategoryClick = (slug: string) => {
    setActiveCategory(slug);
    setCurrentPage(1);
    syncSearchParams({ category: slug || undefined, page: undefined });
  };

  const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKeyword(e.target.value);
  };

  const handleKeywordCommit = () => {
    setCurrentPage(1);
    syncSearchParams({ keyword: keyword || undefined, page: undefined });
  };

  const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMinPrice(e.target.value);
  };

  const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMaxPrice(e.target.value);
  };

  const handlePriceCommit = () => {
    setCurrentPage(1);
    syncSearchParams({
      minPrice: minPrice || undefined,
      maxPrice: maxPrice || undefined,
      page: undefined,
    });
  };

  const handleSortChange = (value: ProductQuery['sortBy']) => {
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
    setActiveCategory('');
    setKeyword('');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('createdAt');
    setCurrentPage(1);
    router.push('/shop');
  };

  const hasActiveFilters = activeCategory || keyword || minPrice || maxPrice;

  /* ========== Helpers ========== */
  const getCategoryIcon = (cat: IProductCategory) => {
    return cat.icon || CATEGORY_EMOJI.default;
  };

  return (
    <div className={styles.page}>
      {/* ============ Banner / Hero ============ */}
      <section className={styles.banner}>
        {banners.length > 0 ? (
          <>
            <div className={styles.bannerTrack}>
              {banners.map((banner, i) => (
                <div
                  key={banner.id}
                  className={`${styles.bannerSlide} ${i === bannerIndex ? styles.bannerSlideActive : ''}`}
                >
                  <Image src={banner.imageUrl} alt={banner.title} className={styles.bannerImage} fill unoptimized />
                  <div className={styles.bannerOverlay} />
                  {banner.title && (
                    <div className={styles.bannerContent}>
                      <h2 className={styles.bannerTitle}>{banner.title}</h2>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Dots navigation */}
            {banners.length > 1 && (
              <div className={styles.bannerDots}>
                {banners.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`${styles.bannerDot} ${i === bannerIndex ? styles.bannerDotActive : ''}`}
                    onClick={() => goToBanner(i)}
                    aria-label={`Banner ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          /* Static hero when no banners */
          <div className={styles.staticHero}>
            <div className={styles.heroInner}>
              <h1 className={styles.heroTitle}>匠心商城</h1>
              <p className={styles.heroSubtitle}>
                精选手工皮雕艺术品，传承非遗匠心之美
              </p>
            </div>
          </div>
        )}
      </section>

      {/* ============ Category Navigation ============ */}
      {categories.length > 0 && (
        <section className={styles.categoryNav}>
          <div className={styles.categoryScroll}>
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                className={`${styles.categoryItem} ${activeCategory === cat.slug ? styles.categoryItemActive : ''}`}
                onClick={() => handleCategoryNavClick(cat.slug)}
              >
                <span className={styles.categoryIcon}>{getCategoryIcon(cat)}</span>
                <span className={styles.categoryName}>{cat.name}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* ============ Guangxi Specialty Section ============ */}
      {sectionsLoading ? (
        <section className={styles.section}>
          <div className={styles.container}>
            <div className={styles.sectionGrid}>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className={styles.skeletonCard}>
                  <Skeleton variant="rectangular" height="200px" />
                  <div className={styles.skeletonInfo}>
                    <Skeleton width="70%" height="20px" />
                    <Skeleton width="40%" height="16px" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : guangxiProducts.length > 0 ? (
        <section className={`${styles.section} ${styles.guangxiSection}`}>
          <div className={styles.container}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.goldAccent}>|</span> 广西非遗特色
              </h2>
              <button
                type="button"
                className={styles.viewMore}
                onClick={() => handleCategoryNavClick('')}
              >
                查看更多
              </button>
            </div>
            <div className={styles.sectionGrid}>
              {guangxiProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* ============ Hot Products Section ============ */}
      {!sectionsLoading && hotProducts.length > 0 && (
        <section className={styles.section}>
          <div className={styles.container}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>热销好物</h2>
            </div>
            <div className={styles.sectionGrid}>
              {hotProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============ New Arrivals Section ============ */}
      {!sectionsLoading && newProducts.length > 0 && (
        <section className={styles.section}>
          <div className={styles.container}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>新品上架</h2>
            </div>
            <div className={styles.sectionGrid}>
              {newProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============ All Products with Sidebar ============ */}
      <section id="all-products" className={styles.section}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>全部商品</h2>
          </div>
          <div className={styles.layout}>
            {/* Sidebar Filters */}
            <aside className={styles.sidebar}>
              <div className={styles.filterCard}>
                <div className={styles.filterHeader}>
                  <h3 className={styles.filterTitle}>筛选条件</h3>
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

                {/* Category Tree */}
                <div className={styles.filterGroup}>
                  <label className={styles.filterLabel}>商品分类</label>
                  <div className={styles.categoryList}>
                    <button
                      type="button"
                      className={`${styles.categoryListButton} ${activeCategory === '' ? styles.categoryListButtonActive : ''}`}
                      onClick={() => handleSidebarCategoryClick('')}
                    >
                      全部分类
                    </button>
                    {categories.map((cat) => (
                      <React.Fragment key={cat.id}>
                        <button
                          type="button"
                          className={`${styles.categoryListButton} ${activeCategory === cat.slug ? styles.categoryListButtonActive : ''}`}
                          onClick={() => handleSidebarCategoryClick(cat.slug)}
                        >
                          {getCategoryIcon(cat)} {cat.name}
                        </button>
                        {cat.children?.map((child) => (
                          <button
                            key={child.id}
                            type="button"
                            className={`${styles.categoryListButton} ${styles.categoryListChild} ${activeCategory === child.slug ? styles.categoryListButtonActive : ''}`}
                            onClick={() => handleSidebarCategoryClick(child.slug)}
                          >
                            {child.name}
                          </button>
                        ))}
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                {/* Price Range Filter */}
                <div className={styles.filterGroup}>
                  <label className={styles.filterLabel}>价格区间</label>
                  <div className={styles.priceRange}>
                    <input
                      type="number"
                      className={styles.priceInput}
                      placeholder="最低"
                      value={minPrice}
                      onChange={handleMinPriceChange}
                      onBlur={handlePriceCommit}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handlePriceCommit();
                      }}
                      min="0"
                    />
                    <span className={styles.priceSeparator}>-</span>
                    <input
                      type="number"
                      className={styles.priceInput}
                      placeholder="最高"
                      value={maxPrice}
                      onChange={handleMaxPriceChange}
                      onBlur={handlePriceCommit}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handlePriceCommit();
                      }}
                      min="0"
                    />
                  </div>
                </div>

                {/* Keyword Search */}
                <div className={styles.filterGroup}>
                  <label className={styles.filterLabel} htmlFor="shop-keyword-input">
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
                      id="shop-keyword-input"
                      type="text"
                      className={styles.searchInput}
                      placeholder="搜索商品..."
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

            {/* Product Content Area */}
            <main className={styles.content}>
              {/* Toolbar */}
              <div className={styles.toolbar}>
                <div className={styles.resultInfo}>
                  {productsLoading ? (
                    <Skeleton width="120px" height="20px" />
                  ) : (
                    <span className={styles.resultCount}>
                      共 <strong>{pagination.total}</strong> 件商品
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

              {/* Product Grid */}
              {productsLoading ? (
                <div className={styles.grid}>
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className={styles.skeletonCard}>
                      <Skeleton variant="rectangular" height="200px" />
                      <div className={styles.skeletonInfo}>
                        <Skeleton width="70%" height="20px" />
                        <Skeleton width="50%" height="16px" />
                        <Skeleton width="100%" height="16px" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : products.length > 0 ? (
                <>
                  <div className={styles.grid}>
                    {products.map((product) => (
                      <ProductCard key={product.id} product={product} />
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
                  <h3 className={styles.emptyTitle}>暂无商品</h3>
                  <p className={styles.emptyText}>
                    没有找到匹配的商品，试试调整筛选条件
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
      </section>
    </div>
  );
}

/* ---- Utility: find category by slug recursively ---- */
function findCategoryBySlug(
  categories: IProductCategory[],
  slug: string,
): IProductCategory | undefined {
  for (const cat of categories) {
    if (cat.slug === slug) return cat;
    if (cat.children) {
      const found = findCategoryBySlug(cat.children, slug);
      if (found) return found;
    }
  }
  return undefined;
}

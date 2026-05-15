'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getProducts, getCategories, type ProductQuery } from '@/lib/product-api';
import { ProductCard } from '@/components/product/product-card/product-card';
import { Pagination } from '@/components/ui/pagination/pagination';
import { Skeleton } from '@/components/ui/skeleton/skeleton';
import type { IProduct, IProductCategory } from '@/shared/types/product';
import styles from './page.module.css';

const SORT_OPTIONS: { value: string; label: string; sortBy: ProductQuery['sortBy'] }[] = [
  { value: 'createdAt', label: '最新', sortBy: 'createdAt' },
  { value: 'sales', label: '最热销', sortBy: 'sales' },
  { value: 'price', label: '价格', sortBy: 'price' },
  { value: 'rating', label: '评分', sortBy: 'rating' },
];

export default function ShopPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [categories, setCategories] = useState<IProductCategory[]>([]);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const categoriesRef = useRef<IProductCategory[]>([]);
  categoriesRef.current = categories;

  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({ page: 1, pageSize: 24, total: 0, totalPages: 0 });

  const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || '');
  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [sortBy, setSortBy] = useState<ProductQuery['sortBy']>(
    (searchParams.get('sortBy') as ProductQuery['sortBy']) || 'createdAt',
  );
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get('page')) || 1);

  // Fetch categories
  useEffect(() => {
    let cancelled = false;
    getCategories()
      .then((cats) => { if (!cancelled) setCategories(Array.isArray(cats) ? cats : []); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  // URL sync
  const syncSearchParams = useCallback(
    (overrides: Record<string, string | undefined>) => {
      const params = new URLSearchParams();
      const merged = {
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

  // Fetch products
  useEffect(() => {
    let cancelled = false;
    async function fetchProducts() {
      setLoading(true);
      setError('');
      try {
        const query: ProductQuery = { page: currentPage, pageSize: 24, sortBy, sortOrder: sortBy === 'price' ? 'asc' : 'desc' };
        if (activeCategory) {
          const cat = findCategoryBySlug(categoriesRef.current, activeCategory);
          if (cat) query.categoryId = cat.id;
        }
        if (minPrice) query.minPrice = Number(minPrice);
        if (maxPrice) query.maxPrice = Number(maxPrice);
        if (keyword) query.keyword = keyword;

        const res = await getProducts(query);
        if (!cancelled) {
          setProducts(res.data);
          setPagination(res.pagination);
        }
      } catch (e) {
        if (!cancelled) {
          setProducts([]);
          setError('获取商品失败，请稍后重试');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchProducts();
    return () => { cancelled = true; };
  }, [currentPage, activeCategory, keyword, minPrice, maxPrice, sortBy]);

  // Handlers
  const handleCategoryClick = (slug: string) => {
    setActiveCategory(slug);
    setCurrentPage(1);
    syncSearchParams({ category: slug || undefined, page: undefined });
  };

  const handleKeywordCommit = () => {
    setCurrentPage(1);
    syncSearchParams({ keyword: keyword || undefined, page: undefined });
  };

  const handlePriceCommit = () => {
    setCurrentPage(1);
    syncSearchParams({ minPrice: minPrice || undefined, maxPrice: maxPrice || undefined, page: undefined });
  };

  const handleSortChange = (value: ProductQuery['sortBy']) => {
    setSortBy(value);
    setCurrentPage(1);
    syncSearchParams({ sortBy: value, page: undefined });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    syncSearchParams({ page: page === 1 ? undefined : String(page) });
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  // Find active category name for display
  const activeCategoryName = activeCategory
    ? findCategoryBySlug(categories, activeCategory)?.name
    : null;

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <h1 className={styles.heroTitle}>匠心商城</h1>
          <p className={styles.heroSubtitle}>精选手工皮雕艺术品，传承非遗匠心之美</p>
        </div>
      </section>

      <div className={styles.container}>
        {/* Category Filter Bar */}
        <div className={styles.categoryBar}>
          <button
            type="button"
            className={styles.categoryToggle}
            onClick={() => setCategoriesOpen(!categoriesOpen)}
          >
            <span className={styles.categoryToggleLabel}>
              {activeCategoryName || '全部商品'}
            </span>
            <svg
              className={`${styles.categoryToggleArrow} ${categoriesOpen ? styles.categoryToggleArrowOpen : ''}`}
              width="16" height="16" viewBox="0 0 16 16" fill="none"
            >
              <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          {hasActiveFilters && (
            <button type="button" className={styles.clearBtn} onClick={handleClearFilters}>
              清除筛选
            </button>
          )}
        </div>

        {/* Collapsible Category List */}
        {categoriesOpen && (
          <div className={styles.categoryPanel}>
            <button
              type="button"
              className={`${styles.categoryChip} ${activeCategory === '' ? styles.categoryChipActive : ''}`}
              onClick={() => { handleCategoryClick(''); setCategoriesOpen(false); }}
            >
              全部商品
            </button>
            {categories.map((cat) => (
              <React.Fragment key={cat.id}>
                <button
                  type="button"
                  className={`${styles.categoryChip} ${activeCategory === cat.slug ? styles.categoryChipActive : ''}`}
                  onClick={() => { handleCategoryClick(cat.slug); setCategoriesOpen(false); }}
                >
                  {cat.icon || '📦'} {cat.name}
                </button>
                {cat.children?.map((child) => (
                  <button
                    key={child.id}
                    type="button"
                    className={`${styles.categoryChip} ${styles.categoryChipChild} ${activeCategory === child.slug ? styles.categoryChipActive : ''}`}
                    onClick={() => { handleCategoryClick(child.slug); setCategoriesOpen(false); }}
                  >
                    {child.name}
                  </button>
                ))}
              </React.Fragment>
            ))}
          </div>
        )}

        {/* Price & Keyword Filter Row */}
        <div className={styles.filterRow}>
          <div className={styles.filterRowGroup}>
            <label className={styles.filterRowLabel}>价格</label>
            <div className={styles.priceRange}>
              <input type="number" className={styles.priceInput} placeholder="最低" value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)} onBlur={handlePriceCommit}
                onKeyDown={(e) => { if (e.key === 'Enter') handlePriceCommit(); }} min="0" />
              <span className={styles.priceSep}>-</span>
              <input type="number" className={styles.priceInput} placeholder="最高" value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)} onBlur={handlePriceCommit}
                onKeyDown={(e) => { if (e.key === 'Enter') handlePriceCommit(); }} min="0" />
            </div>
          </div>
          <div className={styles.filterRowGroup}>
            <label className={styles.filterRowLabel}>搜索</label>
            <input type="text" className={styles.filterRowInput} placeholder="搜索商品..." value={keyword}
              onChange={(e) => setKeyword(e.target.value)} onBlur={handleKeywordCommit}
              onKeyDown={(e) => { if (e.key === 'Enter') handleKeywordCommit(); }} />
          </div>
          <div className={styles.filterRowGroup}>
            <div className={styles.sortButtons}>
              {SORT_OPTIONS.map((opt) => (
                <button key={opt.value} type="button"
                  className={`${styles.sortButton} ${sortBy === opt.sortBy ? styles.sortButtonActive : ''}`}
                  onClick={() => handleSortChange(opt.sortBy)}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Result Count */}
        <div className={styles.resultBar}>
          {loading ? (
            <Skeleton width="120px" height="18px" />
          ) : (
            <span className={styles.resultCount}>
              共 <strong>{pagination.total}</strong> 件商品
            </span>
          )}
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className={styles.grid}>
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className={styles.skeletonCard}>
                <Skeleton variant="rectangular" height="200px" />
                <div className={styles.skeletonInfo}>
                  <Skeleton width="70%" height="20px" />
                  <Skeleton width="50%" height="16px" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h3 className={styles.emptyTitle}>{error}</h3>
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
                <Pagination current={pagination.page} total={pagination.total} pageSize={pagination.pageSize} onChange={handlePageChange} />
              </div>
            )}
          </>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
            </div>
            <h3 className={styles.emptyTitle}>暂无商品</h3>
            <p className={styles.emptyText}>没有找到匹配的商品，试试调整筛选条件</p>
          </div>
        )}
      </div>
    </div>
  );
}

function findCategoryBySlug(categories: IProductCategory[], slug: string): IProductCategory | undefined {
  for (const cat of categories) {
    if (cat.slug === slug) return cat;
    if (cat.children) {
      const found = findCategoryBySlug(cat.children, slug);
      if (found) return found;
    }
  }
  return undefined;
}

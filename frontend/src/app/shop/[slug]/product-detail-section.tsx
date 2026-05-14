'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { addToCart } from '@/lib/cart-api';
import { useCartStore } from '@/stores/cart-store';
import type { ProductDetail } from '@/lib/product-api';
import styles from './page.module.css';

/* ============================================
   Helpers
   ============================================ */

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function renderStars(rating: number): React.ReactNode {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <span
        key={i}
        className={`${styles.starIcon} ${i > Math.round(rating) ? styles.starIconEmpty : ''}`}
      >
        {i <= Math.round(rating) ? '★' : '☆'}
      </span>,
    );
  }
  return stars;
}

function isHtmlContent(text: string): boolean {
  return /<[a-z][\s\S]*>/i.test(text);
}

/* ============================================
   Tab Switch Script
   ============================================ */

const TAB_SWITCH_SCRIPT = `
(function() {
  function switchTab(tabName) {
    var tabs = document.querySelectorAll('[data-tab]');
    var panels = document.querySelectorAll('[data-tab-panel]');
    var indicator = document.querySelector('[data-tab-indicator]');
    var activeIdx = 0;
    tabs.forEach(function(tab, idx) {
      var isActive = tab.getAttribute('data-tab') === tabName;
      if (isActive) activeIdx = idx;
      if (isActive) { tab.classList.add('${styles.tabActive}'); }
      else { tab.classList.remove('${styles.tabActive}'); }
      tab.setAttribute('aria-selected', String(isActive));
    });
    panels.forEach(function(panel) {
      var isActive = panel.getAttribute('data-tab-panel') === tabName;
      if (isActive) { panel.classList.add('${styles.tabPanelActive}'); }
      else { panel.classList.remove('${styles.tabPanelActive}'); }
    });
    if (indicator) {
      indicator.style.transform = 'translateX(' + (activeIdx * 100) + '%)';
    }
  }
  document.addEventListener('click', function(e) {
    var btn = e.target.closest('[data-tab]');
    if (!btn) return;
    e.preventDefault();
    switchTab(btn.getAttribute('data-tab'));
  });
  switchTab('detail');
})();
`;

/* ============================================
   Toast Helper
   ============================================ */

function showToast(message: string) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent('lc:toast', { detail: { message } }),
  );
}

/* ============================================
   ProductDetailSection (Client Component)
   ============================================ */

interface Props {
  product: ProductDetail;
}

export function ProductDetailSection({ product }: Props) {
  const router = useRouter();
  const cartStore = useCartStore();

  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  // Image gallery
  const images = product.images?.length > 0
    ? [...product.images].sort((a, b) => a.sortOrder - b.sortOrder)
    : product.coverImage
      ? [{ id: 'cover', url: product.coverImage, sortOrder: 0 }]
      : [];

  const currentImage = images[selectedImageIdx];

  const handleThumbnailClick = useCallback(
    (idx: number) => {
      if (idx === selectedImageIdx || isTransitioning) return;
      setIsTransitioning(true);
      setTimeout(() => {
        setSelectedImageIdx(idx);
        setIsTransitioning(false);
      }, 180);
    },
    [selectedImageIdx, isTransitioning],
  );

  // Quantity
  const handleQuantityChange = useCallback(
    (newQty: number) => {
      const clamped = Math.max(1, Math.min(newQty, product.stock));
      setQuantity(clamped);
    },
    [product.stock],
  );

  const handleQuantityInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = parseInt(e.target.value, 10);
      if (!isNaN(val)) {
        const clamped = Math.max(1, Math.min(val, product.stock));
        setQuantity(clamped);
      }
    },
    [product.stock],
  );

  // Cart actions
  const handleAddToCart = useCallback(async () => {
    if (addingToCart) return;
    setAddingToCart(true);
    try {
      cartStore.addItem({
        productId: product.id,
        name: product.name,
        price: Number(product.price),
        coverImage: product.coverImage,
        quantity,
        stock: product.stock,
      });
      await addToCart(product.id, quantity);
      showToast('已添加到购物车');
    } catch {
      showToast('已添加到购物车 (本地)');
    } finally {
      setAddingToCart(false);
    }
  }, [product, quantity, addingToCart, cartStore]);

  const handleBuyNow = useCallback(async () => {
    if (addingToCart) return;
    setAddingToCart(true);
    try {
      cartStore.addItem({
        productId: product.id,
        name: product.name,
        price: Number(product.price),
        coverImage: product.coverImage,
        quantity,
        stock: product.stock,
      });
      await addToCart(product.id, quantity);
    } catch {
      // Cart store already updated locally
    } finally {
      setAddingToCart(false);
      router.push('/checkout');
    }
  }, [product, quantity, addingToCart, cartStore, router]);

  /* ---- Derived Data ---- */
  const attributes = product.attributes ?? {};
  const attributeEntries = Object.entries(attributes).filter(
    ([, v]) => v != null && v !== '',
  );

  const isSoldOut = product.status === 'SOLD_OUT';
  const isLowStock = product.stock > 0 && product.stock < 5;
  const canAct = !isSoldOut && product.stock > 0;

  const priceNum = Number(product.price);
  const originalPriceNum = product.originalPrice
    ? Number(product.originalPrice)
    : null;
  const showOriginalPrice =
    originalPriceNum != null && originalPriceNum > priceNum;

  const reviewCount = product.reviewSummary?.count ?? 0;
  const reviewAvg = product.reviewSummary?.average ?? 0;
  const distribution = product.reviewSummary?.distribution ?? {};
  const maxDistribution = Math.max(...Object.values(distribution), 1);

  return (
    <div className={styles.container}>
      <script dangerouslySetInnerHTML={{ __html: TAB_SWITCH_SCRIPT }} />

      {/* ---- Top Two-Column Section ---- */}
      <div className={styles.topSection}>

        {/* ====== Left: Gallery ====== */}
        <div className={styles.gallery}>
          <div className={styles.mainImageWrapper}>
            {isSoldOut && (
              <div className={styles.soldOutOverlay}>
                <span className={styles.soldOutLabel}>已售罄</span>
              </div>
            )}
            {currentImage ? (
              <Image
                src={currentImage.url}
                alt={product.name}
                fill
                className={`${styles.mainImage} ${isTransitioning ? styles.mainImageTransitioning : ''}`}
                sizes="(max-width: 1023px) 100vw, 58vw"
                priority
              />
            ) : (
              <div className={styles.mainImagePlaceholder}>
                {product.name.charAt(0)}
              </div>
            )}
          </div>

          {images.length > 1 && (
            <div className={styles.thumbnails}>
              {images.map((img, idx) => (
                <button
                  key={img.id}
                  type="button"
                  className={`${styles.thumbnail} ${idx === selectedImageIdx ? styles.thumbnailActive : ''}`}
                  onClick={() => handleThumbnailClick(idx)}
                  aria-label={`查看图片 ${idx + 1}`}
                >
                  <Image
                    src={img.url}
                    alt={`${product.name} - 图片 ${idx + 1}`}
                    width={80}
                    height={80}
                    className={styles.thumbnailImage}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ====== Right: Product Info ====== */}
        <div className={styles.productInfo}>
          <h1 className={styles.productName}>{product.name}</h1>

          {product.isGuangxi && (
            <div className={styles.guangxiBadge}>
              <span className={styles.guangxiBadgeIcon}>{'✦'}</span>
              广西非遗
            </div>
          )}

          {/* Price */}
          <div className={styles.priceArea}>
            <span className={styles.currentPrice}>
              <span className={styles.currentPriceSymbol}>{'¥'}</span>
              {priceNum.toFixed(2)}
            </span>
            {showOriginalPrice && (
              <span className={styles.originalPrice}>
                {'¥'}{originalPriceNum!.toFixed(2)}
              </span>
            )}
          </div>

          {/* Rating & Sales */}
          <div className={styles.ratingRow}>
            {reviewAvg > 0 && (
              <div className={styles.ratingGroup}>
                {renderStars(reviewAvg)}
                <span className={styles.ratingValue}>
                  {reviewAvg.toFixed(1)}
                </span>
                <span className={styles.ratingCount}>
                  ({reviewCount}条评价)
                </span>
              </div>
            )}
            <span className={styles.salesCount}>
              已售 {product.sales} 件
            </span>
          </div>

          {/* Attributes */}
          {attributeEntries.length > 0 && (
            <div className={styles.attributesSection}>
              <div className={styles.attributesGrid}>
                {attributeEntries.map(([key, value]) => (
                  <div key={key} className={styles.attributeItem}>
                    <span className={styles.attributeKey}>{key}</span>
                    <span className={styles.attributeValue}>
                      {typeof value === 'object'
                        ? JSON.stringify(value)
                        : String(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {product.tags.length > 0 && (
            <div className={styles.tagsRow}>
              {product.tags.map((tag) => (
                <span key={tag} className={styles.tag}>{tag}</span>
              ))}
            </div>
          )}

          {/* Quantity */}
          {canAct && (
            <div className={styles.quantitySection}>
              <div className={styles.quantityLabel}>数量</div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div className={styles.quantitySelector}>
                  <button
                    type="button"
                    className={styles.quantityButton}
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1}
                    aria-label="减少数量"
                  >
                    {'−'}
                  </button>
                  <input
                    type="number"
                    className={styles.quantityInput}
                    value={quantity}
                    min={1}
                    max={product.stock}
                    onChange={handleQuantityInputChange}
                    aria-label="商品数量"
                  />
                  <button
                    type="button"
                    className={styles.quantityButton}
                    onClick={() => handleQuantityChange(quantity + 1)}
                    disabled={quantity >= product.stock}
                    aria-label="增加数量"
                  >
                    +
                  </button>
                </div>
                <span
                  className={`${styles.stockInfo} ${isLowStock ? styles.stockLow : ''}`}
                >
                  {isLowStock
                    ? `库存不足 (${product.stock})`
                    : `库存: ${product.stock}`}
                </span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className={styles.actions}>
            {canAct && (
              <>
                <button
                  type="button"
                  className={styles.addToCartButton}
                  onClick={handleAddToCart}
                  disabled={addingToCart}
                >
                  {addingToCart ? '添加中...' : '加入购物车'}
                </button>
                <button
                  type="button"
                  className={styles.buyNowButton}
                  onClick={handleBuyNow}
                  disabled={addingToCart}
                >
                  立即购买
                </button>
              </>
            )}
            {isSoldOut && (
              <button
                type="button"
                className={styles.addToCartButton}
                disabled
                style={{ flex: 1 }}
              >
                已售罄
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ---- Detail Tabs ---- */}
      <section className={styles.tabsSection}>
        <div className={styles.tabsHeader} role="tablist">
          <button
            type="button"
            className={`${styles.tabButton} ${styles.tabActive}`}
            data-tab="detail"
            role="tab"
            aria-selected="true"
          >
            商品详情
          </button>
          <button
            type="button"
            className={styles.tabButton}
            data-tab="reviews"
            role="tab"
            aria-selected="false"
          >
            商品评价 ({reviewCount})
          </button>
          <div className={styles.tabIndicator} data-tab-indicator />
        </div>

        <div className={styles.tabContent}>
          {/* Tab 1: Description */}
          <div
            className={`${styles.tabPanel} ${styles.tabPanelActive}`}
            data-tab-panel="detail"
            role="tabpanel"
          >
            {product.description ? (
              isHtmlContent(product.description) ? (
                <div
                  className={styles.descriptionContent}
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              ) : (
                <p className={styles.descriptionContent}>
                  {product.description}
                </p>
              )
            ) : (
              <div className={styles.descriptionEmpty}>暂无商品详情</div>
            )}
          </div>

          {/* Tab 2: Reviews */}
          <div
            className={styles.tabPanel}
            data-tab-panel="reviews"
            role="tabpanel"
          >
            {reviewCount > 0 ? (
              <>
                {/* Review Summary */}
                <div className={styles.reviewSummary}>
                  <div className={styles.reviewAverage}>
                    <span className={styles.averageScore}>
                      {reviewAvg.toFixed(1)}
                    </span>
                    <div className={styles.averageStars}>
                      {renderStars(reviewAvg)}
                    </div>
                    <span className={styles.averageCount}>
                      {reviewCount} 条评价
                    </span>
                  </div>
                  <div className={styles.distribution}>
                    {[5, 4, 3, 2, 1].map((star) => {
                      const count = distribution[star] || 0;
                      const pct =
                        maxDistribution > 0
                          ? (count / maxDistribution) * 100
                          : 0;
                      return (
                        <div key={star} className={styles.distributionRow}>
                          <span className={styles.distributionLabel}>
                            {star}{' '}
                            <span
                              style={{
                                color: 'var(--lc-gold)',
                                fontSize: '0.7rem',
                              }}
                            >
                              {'★'}
                            </span>
                          </span>
                          <div className={styles.distributionBar}>
                            <div
                              className={styles.distributionFill}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className={styles.distributionCount}>
                            {count}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Review List */}
                <div className={styles.reviewList}>
                  {product.reviews.map((review) => (
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
                            <div className={styles.reviewUserName}>
                              {review.user.nickname}
                            </div>
                            <div className={styles.reviewDate}>
                              {formatDate(review.createdAt)}
                            </div>
                          </div>
                        </div>
                        <div className={styles.reviewStars}>
                          {renderStars(review.rating)}
                        </div>
                      </div>
                      {review.content && (
                        <p className={styles.reviewContent}>
                          {review.content}
                        </p>
                      )}
                      {review.images && review.images.length > 0 && (
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
              </>
            ) : (
              <div className={styles.reviewsEmpty}>暂无评价</div>
            )}
          </div>
        </div>
      </section>

      {/* ---- Related Products Placeholder ---- */}
      <section className={styles.relatedSection}>
        <div className={styles.relatedHeader}>
          <span className={styles.relatedAccent} />
          <h2 className={styles.relatedTitle}>相关商品</h2>
        </div>
        <div className={styles.relatedPlaceholder}>
          相关商品推荐即将上线
        </div>
      </section>

      {/* ---- Toast ---- */}
      <ToastContainer />
    </div>
  );
}

/* ============================================
   Toast Container
   ============================================ */

function ToastContainer() {
  const [message, setMessage] = useState('');
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    function handleToast(e: Event) {
      const detail = (e as CustomEvent).detail;
      if (detail?.message) {
        setMessage(detail.message);
        setVisible(true);
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setVisible(false), 2200);
      }
    }
    window.addEventListener('lc:toast', handleToast);
    return () => {
      window.removeEventListener('lc:toast', handleToast);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div
      className={`${styles.toast} ${visible ? styles.toastVisible : ''}`}
      role="status"
      aria-live="polite"
    >
      {message}
    </div>
  );
}

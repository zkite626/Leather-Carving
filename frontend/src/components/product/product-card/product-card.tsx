'use client';

import React from 'react';
import Link from 'next/link';
import type { IProduct } from '@/shared/types/product';
import styles from './product-card.module.css';

interface ProductCardProps {
  product: IProduct;
  onAddToCart?: (product: IProduct) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const coverUrl = product.coverImage || product.images?.[0]?.url || '/images/placeholders/product-placeholder.png';

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToCart?.(product);
  };

  return (
    <Link href={`/shop/${product.slug}`} className={`${styles.card} ${product.isGuangxi ? styles.guangxi : ''}`}>
      <div className={styles.coverWrapper}>
        <img src={coverUrl} alt={product.name} className={styles.cover} />
        {product.isGuangxi && (
          <span className={styles.guangxiBadge}>广西非遗</span>
        )}
        {product.status === 'SOLD_OUT' && (
          <span className={styles.soldOutBadge}>已售罄</span>
        )}
      </div>

      <div className={styles.info}>
        <h3 className={styles.title}>{product.name}</h3>

        <div className={styles.meta}>
          <div className={styles.price}>
            <span className={styles.currentPrice}>
              ¥{Number(product.price).toFixed(2)}
            </span>
            {product.originalPrice && Number(product.originalPrice) > Number(product.price) && (
              <span className={styles.originalPrice}>
                ¥{Number(product.originalPrice).toFixed(2)}
              </span>
            )}
          </div>

          <div className={styles.stats}>
            {Number(product.rating) > 0 && (
              <span className={styles.rating}>
                ★ {Number(product.rating).toFixed(1)}
              </span>
            )}
            <span className={styles.sales}>{product.sales} 已售</span>
          </div>
        </div>

        {onAddToCart && product.status !== 'SOLD_OUT' && (
          <button
            type="button"
            className={styles.addButton}
            onClick={handleAddToCart}
            aria-label={`加入购物车 ${product.name}`}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M2 2H3.5L5 11H12L14 4H4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="6" cy="13.5" r="1" fill="currentColor" />
              <circle cx="11" cy="13.5" r="1" fill="currentColor" />
            </svg>
            加入购物车
          </button>
        )}
      </div>
    </Link>
  );
}

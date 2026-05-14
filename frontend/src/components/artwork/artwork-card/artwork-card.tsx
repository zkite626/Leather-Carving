'use client';

import React from 'react';
import Link from 'next/link';
import type { IArtwork } from '@/shared/types/community';
import styles from './artwork-card.module.css';

interface ArtworkCardProps {
  artwork: IArtwork;
}

export function ArtworkCard({ artwork }: ArtworkCardProps) {
  const coverUrl =
    artwork.coverImage ||
    (artwork.images?.[0]?.url) ||
    '/images/placeholders/artwork-placeholder.png';

  return (
    <Link href={`/gallery/${artwork.id}`} className={styles.card}>
      <div className={styles.imageWrapper}>
        <img src={coverUrl} alt={artwork.title} className={styles.image} loading="lazy" />
        <div className={styles.overlay}>
          <div className={styles.overlayContent}>
            <h3 className={styles.title}>{artwork.title}</h3>
            <div className={styles.author}>
              {artwork.user?.avatar ? (
                <img src={artwork.user.avatar} alt="" className={styles.avatar} />
              ) : (
                <div className={styles.avatarPlaceholder}>
                  {artwork.user?.nickname?.[0] ?? '?'}
                </div>
              )}
              <span className={styles.authorName}>{artwork.user?.nickname}</span>
            </div>
            <div className={styles.stats}>
              <span className={styles.likeCount}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
                {artwork.likeCount}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

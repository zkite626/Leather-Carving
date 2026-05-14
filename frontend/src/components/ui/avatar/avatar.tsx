'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import styles from './avatar.module.css';

type AvatarSize = 'sm' | 'md' | 'lg';

interface AvatarProps {
  src?: string;
  alt?: string;
  size?: AvatarSize;
  fallback?: string;
  className?: string;
}

export function Avatar({
  src,
  alt = '',
  size = 'md',
  fallback,
  className = '',
}: AvatarProps) {
  const [imgError, setImgError] = useState(false);
  const showImage = src && !imgError;

  const classNames = [
    styles.avatar,
    styles[`size-${size}`],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classNames} style={{ position: 'relative' }}>
      {showImage ? (
        <Image
          src={src}
          alt={alt}
          className={styles.image}
          fill
          unoptimized
          onError={() => setImgError(true)}
        />
      ) : (
        <span className={styles.fallback} aria-label={alt || fallback}>
          {fallback || alt?.charAt(0)?.toUpperCase() || '?'}
        </span>
      )}
    </div>
  );
}

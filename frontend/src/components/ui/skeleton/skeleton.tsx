'use client';

import React from 'react';
import styles from './skeleton.module.css';

type SkeletonVariant = 'text' | 'circular' | 'rectangular';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  variant?: SkeletonVariant;
  className?: string;
}

export function Skeleton({
  width,
  height,
  variant = 'text',
  className = '',
}: SkeletonProps) {
  const style: React.CSSProperties = {};
  if (width !== undefined) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height !== undefined) style.height = typeof height === 'number' ? `${height}px` : height;

  const classNames = [
    styles.skeleton,
    styles[`variant-${variant}`],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return <div className={classNames} style={style} aria-hidden="true" />;
}

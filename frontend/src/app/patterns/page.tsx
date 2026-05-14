'use client';

import React from 'react';
import { PatternGallery } from '@/components/pattern/pattern-gallery/pattern-gallery';
import styles from './page.module.css';

export default function PatternsPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.heading}>纹样素材库</h1>
        <p className={styles.subtitle}>
          探索壮锦、瑶族、喀斯特等地域特色的皮雕纹样，一键下载创作灵感
        </p>
      </header>
      <PatternGallery />
    </div>
  );
}

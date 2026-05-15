'use client';

import React from 'react';
import { PatternGallery } from '@/components/pattern/pattern-gallery/pattern-gallery';
import styles from './page.module.css';

export default function PatternsPage() {
  return (
    <div className={styles.page}>
      {/* Hero Header */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <h1 className={styles.heroTitle}>纹样素材库</h1>
          <p className={styles.heroSubtitle}>
            探索壮锦、瑶族、喀斯特等地域特色的皮雕纹样，一键下载创作灵感
          </p>
        </div>
      </section>

      {/* Content */}
      <div className={styles.container}>
        <PatternGallery compact />
      </div>
    </div>
  );
}

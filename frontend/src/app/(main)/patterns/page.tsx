'use client';

import React from 'react';
import { PatternGallery } from '@/components/pattern/pattern-gallery/pattern-gallery';
import { PageHero } from '@/components/ui/page-hero/page-hero';
import styles from './page.module.css';

export default function PatternsPage() {
  return (
    <div className={styles.page}>
      <PageHero title="纹样素材库" subtitle="探索壮锦、瑶族、喀斯特等地域特色的皮雕纹样，一键下载创作灵感" />

      {/* Content */}
      <div className={styles.container}>
        <PatternGallery compact />
      </div>
    </div>
  );
}

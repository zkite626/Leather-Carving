'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import styles from '../page.module.css';

export function HeroContent() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Trigger entrance animation on mount (small delay for polish)
    const timer = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(timer);
  }, []);

  return (
    <div className={styles.heroContent} ref={ref} data-visible={visible}>
      <div className="container">
        <p className={styles.heroPretitle}>非物质文化遗产 &middot; 皮雕技艺传承</p>
        <h1 className={styles.heroTitle}>艺育皮韵</h1>
        <p className={styles.heroSubtitle}>
          以数字化手段传承千年皮雕技艺，让传统工艺在指尖焕发新生
        </p>
        <div className={styles.heroCtas}>
          <Link href="/courses" className={styles.heroCtaPrimary}>
            开始学习
          </Link>
          <Link href="/gallery" className={styles.heroCtaSecondary}>
            浏览作品
          </Link>
        </div>
      </div>
    </div>
  );
}

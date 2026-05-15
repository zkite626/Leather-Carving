'use client';

import { useState, useEffect, useRef } from 'react';
import type { IBanner } from '@/lib/banner-api';
import styles from './banner-carousel.module.css';

interface Props {
  banners: IBanner[];
}

export function BannerCarousel({ banners }: Props) {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 自动轮播
  useEffect(() => {
    if (banners.length <= 1) return;
    timerRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [banners.length]);

  // 没有 banner 时显示静态 hero
  if (banners.length === 0) {
    return (
      <section className={styles.hero}>
        <div className={styles.heroBg} />
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <p className={styles.heroPre}>Welcome to</p>
          <h1 className={styles.heroTitle}>艺育皮韵</h1>
          <p className={styles.heroSub}>非遗皮雕传承与创新教育平台</p>
        </div>
      </section>
    );
  }

  return (
    <section
      className={styles.carousel}
      onMouseEnter={() => { if (timerRef.current) clearInterval(timerRef.current); }}
      onMouseLeave={() => {
        if (banners.length > 1) {
          timerRef.current = setInterval(() => setCurrent((p) => (p + 1) % banners.length), 5000);
        }
      }}
    >
      {banners.map((b, idx) => (
        <div
          key={b.id}
          className={idx === current ? styles.slideActive : styles.slide}
        >
          {b.link ? (
            <a href={b.link} className={styles.slideLink}>
              <img src={b.image} alt={b.title} className={styles.slideImg} />
            </a>
          ) : (
            <img src={b.image} alt={b.title} className={styles.slideImg} />
          )}
          <div className={styles.slideOverlay} />
          {b.title && (
            <div className={styles.slideTitle}>{b.title}</div>
          )}
        </div>
      ))}

      {banners.length > 1 && (
        <>
          <button className={`${styles.arrow} ${styles.arrowL}`} onClick={() => setCurrent((p) => (p - 1 + banners.length) % banners.length)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <button className={`${styles.arrow} ${styles.arrowR}`} onClick={() => setCurrent((p) => (p + 1) % banners.length)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <div className={styles.dots}>
            {banners.map((_, i) => (
              <button key={i} className={i === current ? styles.dotOn : styles.dot} onClick={() => setCurrent(i)} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

'use client';

import { useEffect, useRef, useState } from 'react';
import styles from '../page.module.css';

interface StatItem {
  value: number;
  label: string;
  suffix?: string;
}

interface AnimatedStatsProps {
  stats: StatItem[];
}

function useCountUp(end: number, duration: number, shouldStart: boolean): number {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!shouldStart) return;

    let startTime: number | null = null;
    let rafId: number;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutQuart for smooth deceleration
      const eased = 1 - Math.pow(1 - progress, 4);
      setCount(Math.round(eased * end));

      if (progress < 1) {
        rafId = requestAnimationFrame(step);
      }
    };

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [end, duration, shouldStart]);

  return count;
}

function formatNumber(num: number): string {
  if (num >= 10000) {
    return (num / 10000).toFixed(1).replace(/\.0$/, '') + '万';
  }
  return num.toLocaleString('zh-CN');
}

function StatCard({ stat, isVisible }: { stat: StatItem; isVisible: boolean }) {
  const count = useCountUp(stat.value, 2000, isVisible);

  return (
    <div className={styles.statCard}>
      <span className={styles.statValue}>
        {formatNumber(count)}
        {stat.suffix && <span className={styles.statSuffix}>{stat.suffix}</span>}
      </span>
      <span className={styles.statLabel}>{stat.label}</span>
    </div>
  );
}

export function AnimatedStats({ stats }: AnimatedStatsProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section className={styles.statsSection} aria-label="平台数据" ref={ref}>
      <div className="container">
        <div className={styles.statsGrid}>
          {stats.map((stat) => (
            <StatCard key={stat.label} stat={stat} isVisible={isVisible} />
          ))}
        </div>
      </div>
    </section>
  );
}

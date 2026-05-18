'use client';

import type { ReactNode } from 'react';
import styles from './page-hero.module.css';

interface PageHeroProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  align?: 'center' | 'left';
}

export function PageHero({ title, subtitle, actions, align = 'center' }: PageHeroProps) {
  return (
    <section className={styles.hero} data-align={align}>
      <div className={styles.inner}>
        <h1 className={styles.title}>{title}</h1>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        {actions && <div className={styles.actions}>{actions}</div>}
      </div>
    </section>
  );
}

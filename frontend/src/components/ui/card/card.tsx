'use client';

import React from 'react';
import styles from './card.module.css';

type CardVariant = 'default' | 'outlined' | 'elevated';
type CardPadding = 'none' | 'sm' | 'md' | 'lg';

interface CardProps {
  variant?: CardVariant;
  padding?: CardPadding;
  hoverable?: boolean;
  leatherTexture?: boolean;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  children?: React.ReactNode;
  className?: string;
}

export function Card({
  variant = 'default',
  padding = 'md',
  hoverable = false,
  leatherTexture = false,
  onClick,
  children,
  className = '',
}: CardProps) {
  const classNames = [
    styles.card,
    styles[`variant-${variant}`],
    styles[`padding-${padding}`],
    hoverable ? styles.hoverable : '',
    leatherTexture ? styles.leatherTexture : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={classNames}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick(e as unknown as React.MouseEvent<HTMLDivElement>);
              }
            }
          : undefined
      }
    >
      {children}
    </div>
  );
}

'use client';

import React from 'react';
import styles from './tag.module.css';

type TagVariant = 'default' | 'primary' | 'success' | 'warning' | 'error';

interface TagProps {
  children: React.ReactNode;
  variant?: TagVariant;
  closable?: boolean;
  onClose?: () => void;
  className?: string;
}

export function Tag({
  children,
  variant = 'default',
  closable = false,
  onClose,
  className = '',
}: TagProps) {
  const classNames = [
    styles.tag,
    styles[`variant-${variant}`],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={classNames}>
      <span className={styles.label}>{children}</span>
      {closable && (
        <button
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Remove tag"
          type="button"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M9 3L3 9M3 3L9 9"
              stroke="currentColor"
              strokeWidth="1.25"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}
    </span>
  );
}

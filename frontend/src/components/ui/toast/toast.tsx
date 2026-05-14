'use client';

import React, { useEffect, useState, useCallback } from 'react';
import styles from './toast.module.css';

type ToastType = 'success' | 'error' | 'warning' | 'info';
type ToastPosition = 'top-right' | 'top-center' | 'bottom-right';

interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  description?: string;
  duration: number;
  position: ToastPosition;
}

interface ToastProps extends ToastItem {
  onDismiss: (id: string) => void;
}

export function Toast({
  id,
  type,
  title,
  description,
  duration,
  onDismiss,
}: ToastProps) {
  const [exiting, setExiting] = useState(false);

  const handleDismiss = useCallback(() => {
    setExiting(true);
    setTimeout(() => onDismiss(id), 300);
  }, [id, onDismiss]);

  useEffect(() => {
    const timer = setTimeout(handleDismiss, duration);
    return () => clearTimeout(timer);
  }, [duration, handleDismiss]);

  const typeIcons: Record<ToastType, React.ReactNode> = {
    success: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M3.75 9.75L7.5 13.5L14.25 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    error: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M13.5 4.5L4.5 13.5M4.5 4.5L13.5 13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    warning: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M9 6V9.75M9 12.75H9.0075M2.6475 13.5H15.3525C16.26 13.5 16.83 12.525 16.3875 11.7L10.5375 1.875C10.095 1.05 9.0075 1.05 8.5575 1.875L2.6925 11.7C2.25 12.525 2.82 13.5 3.7275 13.5H2.6475Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    info: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M9 12V9M9 6H9.0075M15.75 9C15.75 12.7275 12.7275 15.75 9 15.75C5.2725 15.75 2.25 12.7275 2.25 9C2.25 5.2725 5.2725 2.25 9 2.25C12.7275 2.25 15.75 5.2725 15.75 9Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  };

  const classNames = [
    styles.toast,
    styles[`type-${type}`],
    exiting ? styles.exiting : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classNames} role="alert" aria-live="polite">
      <div className={styles.icon}>{typeIcons[type]}</div>
      <div className={styles.content}>
        {title && <p className={styles.title}>{title}</p>}
        {description && <p className={styles.description}>{description}</p>}
      </div>
      <button
        className={styles.dismiss}
        onClick={handleDismiss}
        aria-label="Dismiss notification"
        type="button"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M10.5 3.5L3.5 10.5M3.5 3.5L10.5 10.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </div>
  );
}

export type { ToastItem, ToastType, ToastPosition };

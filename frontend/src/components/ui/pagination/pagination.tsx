'use client';

import React from 'react';
import styles from './pagination.module.css';

interface PaginationProps {
  current: number;
  total: number;
  pageSize: number;
  onChange: (page: number) => void;
  className?: string;
}

function getPageNumbers(current: number, totalPages: number): (number | '...')[] {
  const pages: (number | '...')[] = [];

  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  pages.push(1);

  if (current > 3) {
    pages.push('...');
  }

  const start = Math.max(2, current - 1);
  const end = Math.min(totalPages - 1, current + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (current < totalPages - 2) {
    pages.push('...');
  }

  pages.push(totalPages);

  return pages;
}

export function Pagination({
  current,
  total,
  pageSize,
  onChange,
  className = '',
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const pages = getPageNumbers(current, totalPages);

  const classNames = [styles.pagination, className].filter(Boolean).join(' ');

  return (
    <nav className={classNames} aria-label="Pagination">
      <button
        className={styles.prev}
        disabled={current <= 1}
        onClick={() => onChange(current - 1)}
        aria-label="Previous page"
        type="button"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {pages.map((page, index) =>
        page === '...' ? (
          <span key={`ellipsis-${index}`} className={styles.ellipsis}>
            ...
          </span>
        ) : (
          <button
            key={page}
            className={`${styles.pageButton} ${page === current ? styles.active : ''}`}
            onClick={() => onChange(page)}
            aria-current={page === current ? 'page' : undefined}
            aria-label={`Page ${page}`}
            type="button"
          >
            {page}
          </button>
        ),
      )}

      <button
        className={styles.next}
        disabled={current >= totalPages}
        onClick={() => onChange(current + 1)}
        aria-label="Next page"
        type="button"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </nav>
  );
}

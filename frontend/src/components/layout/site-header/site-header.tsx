import React from 'react';
import Link from 'next/link';
import styles from './site-header.module.css';

const NAV_ITEMS = [
  { label: '首页', href: '/' },
  { label: '课程', href: '/courses' },
  { label: '画廊', href: '/gallery' },
  { label: '纹样库', href: '/patterns' },
  { label: '商城', href: '/shop' },
  { label: '社区', href: '/community' },
];

export function SiteHeader() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        {/* Logo */}
        <Link href="/" className={styles.logo} aria-label="艺育皮韵 Home">
          <span className={styles.logoIcon}>
            <svg
              width="28"
              height="28"
              viewBox="0 0 28 28"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                x="2"
                y="2"
                width="24"
                height="24"
                rx="6"
                fill="var(--lc-primary)"
              />
              <path
                d="M8 14C8 10.686 10.686 8 14 8C17.314 8 20 10.686 20 14"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M11 14L13 18L17 11"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span className={styles.logoText}>艺育皮韵</span>
        </Link>

        {/* Main Navigation */}
        <nav className={styles.nav} aria-label="Main navigation">
          {NAV_ITEMS.map((item) => (
            <Link key={item.href} href={item.href} className={styles.navLink}>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Search */}
        <div className={styles.search}>
          <svg
            className={styles.searchIcon}
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M11.25 11.25L14 14M6.5 12C3.46243 12 1 9.53757 1 6.5C1 3.46243 3.46243 1 6.5 1C9.53757 1 12 3.46243 12 6.5C12 9.53757 9.53757 12 6.5 12Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <input
            type="search"
            placeholder="搜索课程、作品..."
            className={styles.searchInput}
            aria-label="Search"
          />
        </div>

        {/* User Menu Placeholder */}
        <div className={styles.userMenu}>
          <button className={styles.userButton} aria-label="User menu" type="button">
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M16.667 17.5C16.667 15.731 15.236 14.25 13.333 14.25H6.667C4.764 14.25 3.333 15.731 3.333 17.5M13.333 7.5C13.333 9.625 11.627 11.25 10 11.25C8.373 11.25 6.667 9.625 6.667 7.5C6.667 5.375 8.373 3.75 10 3.75C11.627 3.75 13.333 5.375 13.333 7.5Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}

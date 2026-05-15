'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NotificationBell } from '@/components/notification/notification-bell';
import { UserMenu } from '@/components/layout/user-menu/user-menu';
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
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpen]);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        {/* Logo */}
        <Link href="/" className={styles.logo} aria-label="艺育皮韵 Home">
          <span className={styles.logoIcon}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect x="2" y="2" width="24" height="24" rx="6" fill="var(--lc-primary)" />
              <path d="M8 14C8 10.686 10.686 8 14 8C17.314 8 20 10.686 20 14" stroke="white" strokeWidth="2" strokeLinecap="round" />
              <path d="M11 14L13 18L17 11" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span className={styles.logoText}>艺育皮韵</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className={styles.nav} aria-label="Main navigation">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navLink} ${isActive(item.href) ? styles.navLinkActive : ''}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Search */}
        <div className={styles.search}>
          <svg className={styles.searchIcon} width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M11.25 11.25L14 14M6.5 12C3.46243 12 1 9.53757 1 6.5C1 3.46243 3.46243 1 6.5 1C9.53757 1 12 3.46243 12 6.5C12 9.53757 9.53757 12 6.5 12Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <input type="search" placeholder="搜索课程、作品..." className={styles.searchInput} aria-label="Search" />
        </div>

        {/* User Menu + Mobile Hamburger */}
        <div className={styles.userMenu}>
          <NotificationBell />
          <UserMenu />
          <button
            type="button"
            className={styles.hamburger}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="菜单"
            aria-expanded={menuOpen}
          >
            <span className={`${styles.hamburgerLine} ${menuOpen ? styles.hamburgerLine1Open : ''}`} />
            <span className={`${styles.hamburgerLine} ${menuOpen ? styles.hamburgerLine2Open : ''}`} />
            <span className={`${styles.hamburgerLine} ${menuOpen ? styles.hamburgerLine3Open : ''}`} />
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {menuOpen && (
        <div className={styles.mobileMenu} ref={menuRef}>
          <nav className={styles.mobileNav}>
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.mobileNavLink} ${isActive(item.href) ? styles.mobileNavLinkActive : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}

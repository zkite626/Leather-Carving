'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/auth-context';
import styles from './user-menu.module.css';

export function UserMenu() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  // Don't render anything while loading
  if (isLoading) return null;

  // Not logged in: show login/register buttons
  if (!isAuthenticated) {
    return (
      <div className={styles.guestButtons}>
        <Link href="/login" className={styles.loginBtn}>
          登录
        </Link>
        <Link href="/register" className={styles.registerBtn}>
          注册
        </Link>
      </div>
    );
  }

  // Logged in: show avatar with dropdown
  return (
    <div className={styles.wrapper} ref={ref}>
      <button
        type="button"
        className={styles.avatarBtn}
        onClick={() => setOpen(!open)}
        aria-label="用户菜单"
        aria-expanded={open}
      >
        {user?.avatar ? (
          <Image
            src={user.avatar}
            alt={user.nickname}
            width={36}
            height={36}
            className={styles.avatarImg}
            unoptimized
          />
        ) : (
          <span className={styles.avatarFallback}>
            {user?.nickname?.[0] || '?'}
          </span>
        )}
      </button>

      {open && (
        <div className={styles.dropdown}>
          <div className={styles.dropdownHeader}>
            <div className={styles.userAvatar}>
              {user?.avatar ? (
                <Image src={user.avatar} alt={user.nickname} width={40} height={40} unoptimized />
              ) : (
                <span>{user?.nickname?.[0] || '?'}</span>
              )}
            </div>
            <div className={styles.userInfo}>
              <span className={styles.userName}>{user?.nickname}</span>
              <span className={styles.userEmail}>{user?.email}</span>
            </div>
          </div>

          <div className={styles.divider} />

          <nav className={styles.menuList}>
            <Link href="/profile" className={styles.menuItem} onClick={() => setOpen(false)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              个人中心
            </Link>
            <Link href="/my-courses" className={styles.menuItem} onClick={() => setOpen(false)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
              我的课程
            </Link>
            <Link href="/my-artworks" className={styles.menuItem} onClick={() => setOpen(false)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              我的作品
            </Link>
            <Link href="/my-orders" className={styles.menuItem} onClick={() => setOpen(false)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              我的订单
            </Link>
            <Link href="/notifications" className={styles.menuItem} onClick={() => setOpen(false)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              通知
            </Link>
            <Link href="/cart" className={styles.menuItem} onClick={() => setOpen(false)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              购物车
            </Link>
          </nav>

          {(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') && (
            <>
              <div className={styles.divider} />
              <nav className={styles.menuList}>
                <Link href="/admin/dashboard" className={styles.menuItem} onClick={() => setOpen(false)}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7" />
                    <rect x="14" y="3" width="7" height="7" />
                    <rect x="14" y="14" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" />
                  </svg>
                  管理后台
                </Link>
              </nav>
            </>
          )}

          <div className={styles.divider} />

          <button
            type="button"
            className={styles.logoutBtn}
            onClick={() => { setOpen(false); logout(); }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            退出登录
          </button>
        </div>
      )}
    </div>
  );
}

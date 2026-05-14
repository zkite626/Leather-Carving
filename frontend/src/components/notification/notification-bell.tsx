'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useNotificationStore } from '@/stores/notification-store';
import { connectSocket, disconnectSocket } from '@/lib/socket';
import { useAuth } from '@/contexts/auth-context';
import type { INotification } from '@/shared/types/community';
import styles from './notification-bell.module.css';

export function NotificationBell() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { unreadCount, notifications, fetchUnreadCount, fetchNotifications, markAsRead, markAllAsRead, addNotification } = useNotificationStore();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch unread count on mount and when auth changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchUnreadCount();
    }
  }, [isAuthenticated, fetchUnreadCount]);

  // WebSocket connection
  useEffect(() => {
    if (!isAuthenticated) return;

    const socket = connectSocket();

    socket.on('notification:new', (notification: INotification) => {
      addNotification(notification);
    });

    return () => {
      disconnectSocket();
    };
  }, [isAuthenticated, addNotification]);

  // Fetch notifications when dropdown opens
  useEffect(() => {
    if (open && isAuthenticated) {
      fetchNotifications(1);
    }
  }, [open, isAuthenticated, fetchNotifications]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  if (!isAuthenticated) return null;

  const handleMarkAllRead = () => {
    markAllAsRead();
  };

  const handleClickNotification = (notification: INotification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    if (notification.link) {
      router.push(notification.link);
    }
    setOpen(false);
  };

  return (
    <div className={styles.wrapper} ref={dropdownRef}>
      <button className={styles.bellBtn} onClick={() => setOpen(!open)} aria-label="通知">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        {unreadCount > 0 && (
          <span className={styles.badge}>{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </button>

      {open && (
        <div className={styles.dropdown}>
          <div className={styles.dropdownHeader}>
            <h3 className={styles.dropdownTitle}>通知</h3>
            {unreadCount > 0 && (
              <button className={styles.markAllBtn} onClick={handleMarkAllRead}>
                全部已读
              </button>
            )}
          </div>

          <div className={styles.list}>
            {notifications.length === 0 && (
              <div className={styles.empty}>暂无通知</div>
            )}
            {notifications.slice(0, 10).map((n) => (
              <div
                key={n.id}
                className={`${styles.item} ${!n.isRead ? styles.itemUnread : ''}`}
                onClick={() => handleClickNotification(n)}
              >
                <div className={styles.itemIcon}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    {n.type === 'community' ? (
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    ) : n.type === 'order' ? (
                      <><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></>
                    ) : (
                      <><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></>
                    )}
                  </svg>
                </div>
                <div className={styles.itemContent}>
                  <p className={styles.itemTitle}>{n.title}</p>
                  <p className={styles.itemText}>{n.content}</p>
                  <p className={styles.itemTime}>{new Date(n.createdAt).toLocaleString('zh-CN')}</p>
                </div>
                {!n.isRead && <span className={styles.unreadDot} />}
              </div>
            ))}
          </div>

          <Link href="/notifications" className={styles.viewAll} onClick={() => setOpen(false)}>
            查看全部通知
          </Link>
        </div>
      )}
    </div>
  );
}

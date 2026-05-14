'use client';

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { Toast } from './toast';
import type { ToastItem, ToastType, ToastPosition } from './toast';
import styles from './toast-provider.module.css';

interface ToastOptions {
  type?: ToastType;
  title?: string;
  description?: string;
  duration?: number;
  position?: ToastPosition;
}

interface ToastContextValue {
  toast: (options: ToastOptions) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  warning: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idCounter = useRef(0);

  const addToast = useCallback((options: ToastOptions) => {
    const id = `toast-${++idCounter.current}`;
    const toast: ToastItem = {
      id,
      type: options.type || 'info',
      title: options.title,
      description: options.description,
      duration: options.duration ?? 3000,
      position: options.position || 'top-right',
    };
    setToasts((prev) => [...prev, toast]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const contextValue: ToastContextValue = {
    toast: addToast,
    success: (title, description) => addToast({ type: 'success', title, description }),
    error: (title, description) => addToast({ type: 'error', title, description }),
    warning: (title, description) => addToast({ type: 'warning', title, description }),
    info: (title, description) => addToast({ type: 'info', title, description }),
  };

  // Group toasts by position
  const grouped = toasts.reduce<Record<ToastPosition, ToastItem[]>>(
    (acc, t) => {
      acc[t.position].push(t);
      return acc;
    },
    {
      'top-right': [],
      'top-center': [],
      'bottom-right': [],
    },
  );

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      {Object.entries(grouped).map(([position, items]) =>
        items.length > 0 ? (
          <div
            key={position}
            className={`${styles.container} ${styles[`pos-${position}`]}`}
            aria-label="Notifications"
          >
            {items.map((item) => (
              <Toast key={item.id} {...item} onDismiss={dismissToast} />
            ))}
          </div>
        ) : null,
      )}
    </ToastContext.Provider>
  );
}

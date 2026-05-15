'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import styles from './register.module.css';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    nickname: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    if (formData.password.length < 8) {
      setError('密码至少 8 位');
      return;
    }

    if (!/[a-z]/.test(formData.password) || !/[A-Z]/.test(formData.password) || !/[0-9]/.test(formData.password)) {
      setError('密码必须包含大小写字母和数字');
      return;
    }

    setIsLoading(true);
    try {
      await register({
        email: formData.email,
        password: formData.password,
        nickname: formData.nickname,
      });
      router.push('/');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || '注册失败，请稍后再试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        {/* Brand Header */}
        <div className={styles.brandHeader}>
          <div className={styles.logoIcon}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect x="2" y="2" width="24" height="24" rx="6" fill="white" />
              <path d="M8 14C8 10.686 10.686 8 14 8C17.314 8 20 10.686 20 14" stroke="var(--lc-primary)" strokeWidth="2" strokeLinecap="round" />
              <path d="M11 14L13 18L17 11" stroke="var(--lc-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className={styles.brandTitle}>艺育皮韵</h1>
          <h2 className={styles.formTitle}>创建账号</h2>
          <p className={styles.formSubtitle}>开启您的皮雕学习之旅</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.errorBanner}>{error}</div>}

          <div className={styles.field}>
            <label htmlFor="nickname" className={styles.label}>
              昵称
            </label>
            <input
              id="nickname"
              type="text"
              value={formData.nickname}
              onChange={(e) => updateField('nickname', e.target.value)}
              placeholder="2-20 个字符"
              className={styles.input}
              required
              minLength={2}
              maxLength={20}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="email" className={styles.label}>
              邮箱
            </label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => updateField('email', e.target.value)}
              placeholder="请输入邮箱地址"
              className={styles.input}
              required
              autoComplete="email"
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="password" className={styles.label}>
              密码
            </label>
            <input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => updateField('password', e.target.value)}
              placeholder="至少 8 位，含大小写字母和数字"
              className={styles.input}
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="confirmPassword" className={styles.label}>
              确认密码
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => updateField('confirmPassword', e.target.value)}
              placeholder="请再次输入密码"
              className={styles.input}
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={isLoading}
          >
            {isLoading ? '注册中...' : '注册'}
          </button>
        </form>

        <p className={styles.footer}>
          已有账号?
          <Link href="/login" className={styles.link}>
            立即登录
          </Link>
        </p>
      </div>
    </div>
  );
}

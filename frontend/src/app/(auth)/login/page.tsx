'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import styles from './login.module.css';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login({ email, password });
      const redirect = searchParams.get('redirect') || '/';
      router.push(redirect);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || '登录失败，请检查邮箱和密码');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.left}>
        <div className={styles.brandPanel}>
          <div className={styles.patternOverlay} />
          <div className={styles.brandContent}>
            <h1 className={styles.brandTitle}>艺育皮韵</h1>
            <p className={styles.brandSubtitle}>非遗皮雕数字教育平台</p>
            <p className={styles.brandDesc}>
              以传统皮雕技艺为核心，融合现代数字科技，打造集教学、创作、展示、交流于一体的综合性平台。
            </p>
          </div>
        </div>
      </div>

      <div className={styles.right}>
        <div className={styles.formWrapper}>
          <div className={styles.formHeader}>
            <h2 className={styles.formTitle}>欢迎回来</h2>
            <p className={styles.formSubtitle}>登录您的账号继续学习</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            {error && <div className={styles.errorBanner}>{error}</div>}

            <div className={styles.field}>
              <label htmlFor="email" className={styles.label}>
                邮箱
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="请输入邮箱地址"
                className={styles.input}
                required
                autoComplete="email"
              />
            </div>

            <div className={styles.field}>
              <div className={styles.labelRow}>
                <label htmlFor="password" className={styles.label}>
                  密码
                </label>
                <Link href="/forgot-password" className={styles.forgotLink}>
                  忘记密码?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入密码"
                className={styles.input}
                required
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              className={styles.submitButton}
              disabled={isLoading}
            >
              {isLoading ? '登录中...' : '登录'}
            </button>
          </form>

          <p className={styles.footer}>
            还没有账号?
            <Link href="/register" className={styles.link}>
              立即注册
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

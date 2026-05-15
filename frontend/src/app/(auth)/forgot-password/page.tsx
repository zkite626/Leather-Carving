'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './forgot-password.module.css';

type Step = 'email' | 'code' | 'reset' | 'done';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 800));
      setStep('code');
    } catch {
      setError('发送验证码失败，请稍后再试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 800));
      setStep('reset');
    } catch {
      setError('验证码错误或已过期');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }
    if (password.length < 8) {
      setError('密码至少 8 位');
      return;
    }

    setIsLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 800));
      setStep('done');
    } catch {
      setError('重置密码失败，请稍后再试');
    } finally {
      setIsLoading(false);
    }
  };

  const steps = [
    { key: 'email', label: '输入邮箱' },
    { key: 'code', label: '验证身份' },
    { key: 'reset', label: '重置密码' },
  ];

  const currentIndex = steps.findIndex((s) => s.key === step);

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
          <h2 className={styles.formTitle}>找回密码</h2>
          <p className={styles.formSubtitle}>
            {step === 'email' && '请输入您注册时使用的邮箱地址'}
            {step === 'code' && '请输入发送到您邮箱的验证码'}
            {step === 'reset' && '请设置新密码'}
            {step === 'done' && '密码重置成功'}
          </p>
        </div>

        {/* Stepper */}
        {step !== 'done' && (
          <div className={styles.stepper}>
            {steps.map((s, i) => (
              <div
                key={s.key}
                className={`${styles.step} ${i <= currentIndex ? styles.stepActive : ''}`}
              >
                <div className={styles.stepNumber}>{i + 1}</div>
                <span className={styles.stepLabel}>{s.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Step: Email */}
        {step === 'email' && (
          <form onSubmit={handleSendCode} className={styles.form}>
            {error && <div className={styles.errorBanner}>{error}</div>}
            <div className={styles.field}>
              <label htmlFor="email" className={styles.label}>邮箱地址</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="请输入注册邮箱"
                className={styles.input}
                required
              />
            </div>
            <button type="submit" className={styles.submitButton} disabled={isLoading}>
              {isLoading ? '发送中...' : '发送验证码'}
            </button>
          </form>
        )}

        {/* Step: Code */}
        {step === 'code' && (
          <form onSubmit={handleVerifyCode} className={styles.form}>
            {error && <div className={styles.errorBanner}>{error}</div>}
            <div className={styles.field}>
              <label htmlFor="code" className={styles.label}>验证码</label>
              <input
                id="code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="请输入 6 位验证码"
                className={styles.input}
                required
                maxLength={6}
              />
              <p className={styles.hint}>验证码已发送至 {email}</p>
            </div>
            <button type="submit" className={styles.submitButton} disabled={isLoading}>
              {isLoading ? '验证中...' : '验证'}
            </button>
          </form>
        )}

        {/* Step: Reset */}
        {step === 'reset' && (
          <form onSubmit={handleResetPassword} className={styles.form}>
            {error && <div className={styles.errorBanner}>{error}</div>}
            <div className={styles.field}>
              <label htmlFor="newPassword" className={styles.label}>新密码</label>
              <input
                id="newPassword"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="至少 8 位，含大小写字母和数字"
                className={styles.input}
                required
                minLength={8}
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="confirmNewPassword" className={styles.label}>确认新密码</label>
              <input
                id="confirmNewPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="请再次输入新密码"
                className={styles.input}
                required
                minLength={8}
              />
            </div>
            <button type="submit" className={styles.submitButton} disabled={isLoading}>
              {isLoading ? '重置中...' : '重置密码'}
            </button>
          </form>
        )}

        {/* Step: Done */}
        {step === 'done' && (
          <div className={styles.doneMessage}>
            <div className={styles.doneIcon}>&#10003;</div>
            <p className={styles.doneText}>密码已成功重置</p>
            <Link href="/login" className={styles.submitButton}>返回登录</Link>
          </div>
        )}

        <p className={styles.footer}>
          <Link href="/login" className={styles.link}>返回登录</Link>
        </p>
      </div>
    </div>
  );
}

'use client';

import React, { useId } from 'react';
import styles from './input.module.css';

interface InputProps {
  label?: string;
  placeholder?: string;
  error?: string;
  hint?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  disabled?: boolean;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  name?: string;
  id?: string;
  className?: string;
  required?: boolean;
}

export function Input({
  label,
  placeholder,
  error,
  hint,
  prefix,
  suffix,
  disabled = false,
  value,
  onChange,
  type = 'text',
  name,
  id,
  className = '',
  required = false,
}: InputProps) {
  const autoId = useId();
  const inputId = id || autoId;
  const errorId = `${inputId}-error`;
  const hintId = `${inputId}-hint`;

  const wrapperClass = [
    styles.wrapper,
    error ? styles.hasError : '',
    disabled ? styles.disabled : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={wrapperClass}>
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}
      <div className={styles.inputWrapper}>
        {prefix && <span className={styles.prefix}>{prefix}</span>}
        <input
          id={inputId}
          type={type}
          name={name}
          placeholder={placeholder}
          disabled={disabled}
          value={value}
          onChange={onChange}
          className={styles.input}
          aria-invalid={!!error}
          aria-describedby={
            [error ? errorId : null, hint ? hintId : null]
              .filter(Boolean)
              .join(' ') || undefined
          }
          required={required}
        />
        {suffix && <span className={styles.suffix}>{suffix}</span>}
      </div>
      {error && (
        <p id={errorId} className={styles.error} role="alert">
          {error}
        </p>
      )}
      {hint && !error && (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      )}
    </div>
  );
}

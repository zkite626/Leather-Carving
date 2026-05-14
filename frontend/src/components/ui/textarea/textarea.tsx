'use client';

import React, { useId } from 'react';
import styles from './textarea.module.css';

interface TextareaProps {
  label?: string;
  placeholder?: string;
  error?: string;
  hint?: string;
  disabled?: boolean;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  name?: string;
  id?: string;
  rows?: number;
  className?: string;
  required?: boolean;
  maxLength?: number;
}

export function Textarea({
  label,
  placeholder,
  error,
  hint,
  disabled = false,
  value,
  onChange,
  name,
  id,
  rows = 4,
  className = '',
  required = false,
  maxLength,
}: TextareaProps) {
  const autoId = useId();
  const textareaId = id || autoId;
  const errorId = `${textareaId}-error`;
  const hintId = `${textareaId}-hint`;

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
        <label htmlFor={textareaId} className={styles.label}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}
      <div className={styles.textareaWrapper}>
        <textarea
          id={textareaId}
          name={name}
          placeholder={placeholder}
          disabled={disabled}
          value={value}
          onChange={onChange}
          rows={rows}
          className={styles.textarea}
          aria-invalid={!!error}
          aria-describedby={
            [error ? errorId : null, hint ? hintId : null]
              .filter(Boolean)
              .join(' ') || undefined
          }
          required={required}
          maxLength={maxLength}
        />
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

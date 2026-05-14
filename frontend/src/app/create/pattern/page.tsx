'use client';

import React, { useState } from 'react';
import { generatePattern } from '@/lib/ai-api';
import { useAuth } from '@/contexts/auth-context';
import styles from './page.module.css';

const STYLES = [
  { value: 'zhuangjin', label: '壮锦风格', desc: '菱形/回字纹/蝴蝶纹等壮族传统纹样', emoji: ' ' },
  { value: 'yaozu', label: '瑶族风格', desc: '盘王纹/太阳纹等瑶族传统图腾', emoji: ' ' },
  { value: 'karst', label: '喀斯特风格', desc: '桂林山水/溶洞/石林等自然元素', emoji: '⛰️' },
  { value: 'modern', label: '现代融合', desc: '传统纹样与当代设计语言结合', emoji: ' ' },
];

const PROMPT_EXAMPLES = [
  '以蝴蝶和花卉为主题的壮锦纹样',
  '盘王节太阳纹与现代几何结合',
  '桂林山水剪影的皮革压花纹样',
  '简约风格的壮族菱形纹样',
  '瑶族银饰元素的皮雕图案',
];

export default function PatternGeneratePage() {
  const { isAuthenticated } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState<string>('');
  const [size, setSize] = useState<'512x512' | '1024x1024'>('1024x1024');
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<{ imageUrl: string; prompt: string; style?: string } | null>(null);
  const [error, setError] = useState('');
  const [history, setHistory] = useState<{ imageUrl: string; prompt: string }[]>([]);

  const handleGenerate = async () => {
    if (!prompt.trim() || generating) return;
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }

    setGenerating(true);
    setError('');
    setResult(null);

    try {
      const res = await generatePattern({
        prompt: prompt.trim(),
        style: style || undefined,
        size,
      });
      if (res.data) {
        setResult(res.data);
        setHistory((prev) => [res.data!, ...prev]);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || '生成失败，请稍后重试');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>AI 纹样生成</h1>
          <p className={styles.subtitle}>描述你想要的纹样，AI 将为你生成独一无二的皮雕图案</p>
        </div>

        <div className={styles.content}>
          {/* Input Section */}
          <div className={styles.inputSection}>
            <div className={styles.field}>
              <label className={styles.label}>描述你想要的纹样</label>
              <textarea
                className={styles.textarea}
                placeholder="例如：以蝴蝶和花卉为主题的壮锦纹样..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
              />
              <div className={styles.examples}>
                {PROMPT_EXAMPLES.map((ex) => (
                  <button key={ex} className={styles.exampleBtn} onClick={() => setPrompt(ex)}>
                    {ex}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>选择风格</label>
              <div className={styles.styleGrid}>
                {STYLES.map((s) => (
                  <button
                    key={s.value}
                    className={`${styles.styleCard} ${style === s.value ? styles.styleCardActive : ''}`}
                    onClick={() => setStyle(style === s.value ? '' : s.value)}
                  >
                    <span className={styles.styleEmoji}>{s.emoji}</span>
                    <span className={styles.styleName}>{s.label}</span>
                    <span className={styles.styleDesc}>{s.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>图片尺寸</label>
              <div className={styles.sizeOptions}>
                <button
                  className={`${styles.sizeBtn} ${size === '512x512' ? styles.sizeBtnActive : ''}`}
                  onClick={() => setSize('512x512')}
                >
                  512 x 512
                </button>
                <button
                  className={`${styles.sizeBtn} ${size === '1024x1024' ? styles.sizeBtnActive : ''}`}
                  onClick={() => setSize('1024x1024')}
                >
                  1024 x 1024
                </button>
              </div>
            </div>

            <button
              className={styles.generateBtn}
              onClick={handleGenerate}
              disabled={!prompt.trim() || generating}
            >
              {generating ? (
                <>
                  <span className={styles.spinner}></span>
                  生成中...
                </>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                  </svg>
                  生成纹样
                </>
              )}
            </button>

            {error && <div className={styles.error}>{error}</div>}
          </div>

          {/* Result Section */}
          <div className={styles.resultSection}>
            {generating && (
              <div className={styles.generating}>
                <div className={styles.skeletonPulse}>
                  <div className={styles.skeletonInner}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.3">
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                    </svg>
                    <p>AI 正在创作中...</p>
                  </div>
                </div>
              </div>
            )}

            {result && !generating && (
              <div className={styles.result}>
                <div className={styles.resultImage}>
                  <img src={result.imageUrl} alt={result.prompt} />
                </div>
                <div className={styles.resultInfo}>
                  <p className={styles.resultPrompt}>{result.prompt}</p>
                  {result.style && <p className={styles.resultStyle}>风格：{STYLES.find(s => s.value === result.style)?.label || result.style}</p>}
                  <div className={styles.resultActions}>
                    <a href={result.imageUrl} download className={styles.downloadBtn}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                      </svg>
                      下载
                    </a>
                  </div>
                </div>
              </div>
            )}

            {!generating && !result && (
              <div className={styles.emptyResult}>
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                </svg>
                <p>输入描述，生成你的专属纹样</p>
              </div>
            )}

            {/* History */}
            {history.length > 1 && (
              <div className={styles.history}>
                <h3 className={styles.historyTitle}>生成历史</h3>
                <div className={styles.historyGrid}>
                  {history.slice(1).map((item, i) => (
                    <div key={i} className={styles.historyItem}>
                      <img src={item.imageUrl} alt={item.prompt} onClick={() => setResult(item)} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

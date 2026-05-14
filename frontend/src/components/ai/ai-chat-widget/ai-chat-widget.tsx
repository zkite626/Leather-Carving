'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { streamChat } from '@/lib/ai-api';
import { useAuth } from '@/contexts/auth-context';
import styles from './ai-chat-widget.module.css';

interface AIChatWidgetProps {
  sessionId?: string;
  context?: string;
  position?: 'inline' | 'floating';
  placeholder?: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function AIChatWidget({
  sessionId,
  context,
  position = 'floating',
  placeholder = '问我关于皮雕的任何问题...',
}: AIChatWidgetProps) {
  const { isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(position === 'inline');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent, scrollToBottom]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isStreaming) return;

    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsStreaming(true);
    setStreamingContent('');

    await streamChat({
      message: text,
      sessionId,
      context,
      onChunk: (chunk) => {
        setStreamingContent((prev) => prev + chunk);
      },
      onDone: () => {
        setMessages((prev) => [
          ...prev,
          {
            id: `assistant-${Date.now()}`,
            role: 'assistant',
            content: streamingContent || '抱歉，我暂时无法回答。',
            timestamp: new Date(),
          },
        ]);
        setStreamingContent('');
        setIsStreaming(false);
      },
      onError: (error) => {
        setMessages((prev) => [
          ...prev,
          {
            id: `error-${Date.now()}`,
            role: 'assistant',
            content: `出错了：${error}`,
            timestamp: new Date(),
          },
        ]);
        setStreamingContent('');
        setIsStreaming(false);
      },
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Floating mode
  if (position === 'floating') {
    return (
      <>
        {/* Bubble */}
        {!isOpen && (
          <button className={styles.bubble} onClick={() => setIsOpen(true)} aria-label="AI 助手">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <span className={styles.bubbleLabel}>AI 助手</span>
          </button>
        )}

        {/* Chat Panel */}
        {isOpen && (
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <div className={styles.panelTitle}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
                AI 皮雕助手
              </div>
              <button className={styles.closeBtn} onClick={() => setIsOpen(false)} aria-label="关闭">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div className={styles.messages}>
              {messages.length === 0 && (
                <div className={styles.welcome}>
                  <p>你好！我是皮雕学习助手。</p>
                  <p>你可以问我关于皮雕技法、材料选择、纹样设计等问题。</p>
                  <div className={styles.quickQuestions}>
                    {['皮雕入门需要什么工具？', '壮锦纹样有什么特点？', '如何选择合适的皮革？'].map((q) => (
                      <button key={q} className={styles.quickBtn} onClick={() => { setInput(q); }}>
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg) => (
                <div key={msg.id} className={`${styles.message} ${msg.role === 'user' ? styles.userMessage : styles.assistantMessage}`}>
                  <div className={styles.messageContent}>
                    {msg.content.split('\n').map((line, i) => (
                      <p key={i}>{line}</p>
                    ))}
                  </div>
                </div>
              ))}

              {isStreaming && streamingContent && (
                <div className={`${styles.message} ${styles.assistantMessage}`}>
                  <div className={styles.messageContent}>
                    {streamingContent}
                    <span className={styles.cursor}>|</span>
                  </div>
                </div>
              )}

              {isStreaming && !streamingContent && (
                <div className={`${styles.message} ${styles.assistantMessage}`}>
                  <div className={styles.typing}>
                    <span></span><span></span><span></span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <div className={styles.inputArea}>
              <textarea
                ref={inputRef}
                className={styles.input}
                placeholder={placeholder}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                disabled={isStreaming}
              />
              <button className={styles.sendBtn} onClick={handleSend} disabled={!input.trim() || isStreaming} aria-label="发送">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Inline mode
  return (
    <div className={styles.inlineContainer}>
      <div className={styles.inlineHeader}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
        </svg>
        AI 助手
      </div>

      <div className={styles.messages}>
        {messages.length === 0 && (
          <div className={styles.welcome}>
            <p>你好！有任何关于当前课程的问题，随时问我。</p>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`${styles.message} ${msg.role === 'user' ? styles.userMessage : styles.assistantMessage}`}>
            <div className={styles.messageContent}>
              {msg.content.split('\n').map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
          </div>
        ))}

        {isStreaming && streamingContent && (
          <div className={`${styles.message} ${styles.assistantMessage}`}>
            <div className={styles.messageContent}>
              {streamingContent}
              <span className={styles.cursor}>|</span>
            </div>
          </div>
        )}

        {isStreaming && !streamingContent && (
          <div className={`${styles.message} ${styles.assistantMessage}`}>
            <div className={styles.typing}>
              <span></span><span></span><span></span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className={styles.inputArea}>
        <textarea
          ref={inputRef}
          className={styles.input}
          placeholder={placeholder}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          disabled={isStreaming}
        />
        <button className={styles.sendBtn} onClick={handleSend} disabled={!input.trim() || isStreaming} aria-label="发送">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

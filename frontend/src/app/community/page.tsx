'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getPosts, getHotTopics } from '@/lib/community-api';
import { toggleFavorite } from '@/lib/favorite-api';
import type { IPost, PostType } from '@/shared/types/community';
import styles from './page.module.css';

const TABS: { key: PostType | 'ALL'; label: string }[] = [
  { key: 'ALL', label: '全部' },
  { key: 'DISCUSSION', label: '讨论' },
  { key: 'SHOWCASE', label: '展示' },
  { key: 'QUESTION', label: '提问' },
  { key: 'TUTORIAL', label: '教程' },
  { key: 'CHALLENGE', label: '挑战' },
];

const POST_TYPE_LABELS: Record<PostType, string> = {
  DISCUSSION: '讨论',
  SHOWCASE: '展示',
  QUESTION: '提问',
  TUTORIAL: '教程',
  CHALLENGE: '挑战',
};

const POST_TYPE_COLORS: Record<PostType, string> = {
  DISCUSSION: '#5B9BD5',
  SHOWCASE: '#7BA05B',
  QUESTION: '#E8A634',
  TUTORIAL: '#C84B31',
  CHALLENGE: '#B5651D',
};

export default function CommunityPage() {
  const [posts, setPosts] = useState<IPost[]>([]);
  const [hotTopics, setHotTopics] = useState<{ id: string; title: string; likeCount: number }[]>([]);
  const [activeTab, setActiveTab] = useState<PostType | 'ALL'>('ALL');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const loaderRef = useRef<HTMLDivElement>(null);

  const fetchPosts = useCallback(async (pageNum: number, append = false) => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page: pageNum, pageSize: 20 };
      if (activeTab !== 'ALL') params.type = activeTab;
      if (keyword) params.keyword = keyword;

      const res = await getPosts(params);
      const items = res.data ?? [];
      setPosts((prev) => (append ? [...prev, ...items] : items));
      setHasMore(pageNum < (res.pagination?.totalPages ?? 1));
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [activeTab, keyword]);

  useEffect(() => {
    setPage(1); // eslint-disable-line react-hooks/set-state-in-effect -- data fetching pattern
    void fetchPosts(1);
  }, [fetchPosts]);

  useEffect(() => {
    void getHotTopics().then((res) => setHotTopics(res.data ?? [])).catch(() => {});
  }, []);

  // Infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          const nextPage = page + 1;
          setPage(nextPage);
          fetchPosts(nextPage, true);
        }
      },
      { threshold: 0.1 },
    );

    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [hasMore, loading, page, fetchPosts]);

  const handleLike = async (e: React.MouseEvent, postId: string) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await toggleFavorite('post', postId);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, likeCount: p.likeCount + (res.data?.favorited ? 1 : -1) }
            : p,
        ),
      );
    } catch {
      // silently fail
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchPosts(1);
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Main Content */}
        <div className={styles.main}>
          {/* Tabs */}
          <div className={styles.tabs}>
            {TABS.map((tab) => (
              <button
                key={tab.key}
                className={`${styles.tab} ${activeTab === tab.key ? styles.tabActive : ''}`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <form className={styles.searchBar} onSubmit={handleSearch}>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="搜索帖子..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
            <button type="submit" className={styles.searchBtn}>搜索</button>
          </form>

          {/* Post List */}
          <div className={styles.postList}>
            {posts.map((post) => (
              <Link key={post.id} href={`/community/${post.id}`} className={styles.postCard}>
                <div className={styles.postHeader}>
                  <div className={styles.postAuthor}>
                    <div className={styles.avatar} style={{ position: 'relative' }}>
                      {post.author.avatar ? (
                        <Image src={post.author.avatar} alt={post.author.nickname} fill unoptimized />
                      ) : (
                        <span>{post.author.nickname?.[0] || '?'}</span>
                      )}
                    </div>
                    <span className={styles.authorName}>{post.author.nickname}</span>
                  </div>
                  <span
                    className={styles.typeBadge}
                    style={{ backgroundColor: POST_TYPE_COLORS[post.type] || '#5B9BD5' }}
                  >
                    {POST_TYPE_LABELS[post.type]}
                  </span>
                </div>

                <h3 className={styles.postTitle}>{post.title}</h3>
                <p className={styles.postExcerpt}>
                  {post.content.replace(/[#*`\[\]]/g, '').slice(0, 120)}...
                </p>

                {post.images && post.images.length > 0 && (
                  <div className={styles.postImages}>
                    {post.images.slice(0, 3).map((img, i) => (
                      <div key={i} className={styles.postImage} style={{ position: 'relative' }}>
                        <Image src={img} alt="" fill unoptimized />
                      </div>
                    ))}
                  </div>
                )}

                {post.tags && post.tags.length > 0 && (
                  <div className={styles.postTags}>
                    {post.tags.slice(0, 4).map((tag) => (
                      <span key={tag} className={styles.tag}>#{tag}</span>
                    ))}
                  </div>
                )}

                <div className={styles.postFooter}>
                  <span className={styles.stat}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    {post.viewCount}
                  </span>
                  <button
                    className={styles.likeBtn}
                    onClick={(e) => handleLike(e, post.id)}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                    {post.likeCount}
                  </button>
                  <span className={styles.stat}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                    {post.commentCount}
                  </span>
                  <span className={styles.time}>
                    {new Date(post.createdAt).toLocaleDateString('zh-CN')}
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {/* Loading / Empty */}
          {loading && <div className={styles.loading}>加载中...</div>}
          {!loading && posts.length === 0 && (
            <div className={styles.empty}>暂无帖子</div>
          )}
          <div ref={loaderRef} className={styles.loadMore} />
        </div>

        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarSection}>
            <h3 className={styles.sidebarTitle}>热门话题</h3>
            <div className={styles.hotList}>
              {hotTopics.map((topic, i) => (
                <Link key={topic.id} href={`/community/${topic.id}`} className={styles.hotItem}>
                  <span className={styles.hotIndex}>{i + 1}</span>
                  <span className={styles.hotTitle}>{topic.title}</span>
                  <span className={styles.hotStat}>{topic.likeCount} 赞</span>
                </Link>
              ))}
              {hotTopics.length === 0 && <div className={styles.emptySmall}>暂无热门话题</div>}
            </div>
          </div>

          <div className={styles.sidebarSection}>
            <h3 className={styles.sidebarTitle}>社区标签</h3>
            <div className={styles.tagCloud}>
              {['壮锦', '瑶族', '皮雕', '非遗', '手工', '教程', '入门', '纹样', '染色', '镂刻'].map((tag) => (
                <Link key={tag} href={`/community?keyword=${tag}`} className={styles.tagItem}>
                  #{tag}
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* FAB Create Button */}
      <Link href="/community/create" className={styles.fab}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      </Link>
    </div>
  );
}

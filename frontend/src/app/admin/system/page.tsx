'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  getAiConfigs, createAiConfig, updateAiConfig, deleteAiConfig, testAiConfig,
  type AiModelConfig,
} from '@/lib/admin-api';
import { apiClient } from '@/lib/api-client';
import styles from './page.module.css';

interface Banner {
  id: string; title: string; image: string; link: string | null;
  position: string; sortOrder: number; isActive: boolean;
  startAt: string | null; endAt: string | null;
}

type SubTab = 'banners' | 'ai-config';

export default function AdminSystemPage() {
  const [subTab, setSubTab] = useState<SubTab>('banners');
  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>系统配置</h1>
      </div>
      <div className={styles.subTabs}>
        <button className={`${styles.subTab} ${subTab === 'banners' ? styles.subTabActive : ''}`} onClick={() => setSubTab('banners')}>Banner 管理</button>
        <button className={`${styles.subTab} ${subTab === 'ai-config' ? styles.subTabActive : ''}`} onClick={() => setSubTab('ai-config')}>AI 模型配置</button>
      </div>
      {subTab === 'banners' && <BannerSection />}
      {subTab === 'ai-config' && <AiConfigSection />}
    </div>
  );
}

function BannerSection() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', image: '', link: '', position: 'home', sortOrder: 0, isActive: true });

  const fetchBanners = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/banners/admin');
      setBanners(res.data.data);
    } catch { /* */ } finally { setLoading(false); }
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- data fetching pattern
  useEffect(() => { void fetchBanners(); }, [fetchBanners]);

  const handleCreate = async () => {
    if (!form.title || !form.image) return;
    try {
      await apiClient.post('/banners', { ...form, link: form.link || null });
      setShowForm(false);
      setForm({ title: '', image: '', link: '', position: 'home', sortOrder: 0, isActive: true });
      fetchBanners();
    } catch { /* */ }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确认删除该 Banner？')) return;
    try { await apiClient.delete(`/banners/${id}`); fetchBanners(); } catch { /* */ }
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 'var(--lc-space-4)' }}>
        <button className={`${styles.formBtn} ${styles.formBtnPrimary}`} onClick={() => setShowForm(!showForm)}>
          {showForm ? '取消' : '+ 添加 Banner'}
        </button>
      </div>

      {showForm && (
        <div className={styles.addCard}>
          <h3 className={styles.addCardTitle}>添加 Banner</h3>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>标题</label>
              <input className={styles.formInput} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>图片 URL</label>
              <input className={styles.formInput} value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>跳转链接</label>
              <input className={styles.formInput} value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>位置</label>
              <select className={styles.formSelect} value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })}>
                <option value="home">首页</option>
                <option value="shop">商城</option>
                <option value="course">课程</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>排序</label>
              <input className={styles.formInput} type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} />
            </div>
          </div>
          <div className={styles.formActions}>
            <button className={styles.formBtn} onClick={() => setShowForm(false)}>取消</button>
            <button className={`${styles.formBtn} ${styles.formBtnPrimary}`} onClick={handleCreate}>创建</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className={styles.empty}>加载中...</div>
      ) : banners.length === 0 ? (
        <div className={styles.empty}>暂无 Banner</div>
      ) : (
        <div className={styles.bannerList}>
          {banners.map((b) => (
            <div key={b.id} className={styles.bannerItem}>
              <div className={styles.bannerImage} style={{ backgroundImage: `url(${b.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
              <div className={styles.bannerInfo}>
                <div className={styles.bannerTitle}>{b.title}</div>
                <div className={styles.bannerMeta}>
                  位置: {b.position} | 排序: {b.sortOrder} | {b.isActive ? '启用' : '禁用'}
                  {b.startAt && ` | ${new Date(b.startAt).toLocaleDateString('zh-CN')} - ${b.endAt ? new Date(b.endAt).toLocaleDateString('zh-CN') : '永久'}`}
                </div>
              </div>
              <div className={styles.bannerActions}>
                <button className={styles.configBtn} onClick={() => handleDelete(b.id)}>删除</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function AiConfigSection() {
  const [configs, setConfigs] = useState<AiModelConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ capability: '', providerType: 'openai', displayName: '', baseUrl: '', apiKey: '', modelName: '' });
  const [testResults, setTestResults] = useState<Record<string, { success: boolean; message: string }>>({});

  const fetchConfigs = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAiConfigs();
      setConfigs(data);
    } catch { /* */ } finally { setLoading(false); }
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- data fetching pattern
  useEffect(() => { void fetchConfigs(); }, [fetchConfigs]);

  const handleSubmit = async () => {
    if (!form.capability || !form.displayName || !form.modelName) return;
    try {
      const payload = { ...form, baseUrl: form.baseUrl || undefined, apiKey: form.apiKey || undefined };
      if (editingId) {
        await updateAiConfig(editingId, payload);
      } else {
        await createAiConfig(payload);
      }
      setShowForm(false);
      setEditingId(null);
      setForm({ capability: '', providerType: 'openai', displayName: '', baseUrl: '', apiKey: '', modelName: '' });
      fetchConfigs();
    } catch { /* */ }
  };

  const handleEdit = (c: AiModelConfig) => {
    setEditingId(c.id);
    setForm({
      capability: c.capability, providerType: c.providerType, displayName: c.displayName,
      baseUrl: c.baseUrl ?? '', apiKey: '', modelName: c.modelName,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确认删除该 AI 模型配置？')) return;
    try { await deleteAiConfig(id); fetchConfigs(); } catch { /* */ }
  };

  const handleToggle = async (c: AiModelConfig) => {
    try { await updateAiConfig(c.id, { isActive: !c.isActive }); fetchConfigs(); } catch { /* */ }
  };

  const handleTest = async (id: string) => {
    try {
      const result = await testAiConfig(id);
      setTestResults((prev) => ({ ...prev, [id]: result }));
    } catch {
      setTestResults((prev) => ({ ...prev, [id]: { success: false, message: '连通性测试失败' } }));
    }
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 'var(--lc-space-4)' }}>
        <button className={`${styles.formBtn} ${styles.formBtnPrimary}`} onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ capability: '', providerType: 'openai', displayName: '', baseUrl: '', apiKey: '', modelName: '' }); }}>
          {showForm ? '取消' : '+ 添加模型'}
        </button>
      </div>

      {showForm && (
        <div className={styles.addCard}>
          <h3 className={styles.addCardTitle}>{editingId ? '编辑模型' : '添加模型'}</h3>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>功能标识 (capability)</label>
              <input className={styles.formInput} value={form.capability} onChange={(e) => setForm({ ...form, capability: e.target.value })} placeholder="chat / pattern_gen / recommend" />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Provider</label>
              <select className={styles.formSelect} value={form.providerType} onChange={(e) => setForm({ ...form, providerType: e.target.value })}>
                <option value="openai">OpenAI</option>
                <option value="anthropic">Anthropic</option>
                <option value="deepseek">DeepSeek</option>
                <option value="custom">自定义</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>显示名称</label>
              <input className={styles.formInput} value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>模型名称</label>
              <input className={styles.formInput} value={form.modelName} onChange={(e) => setForm({ ...form, modelName: e.target.value })} placeholder="gpt-4o / deepseek-chat" />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Base URL</label>
              <input className={styles.formInput} value={form.baseUrl} onChange={(e) => setForm({ ...form, baseUrl: e.target.value })} placeholder="https://api.openai.com/v1" />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>API Key</label>
              <input className={styles.formInput} type="password" value={form.apiKey} onChange={(e) => setForm({ ...form, apiKey: e.target.value })} placeholder="sk-..." />
            </div>
          </div>
          <div className={styles.formActions}>
            <button className={styles.formBtn} onClick={() => { setShowForm(false); setEditingId(null); }}>取消</button>
            <button className={`${styles.formBtn} ${styles.formBtnPrimary}`} onClick={handleSubmit}>{editingId ? '保存' : '创建'}</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className={styles.empty}>加载中...</div>
      ) : configs.length === 0 ? (
        <div className={styles.empty}>暂无 AI 模型配置</div>
      ) : (
        <div className={styles.configGrid}>
          {configs.map((c) => (
            <div key={c.id} className={styles.configCard}>
              <div className={styles.configCardHeader}>
                <span className={styles.configCardTitle}>{c.displayName}</span>
                <button className={`${styles.toggle} ${c.isActive ? styles.toggleActive : ''}`} onClick={() => handleToggle(c)}>
                  <span className={styles.toggleDot} />
                </button>
              </div>
              <div className={styles.configField}>
                <span className={styles.configLabel}>功能</span>
                <span className={styles.configValue}>{c.capability}</span>
              </div>
              <div className={styles.configField}>
                <span className={styles.configLabel}>Provider</span>
                <span className={styles.configValue}>{c.providerType}</span>
              </div>
              <div className={styles.configField}>
                <span className={styles.configLabel}>模型</span>
                <span className={styles.configValue}>{c.modelName}</span>
              </div>
              {c.baseUrl && (
                <div className={styles.configField}>
                  <span className={styles.configLabel}>Base URL</span>
                  <span className={styles.configValue}>{c.baseUrl}</span>
                </div>
              )}
              {testResults[c.id] && (
                <div className={`${styles.testResult} ${testResults[c.id].success ? styles.testSuccess : styles.testFail}`}>
                  {testResults[c.id].success ? '✓' : '✗'} {testResults[c.id].message}
                </div>
              )}
              <div className={styles.configCardActions}>
                <button className={styles.configBtn} onClick={() => handleTest(c.id)}>测试连通</button>
                <button className={styles.configBtn} onClick={() => handleEdit(c)}>编辑</button>
                <button className={`${styles.configBtn} ${styles.configBtnDanger}`} onClick={() => handleDelete(c.id)}>删除</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

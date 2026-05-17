'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  getAiConfigs, createAiConfig, updateAiConfig, deleteAiConfig, testAiConfig,
  getSmtpConfig, updateSmtpConfig, verifySmtp,
  type AiModelConfig, type SmtpConfig,
} from '@/lib/admin-api';
import { apiClient } from '@/lib/api-client';
import styles from './page.module.css';

interface Banner {
  id: string; title: string; image: string; link: string | null;
  position: string; sortOrder: number; isActive: boolean;
  startAt: string | null; endAt: string | null;
}

type SubTab = 'banners' | 'ai-config' | 'smtp';

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
        <button className={`${styles.subTab} ${subTab === 'smtp' ? styles.subTabActive : ''}`} onClick={() => setSubTab('smtp')}>SMTP 配置</button>
      </div>
      {subTab === 'banners' && <BannerSection />}
      {subTab === 'ai-config' && <AiConfigSection />}
      {subTab === 'smtp' && <SmtpSection />}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   Shared Modal
   ════════════════════════════════════════════════════════════════ */

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>{title}</h3>
          <button className={styles.modalClose} onClick={onClose} aria-label="关闭">&times;</button>
        </div>
        <div className={styles.modalBody}>{children}</div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   Banner Section
   ════════════════════════════════════════════════════════════════ */

function BannerSection() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [form, setForm] = useState({ title: '', image: '', link: '', position: 'home', sortOrder: 0, isActive: true, startAt: '', endAt: '' });

  const fetchBanners = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/banners/admin');
      setBanners(Array.isArray(res.data.data) ? res.data.data : []);
    } catch { /* */ } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    queueMicrotask(() => void fetchBanners());
  }, [fetchBanners]);

  const openCreate = () => {
    setEditingBanner(null);
    setForm({ title: '', image: '', link: '', position: 'home', sortOrder: 0, isActive: true, startAt: '', endAt: '' });
    setShowModal(true);
  };

  const openEdit = (b: Banner) => {
    setEditingBanner(b);
    setForm({
      title: b.title,
      image: b.image,
      link: b.link ?? '',
      position: b.position,
      sortOrder: b.sortOrder,
      isActive: b.isActive,
      startAt: b.startAt ? b.startAt.slice(0, 10) : '',
      endAt: b.endAt ? b.endAt.slice(0, 10) : '',
    });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!form.title || !form.image) return;
    try {
      const payload = {
        ...form,
        link: form.link || null,
        startAt: form.startAt || null,
        endAt: form.endAt || null,
      };
      if (editingBanner) {
        await apiClient.patch(`/banners/${editingBanner.id}`, payload);
      } else {
        await apiClient.post('/banners', payload);
      }
      setShowModal(false);
      setEditingBanner(null);
      fetchBanners();
    } catch { /* */ }
  };

  const handleToggle = async (b: Banner) => {
    try {
      await apiClient.patch(`/banners/${b.id}`, { isActive: !b.isActive });
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
        <button className={`${styles.formBtn} ${styles.formBtnPrimary}`} onClick={openCreate}>+ 添加 Banner</button>
      </div>

      {showModal && (
        <Modal title={editingBanner ? '编辑 Banner' : '添加 Banner'} onClose={() => setShowModal(false)}>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>标题</label>
              <input className={styles.formInput} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>图片 URL</label>
              <input className={styles.formInput} value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="https://..." />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>跳转链接</label>
              <input className={styles.formInput} value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} placeholder="/shop 或 https://..." />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>位置</label>
              <select className={styles.formSelect} value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })}>
                <option value="home">首页</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>排序</label>
              <input className={styles.formInput} type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>状态</label>
              <div style={{ display: 'flex', alignItems: 'center', height: 36 }}>
                <button className={`${styles.toggle} ${form.isActive ? styles.toggleActive : ''}`} onClick={() => setForm({ ...form, isActive: !form.isActive })} type="button">
                  <span className={styles.toggleDot} />
                </button>
                <span style={{ marginLeft: 8, fontSize: 'var(--lc-text-sm)', color: 'var(--lc-text-secondary)' }}>{form.isActive ? '启用' : '禁用'}</span>
              </div>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>开始日期</label>
              <input className={styles.formInput} type="date" value={form.startAt} onChange={(e) => setForm({ ...form, startAt: e.target.value })} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>结束日期</label>
              <input className={styles.formInput} type="date" value={form.endAt} onChange={(e) => setForm({ ...form, endAt: e.target.value })} />
            </div>
          </div>
          <div className={styles.formActions}>
            <button className={styles.formBtn} onClick={() => setShowModal(false)}>取消</button>
            <button className={`${styles.formBtn} ${styles.formBtnPrimary}`} onClick={handleSubmit}>{editingBanner ? '保存' : '创建'}</button>
          </div>
        </Modal>
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
                  位置: {b.position} | 排序: {b.sortOrder}
                  {b.startAt && ` | ${new Date(b.startAt).toLocaleDateString('zh-CN')} - ${b.endAt ? new Date(b.endAt).toLocaleDateString('zh-CN') : '永久'}`}
                </div>
              </div>
              <div className={styles.bannerActions}>
                <button className={`${styles.toggle} ${b.isActive ? styles.toggleActive : ''}`} onClick={() => handleToggle(b)} title={b.isActive ? '点击禁用' : '点击启用'}>
                  <span className={styles.toggleDot} />
                </button>
                <button className={`${styles.iconBtn} ${styles.iconBtnPrimary}`} title="编辑" onClick={() => openEdit(b)}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
                <button className={`${styles.iconBtn} ${styles.iconBtnDanger}`} title="删除" onClick={() => handleDelete(b.id)}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

/* ════════════════════════════════════════════════════════════════
   AI Config Section
   ════════════════════════════════════════════════════════════════ */

function AiConfigSection() {
  const [configs, setConfigs] = useState<AiModelConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingConfig, setEditingConfig] = useState<AiModelConfig | null>(null);
  const [form, setForm] = useState({ capability: '', providerType: 'openai', displayName: '', baseUrl: '', apiKey: '', modelName: '' });
  const [testResults, setTestResults] = useState<Record<string, { success: boolean; message: string }>>({});

  const fetchConfigs = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAiConfigs();
      setConfigs(Array.isArray(data) ? data : []);
    } catch { /* */ } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    queueMicrotask(() => void fetchConfigs());
  }, [fetchConfigs]);

  const openCreate = () => {
    setEditingConfig(null);
    setForm({ capability: '', providerType: 'openai', displayName: '', baseUrl: '', apiKey: '', modelName: '' });
    setShowModal(true);
  };

  const openEdit = (c: AiModelConfig) => {
    setEditingConfig(c);
    setForm({
      capability: c.capability,
      providerType: c.providerType,
      displayName: c.displayName,
      baseUrl: c.baseUrl ?? '',
      apiKey: '',
      modelName: c.modelName,
    });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!form.capability || !form.displayName || !form.modelName) return;
    try {
      const payload = { ...form, baseUrl: form.baseUrl || undefined, apiKey: form.apiKey || undefined };
      if (editingConfig) {
        await updateAiConfig(editingConfig.id, payload);
      } else {
        await createAiConfig(payload);
      }
      setShowModal(false);
      setEditingConfig(null);
      fetchConfigs();
    } catch { /* */ }
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
        <button className={`${styles.formBtn} ${styles.formBtnPrimary}`} onClick={openCreate}>+ 添加模型</button>
      </div>

      {showModal && (
        <Modal title={editingConfig ? '编辑模型' : '添加模型'} onClose={() => { setShowModal(false); setEditingConfig(null); }}>
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
              <input className={styles.formInput} type="password" value={form.apiKey} onChange={(e) => setForm({ ...form, apiKey: e.target.value })} placeholder={editingConfig ? '留空则不修改' : 'sk-...'} />
            </div>
          </div>
          <div className={styles.formActions}>
            <button className={styles.formBtn} onClick={() => { setShowModal(false); setEditingConfig(null); }}>取消</button>
            <button className={`${styles.formBtn} ${styles.formBtnPrimary}`} onClick={handleSubmit}>{editingConfig ? '保存' : '创建'}</button>
          </div>
        </Modal>
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
                <button className={`${styles.iconBtn} ${styles.iconBtnPrimary}`} title="编辑" onClick={() => openEdit(c)}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
                <button className={`${styles.iconBtn} ${styles.iconBtnDanger}`} title="删除" onClick={() => handleDelete(c.id)}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

/* ════════════════════════════════════════════════════════════════
   SMTP Section
   ════════════════════════════════════════════════════════════════ */

function SmtpSection() {
  const [config, setConfig] = useState<SmtpConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ host: '', port: '465', username: '', password: '', fromAddress: '', fromName: '', encryption: 'ssl', isActive: false });
  const [saving, setSaving] = useState(false);
  const [verifyResult, setVerifyResult] = useState<{ success: boolean; message: string } | null>(null);
  const [verifying, setVerifying] = useState(false);

  const fetchConfig = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getSmtpConfig();
      setConfig(data);
    } catch { /* */ } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    queueMicrotask(() => void fetchConfig());
  }, [fetchConfig]);

  const openEdit = () => {
    setForm({
      host: config?.host ?? '',
      port: config?.port ?? '465',
      username: config?.username ?? '',
      password: '',
      fromAddress: config?.fromAddress ?? '',
      fromName: config?.fromName ?? '',
      encryption: config?.encryption ?? 'ssl',
      isActive: config?.isActive === 'true',
    });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!form.host || !form.fromAddress) return;
    try {
      setSaving(true);
      const payload: Record<string, unknown> = {
        host: form.host,
        port: Number(form.port),
        fromAddress: form.fromAddress,
        fromName: form.fromName || undefined,
        encryption: form.encryption,
        isActive: form.isActive,
      };
      if (form.username) payload.username = form.username;
      if (form.password) payload.password = form.password;
      const data = await updateSmtpConfig(payload);
      setConfig(data);
      setShowModal(false);
    } catch { /* */ } finally { setSaving(false); }
  };

  return (
    <>
      {loading ? (
        <div className={styles.empty}>加载中...</div>
      ) : (
        <div className={styles.smtpCard}>
          <div className={styles.configCardHeader}>
            <span className={styles.configCardTitle}>SMTP 邮件服务配置</span>
            <button className={`${styles.toggle} ${config?.isActive === 'true' ? styles.toggleActive : ''}`} onClick={async () => {
              if (!config) return;
              try {
                const data = await updateSmtpConfig({ isActive: config.isActive !== 'true' });
                setConfig(data);
              } catch { /* */ }
            }}>
              <span className={styles.toggleDot} />
            </button>
          </div>

          {config?.host ? (
            <>
              <div className={styles.configField}>
                <span className={styles.configLabel}>SMTP 服务器</span>
                <span className={styles.configValue}>{config.host}</span>
              </div>
              <div className={styles.configField}>
                <span className={styles.configLabel}>端口</span>
                <span className={styles.configValue}>{config.port}</span>
              </div>
              <div className={styles.configField}>
                <span className={styles.configLabel}>用户名</span>
                <span className={styles.configValue}>{config.username || '-'}</span>
              </div>
              <div className={styles.configField}>
                <span className={styles.configLabel}>发件人</span>
                <span className={styles.configValue}>{config.fromAddress}{config.fromName ? ` (${config.fromName})` : ''}</span>
              </div>
              <div className={styles.configField}>
                <span className={styles.configLabel}>加密方式</span>
                <span className={styles.configValue}>{config.encryption || 'ssl'}</span>
              </div>
              <div className={styles.configField}>
                <span className={styles.configLabel}>状态</span>
                <span className={styles.configValue}>{config.isActive === 'true' ? '已启用' : '未启用'}</span>
              </div>
            </>
          ) : (
            <div className={styles.empty}>尚未配置 SMTP 服务</div>
          )}

          {verifyResult && (
            <div className={`${styles.testResult} ${verifyResult.success ? styles.testSuccess : styles.testFail}`}>
              {verifyResult.success ? '✓' : '✗'} {verifyResult.message}
            </div>
          )}

          <div className={styles.configCardActions}>
            {config?.host && (
              <button className={styles.configBtn} onClick={async () => {
                setVerifying(true);
                setVerifyResult(null);
                try {
                  const result = await verifySmtp();
                  setVerifyResult(result);
                } catch {
                  setVerifyResult({ success: false, message: '测试失败' });
                } finally { setVerifying(false); }
              }} disabled={verifying}>{verifying ? '测试中...' : '测试连通'}</button>
            )}
            <button className={`${styles.configBtn} ${styles.configBtnPrimary}`} onClick={openEdit}>
              {config?.host ? '修改配置' : '配置 SMTP'}
            </button>
          </div>
        </div>
      )}

      {showModal && (
        <Modal title="SMTP 邮件配置" onClose={() => setShowModal(false)}>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>SMTP 服务器 *</label>
              <input className={styles.formInput} value={form.host} onChange={(e) => setForm({ ...form, host: e.target.value })} placeholder="smtp.qq.com" />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>端口 *</label>
              <input className={styles.formInput} type="number" value={form.port} onChange={(e) => setForm({ ...form, port: e.target.value })} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>用户名</label>
              <input className={styles.formInput} value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="your-email@qq.com" />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>密码</label>
              <input className={styles.formInput} type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="留空则不修改" />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>发件人邮箱 *</label>
              <input className={styles.formInput} value={form.fromAddress} onChange={(e) => setForm({ ...form, fromAddress: e.target.value })} placeholder="noreply@example.com" />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>发件人名称</label>
              <input className={styles.formInput} value={form.fromName} onChange={(e) => setForm({ ...form, fromName: e.target.value })} placeholder="艺育皮韵" />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>加密方式</label>
              <select className={styles.formSelect} value={form.encryption} onChange={(e) => setForm({ ...form, encryption: e.target.value })}>
                <option value="ssl">SSL</option>
                <option value="tls">TLS</option>
                <option value="none">无加密</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>启用</label>
              <div style={{ display: 'flex', alignItems: 'center', height: 36 }}>
                <button className={`${styles.toggle} ${form.isActive ? styles.toggleActive : ''}`} onClick={() => setForm({ ...form, isActive: !form.isActive })} type="button">
                  <span className={styles.toggleDot} />
                </button>
                <span style={{ marginLeft: 8, fontSize: 'var(--lc-text-sm)', color: 'var(--lc-text-secondary)' }}>{form.isActive ? '启用' : '禁用'}</span>
              </div>
            </div>
          </div>
          <div className={styles.formActions}>
            <button className={styles.formBtn} onClick={() => setShowModal(false)}>取消</button>
            <button className={`${styles.formBtn} ${styles.formBtnPrimary}`} onClick={handleSubmit} disabled={saving}>{saving ? '保存中...' : '保存'}</button>
          </div>
        </Modal>
      )}
    </>
  );
}

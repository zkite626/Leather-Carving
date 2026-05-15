'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/stores/cart-store';
import { getAddresses, createAddress, type IAddress, type CreateAddressData } from '@/lib/address-api';
import { createOrder, type CreateOrderData } from '@/lib/order-api';
import styles from './page.module.css';

// ==================== Step Indicator ====================

const STEPS = [
  { number: 1, label: '确认订单' },
  { number: 2, label: '支付' },
  { number: 3, label: '完成' },
];

function StepIndicator({ activeStep }: { activeStep: number }) {
  return (
    <div className={styles.steps}>
      {STEPS.map((step, index) => {
        const isActive = step.number === activeStep;
        const isCompleted = step.number < activeStep;
        const stepClass = isActive
          ? styles.stepActive
          : isCompleted
            ? styles.stepCompleted
            : '';
        return (
          <React.Fragment key={step.number}>
            {index > 0 && <div className={styles.stepConnector} />}
            <div className={`${styles.step} ${stepClass}`}>
              <span className={styles.stepNumber}>
                {isCompleted ? '✓' : step.number}
              </span>
              <span className={styles.stepLabel}>{step.label}</span>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ==================== Address Card ====================

function AddressCard({
  address,
  selected,
  onSelect,
}: {
  address: IAddress;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <div
      className={`${styles.addressCard} ${selected ? styles.addressCardSelected : ''}`}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
    >
      {selected && (
        <span className={styles.addressCheckmark} aria-label="已选择">
          {'✓'}
        </span>
      )}
      {address.isDefault && (
        <span className={styles.addressDefaultBadge}>默认</span>
      )}
      <div className={styles.addressName}>{address.name}</div>
      <div className={styles.addressPhone}>{address.phone}</div>
      <div className={styles.addressDetail}>
        {address.province}
        {address.city}
        {address.district}
        {' '}
        {address.detail}
      </div>
    </div>
  );
}

// ==================== Address Form ====================

interface AddressFormData {
  name: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  detail: string;
  isDefault: boolean;
}

const EMPTY_FORM: AddressFormData = {
  name: '',
  phone: '',
  province: '',
  city: '',
  district: '',
  detail: '',
  isDefault: false,
};

function AddressForm({
  onSubmit,
  onCancel,
  submitting,
}: {
  onSubmit: (data: CreateAddressData) => void;
  onCancel: () => void;
  submitting: boolean;
}) {
  const [form, setForm] = useState<AddressFormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof AddressFormData, string>>>({});

  const handleChange = (
    field: keyof AddressFormData,
    value: string | boolean,
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    // Clear error on change
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof AddressFormData, string>> = {};

    if (!form.name.trim()) newErrors.name = '请输入收货人姓名';
    if (!form.phone.trim()) newErrors.phone = '请输入手机号';
    else if (!/^1[3-9]\d{9}$/.test(form.phone.trim())) {
      newErrors.phone = '请输入正确的手机号';
    }
    if (!form.province.trim()) newErrors.province = '请输入省份';
    if (!form.city.trim()) newErrors.city = '请输入城市';
    if (!form.district.trim()) newErrors.district = '请输入区/县';
    if (!form.detail.trim()) newErrors.detail = '请输入详细地址';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      name: form.name.trim(),
      phone: form.phone.trim(),
      province: form.province.trim(),
      city: form.city.trim(),
      district: form.district.trim(),
      detail: form.detail.trim(),
      isDefault: form.isDefault,
    });
  };

  return (
    <form className={styles.addressForm} onSubmit={handleSubmit}>
      <h4 className={styles.formTitle}>新增收货地址</h4>

      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label className={`${styles.formLabel} ${styles.formLabelRequired}`}>
            收货人
          </label>
          <input
            type="text"
            className={`${styles.formInput} ${errors.name ? styles.formInputError : ''}`}
            placeholder="请输入收货人姓名"
            value={form.name}
            onChange={(e) => handleChange('name', e.target.value)}
          />
          {errors.name && <div className={styles.formError}>{errors.name}</div>}
        </div>
        <div className={styles.formGroup}>
          <label className={`${styles.formLabel} ${styles.formLabelRequired}`}>
            手机号
          </label>
          <input
            type="tel"
            className={`${styles.formInput} ${errors.phone ? styles.formInputError : ''}`}
            placeholder="请输入手机号"
            value={form.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            maxLength={11}
          />
          {errors.phone && <div className={styles.formError}>{errors.phone}</div>}
        </div>
      </div>

      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label className={`${styles.formLabel} ${styles.formLabelRequired}`}>
            省份
          </label>
          <input
            type="text"
            className={`${styles.formInput} ${errors.province ? styles.formInputError : ''}`}
            placeholder="如：广东省"
            value={form.province}
            onChange={(e) => handleChange('province', e.target.value)}
          />
          {errors.province && <div className={styles.formError}>{errors.province}</div>}
        </div>
        <div className={styles.formGroup}>
          <label className={`${styles.formLabel} ${styles.formLabelRequired}`}>
            城市
          </label>
          <input
            type="text"
            className={`${styles.formInput} ${errors.city ? styles.formInputError : ''}`}
            placeholder="如：深圳市"
            value={form.city}
            onChange={(e) => handleChange('city', e.target.value)}
          />
          {errors.city && <div className={styles.formError}>{errors.city}</div>}
        </div>
        <div className={styles.formGroup}>
          <label className={`${styles.formLabel} ${styles.formLabelRequired}`}>
            区/县
          </label>
          <input
            type="text"
            className={`${styles.formInput} ${errors.district ? styles.formInputError : ''}`}
            placeholder="如：南山区"
            value={form.district}
            onChange={(e) => handleChange('district', e.target.value)}
          />
          {errors.district && <div className={styles.formError}>{errors.district}</div>}
        </div>
      </div>

      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label className={`${styles.formLabel} ${styles.formLabelRequired}`}>
            详细地址
          </label>
          <input
            type="text"
            className={`${styles.formInput} ${errors.detail ? styles.formInputError : ''}`}
            placeholder="街道、门牌号、楼层等"
            value={form.detail}
            onChange={(e) => handleChange('detail', e.target.value)}
          />
          {errors.detail && <div className={styles.formError}>{errors.detail}</div>}
        </div>
      </div>

      <div className={styles.formCheckboxRow}>
        <input
          id="isDefault"
          type="checkbox"
          className={styles.formCheckbox}
          checked={form.isDefault}
          onChange={(e) => handleChange('isDefault', e.target.checked)}
        />
        <label htmlFor="isDefault" className={styles.formCheckboxLabel}>
          设为默认地址
        </label>
      </div>

      <div className={styles.formActions}>
        <button
          type="button"
          className={styles.cancelButton}
          onClick={onCancel}
          disabled={submitting}
        >
          取消
        </button>
        <button
          type="submit"
          className={styles.primaryButton}
          disabled={submitting}
        >
          {submitting ? '保存中...' : '保存地址'}
        </button>
      </div>
    </form>
  );
}

// ==================== Main Page ====================

export default function CheckoutPage() {
  const router = useRouter();

  // Cart store
  const selectedItems = useCartStore((s) => s.getSelectedItems());
  const selectedCount = useCartStore((s) => s.getSelectedCount());
  const selectedTotal = useCartStore((s) => s.getSelectedTotal());
  const removeSelected = useCartStore((s) => s.removeSelected);

  // Address state
  const [addresses, setAddresses] = useState<IAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [addressLoading, setAddressLoading] = useState(true);
  const [addressSubmitting, setAddressSubmitting] = useState(false);

  // Order state
  const [remark, setRemark] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load addresses on mount
  const loadAddresses = useCallback(async () => {
    setAddressLoading(true);
    try {
      const list = await getAddresses();
      setAddresses(list);
      // Auto-select default or first
      if (list.length > 0) {
        const defaultAddr = list.find((a) => a.isDefault);
        setSelectedAddressId(defaultAddr ? defaultAddr.id : list[0].id);
      }
    } catch {
      // API may fail if not logged in or no addresses yet
      setAddresses([]);
    } finally {
      setAddressLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAddresses(); // eslint-disable-line react-hooks/set-state-in-effect -- data fetching pattern
  }, [loadAddresses]);

  // Show form inline if no addresses and not loading
  useEffect(() => {
    if (!addressLoading && addresses.length === 0) {
      setShowForm(true); // eslint-disable-line react-hooks/set-state-in-effect -- conditional state initialization
    }
  }, [addressLoading, addresses.length]);

  // Address form handlers
  const handleCreateAddress = async (data: CreateAddressData) => {
    setAddressSubmitting(true);
    try {
      const created = await createAddress(data);
      await loadAddresses();
      setSelectedAddressId(created.id);
      setShowForm(false);
    } catch (err) {
      // Keep form open; show generic error
      console.error('Failed to create address:', err);
    } finally {
      setAddressSubmitting(false);
    }
  };

  // Submit order
  const handleSubmitOrder = async () => {
    setError(null);

    // Validate address selected
    if (!selectedAddressId) {
      setError('请选择收货地址');
      return;
    }

    // Validate cart items
    if (selectedItems.length === 0) {
      setError('购物车中没有已选中的商品');
      return;
    }

    const selectedAddress = addresses.find((a) => a.id === selectedAddressId);
    if (!selectedAddress) {
      setError('收货地址信息异常，请重新选择');
      return;
    }

    setSubmitting(true);

    try {
      const orderData: CreateOrderData = {
        items: selectedItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        address: {
          name: selectedAddress.name,
          phone: selectedAddress.phone,
          province: selectedAddress.province,
          city: selectedAddress.city,
          district: selectedAddress.district,
          detail: selectedAddress.detail,
        },
      };

      if (remark.trim()) {
        orderData.remark = remark.trim();
      }

      await createOrder(orderData);

      // Remove selected items from cart
      removeSelected();

      // Redirect to orders page
      router.push('/my-orders');
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : typeof err === 'object' && err !== null && 'response' in err
            ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
            : undefined;
      setError(message || '提交订单失败，请稍后重试');
      setSubmitting(false);
    }
  };

  // Empty cart state
  if (selectedItems.length === 0 && !addressLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <StepIndicator activeStep={1} />
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <svg
                width="64"
                height="64"
                viewBox="0 0 64 64"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M16 16H12L4 56H56L48 16H44"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M24 8H40"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M20 40L32 28L44 40"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M32 28V50"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <h2 className={styles.emptyTitle}>没有待结算的商品</h2>
            <p className={styles.emptyText}>
              请先在购物车中选择商品后再结算
            </p>
            <Link href="/shop" className={styles.emptyButton}>
              去商城逛逛
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <StepIndicator activeStep={1} />

        {error && (
          <div className={styles.errorBanner}>
            <span className={styles.errorBannerIcon}>
              <svg
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                aria-hidden="true"
              >
                <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.5" />
                <path
                  d="M9 5.5V9.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <circle cx="9" cy="12" r="0.75" fill="currentColor" />
              </svg>
            </span>
            <span className={styles.errorBannerText}>{error}</span>
          </div>
        )}

        <div className={styles.mainLayout}>
          {/* ---- Left: Main Content ---- */}
          <div className={styles.mainContent}>
            {/* Shipping Address Section */}
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>收货地址</h2>
                {addresses.length > 0 && !showForm && (
                  <button
                    type="button"
                    className={styles.primaryButton}
                    onClick={() => setShowForm(true)}
                  >
                    新增地址
                  </button>
                )}
              </div>

              {addressLoading ? (
                <div className={styles.addressList}>
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className={`${styles.skeleton} ${styles.skeletonCard}`} />
                  ))}
                </div>
              ) : (
                <>
                  {addresses.length > 0 && (
                    <div className={styles.addressList}>
                      {addresses.map((addr) => (
                        <AddressCard
                          key={addr.id}
                          address={addr}
                          selected={selectedAddressId === addr.id}
                          onSelect={() => setSelectedAddressId(addr.id)}
                        />
                      ))}
                      {!showForm && (
                        <button
                          type="button"
                          className={styles.addAddressButton}
                          onClick={() => setShowForm(true)}
                        >
                          <span className={styles.addAddressIcon}>+</span>
                          <span>新增地址</span>
                        </button>
                      )}
                    </div>
                  )}

                  {showForm && (
                    <AddressForm
                      onSubmit={handleCreateAddress}
                      onCancel={() => {
                        if (addresses.length > 0) {
                          setShowForm(false);
                        }
                      }}
                      submitting={addressSubmitting}
                    />
                  )}
                </>
              )}
            </section>

            {/* Order Items Section */}
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>订单商品</h2>
                <span style={{ fontSize: 'var(--lc-text-sm)', color: 'var(--lc-text-muted)' }}>
                  {selectedItems.length} 件商品
                </span>
              </div>
              <div className={styles.orderItemList}>
                {selectedItems.map((item) => (
                  <div key={item.productId} className={styles.orderItem} style={{ position: 'relative' }}>
                    {item.coverImage ? (
                      <Image
                        src={item.coverImage}
                        alt={item.name}
                        className={styles.orderItemImage}
                        fill
                        unoptimized
                      />
                    ) : (
                      <div className={styles.noImage}>No Image</div>
                    )}
                    <div className={styles.orderItemInfo}>
                      <div className={styles.orderItemName}>{item.name}</div>
                    </div>
                    <div className={styles.orderItemQuantity}>
                      x{item.quantity}
                    </div>
                    <div className={styles.orderItemSubtotal}>
                      {'¥'}{(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* ---- Right: Summary Sidebar ---- */}
          <aside className={styles.summary}>
            <div className={styles.summaryCard}>
              <h3 className={styles.summaryTitle}>订单摘要</h3>

              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>商品数量</span>
                <span className={styles.summaryValue}>{selectedCount} 件</span>
              </div>

              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>商品金额</span>
                <span className={styles.summaryValue}>
                  {'¥'}{selectedTotal.toFixed(2)}
                </span>
              </div>

              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>运费</span>
                <span className={styles.summaryFreeShipping}>免运费</span>
              </div>

              <hr className={styles.summaryDivider} />

              <div className={styles.summaryTotalRow}>
                <span className={styles.summaryTotalLabel}>合计</span>
                <span className={styles.summaryTotalValue}>
                  {'¥'}{selectedTotal.toFixed(2)}
                </span>
              </div>

              {/* Remark */}
              <div className={styles.remarkGroup}>
                <label className={styles.remarkLabel} htmlFor="order-remark">
                  备注
                </label>
                <textarea
                  id="order-remark"
                  className={styles.remarkInput}
                  placeholder="选填，如有特殊要求请在此备注"
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  maxLength={500}
                />
              </div>

              {/* Submit Button */}
              <button
                type="button"
                className={`${styles.submitButton} ${submitting ? styles.submitButtonLoading : ''}`}
                disabled={submitting || selectedItems.length === 0}
                onClick={handleSubmitOrder}
              >
                {submitting ? '提交中...' : '提交订单'}
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

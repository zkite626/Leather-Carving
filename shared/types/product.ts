export type ProductStatus = 'DRAFT' | 'ON_SALE' | 'OFF_SALE' | 'SOLD_OUT';

export type OrderStatus =
  | 'PENDING'
  | 'PAID'
  | 'SHIPPING'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REFUNDING'
  | 'REFUNDED';

export type PaymentMethod = 'WECHAT' | 'ALIPAY';

export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';

export interface IProductCategory {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  children?: IProductCategory[];
}

export interface IProduct {
  id: string;
  name: string;
  slug: string;
  description?: string;
  coverImage: string;
  price: number;
  originalPrice?: number;
  stock: number;
  sales: number;
  rating: number;
  status: ProductStatus;
  isGuangxi: boolean;
  attributes?: Record<string, unknown>;
  tags: string[];
  category?: IProductCategory;
  images: IProductImage[];
  createdAt: string;
  updatedAt: string;
}

export interface IProductImage {
  id: string;
  url: string;
  sortOrder: number;
}

export interface ICartItem {
  id: string;
  userId: string;
  productId: string;
  product: IProduct;
  quantity: number;
  createdAt: string;
}

export interface IOrder {
  id: string;
  orderNo: string;
  totalAmount: number;
  payAmount: number;
  status: OrderStatus;
  items: IOrderItem[];
  address: Record<string, unknown>;
  remark?: string;
  paidAt?: string;
  shippedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  createdAt: string;
}

export interface IOrderItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
}

export interface IPayment {
  id: string;
  orderId: string;
  transactionNo?: string;
  method: PaymentMethod;
  amount: number;
  status: PaymentStatus;
  paidAt?: string;
}

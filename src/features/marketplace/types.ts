export type VoucherStatus = 'pending' | 'completed' | 'expired' | 'cancelled' | 'rejected';

export type CommissionType = 'fixed' | 'percentage';

export type OfferCategory =
  | 'books'
  | 'stationery'
  | 'printing'
  | 'tools'
  | 'electronics'
  | 'bundles';

export interface StoreLocation {
  address: string;
  lat?: number;
  lng?: number;
}

export interface Store {
  id: string;
  name: string;
  logoUrl?: string;
  location: StoreLocation;
  phone?: string;
  isApproved: boolean;
  rating: number;
  totalOffers: number;
  createdAt: string;
  description?: string;
}

export interface Offer {
  id: string;
  storeId: string;
  storeName?: string;
  storeLogoUrl?: string;
  title: string;
  description?: string;
  category: OfferCategory;
  imageUrl?: string;
  originalPrice: number;
  discountedPrice: number;
  commissionValue: number;
  commissionType: CommissionType;
  isActive: boolean;
  stock: number;
  validUntil: string;
  createdAt: string;
  isFeatured?: boolean;
}

export interface Voucher {
  id: string;
  voucherCode: string;
  studentUid: string;
  studentEmail?: string;
  offerId: string;
  offerTitle?: string;
  storeId: string;
  storeName?: string;
  originalPrice: number;
  discountedPrice: number;
  commissionValue: number;
  status: VoucherStatus;
  createdAt: string;
  expiresAt: string;
  completedAt?: string | null;
}

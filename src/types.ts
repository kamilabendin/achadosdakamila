export interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  imageUrl: string;
  shopeeUrl: string;
  tiktokUrl?: string;
  createdAt: string;
  isFeatured?: boolean;
  primaryLink?: 'shopee' | 'tiktok';
}

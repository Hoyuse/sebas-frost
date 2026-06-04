export interface Product {
  id: string;
  name: string;
  price: number;
  category: 'Cítricos' | 'Dulces' | string;
  image: string;
  description: string;
  tag?: string;
  isPopular?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
  customDetails?: string;
}

export interface StoreLocation {
  name: string;
  address: string;
  schedule: string;
  note?: string;
}

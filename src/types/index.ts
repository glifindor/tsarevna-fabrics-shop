export interface Product {
  _id: string;
  name: string;
  articleNumber: string;
  description: string;
  price: number;
  composition: string;
  category: string;
  stock: number;
  images: string[];
  createdAt?: string;
  updatedAt?: string;
  slug?: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  user: string | User;
  items: CartItem[];
  total: number;
  totalAmount: number; // Альтернативное поле для суммы
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  customerInfo: {
    name: string;
    email: string;
    phone: string;
    address?: string;
  };
  customerName: string; // Прямое поле имени клиента
  phone: string; // Прямое поле телефона
  email: string; // Прямое поле email
  address?: string; // Прямое поле адреса
  paymentMethod: string;
  deliveryMethod: string;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  product: string | Product;
  quantity: number;
  price: number;
}

export interface Settings {
  _id?: string;
  shopName: string;
  shopDescription: string;
  shopPhone: string;
  shopEmail: string;
  shopAddress: string;
  enablePickup: boolean;
  enableDelivery: boolean;
  enableCash: boolean;
  enableCard: boolean;
  createdAt?: string;
  updatedAt?: string;
} 
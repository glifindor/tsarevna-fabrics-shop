import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  articleNumber: string;
  description: string;
  price: number;
  composition: string;
  category: string;
  stock: number;
  images: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, index: true },
    articleNumber: { type: String, required: true, unique: true, index: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    composition: { type: String, required: true },
    category: { type: String, required: true, index: true },
    stock: { type: Number, required: true, default: 0 },
    images: { type: [String], default: [] },
  },
  { timestamps: true }
);

// Создаем индексы для полнотекстового поиска
ProductSchema.index({ name: 'text', articleNumber: 'text', description: 'text' });

export default mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);

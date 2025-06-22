import mongoose, { Schema, Document } from 'mongoose';

export interface ICategory extends Document {
  name: string; // Русское название
  slug: string; // Английский слаг
  image: string; // Ссылка на картинку
}

const CategorySchema = new Schema<ICategory>({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
  image: { type: String, default: '' },
});

export default mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema); 
"use client";
import { useState } from "react";

interface Product {
  _id: string;
  name: string;
  articleNumber: string;
  description: string;
  price: number;
  composition: string;
  category: string;
  stock: number;
  images: string[];
}

interface Category {
  _id: string;
  name: string;
  slug: string;
}

export default function ProductEditForm({ product, categories, onSave, onCancel }: {
  product: Product;
  categories: Category[];
  onSave: (updated: Product) => void;
  onCancel: () => void;
}) {
  const [formState, setFormState] = useState({
    name: product.name || '',
    articleNumber: product.articleNumber || '',
    description: product.description || '',
    price: product.price?.toString() || '',
    composition: product.composition || '',
    category: product.category || '',
    stock: product.stock?.toString() || '',
    images: product.images || [],
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormState({ ...formState, [name]: value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    try {
      const res = await fetch(`/api/products/${product._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formState,
          price: Number(formState.price),
          stock: Number(formState.stock),
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        onSave(data.data);
      } else {
        setFormError(data.message || 'Ошибка при сохранении');
      }
    } catch (error) {
      console.error('Ошибка при сохранении:', error);
      setFormError('Ошибка при сохранении');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-4">
      <div>
        <label className="block text-sm mb-1">Название</label>
        <input type="text" name="name" value={formState.name} onChange={handleInputChange} className="form-input w-full" required />
      </div>
      <div>
        <label className="block text-sm mb-1">Артикул</label>
        <input type="text" name="articleNumber" value={formState.articleNumber} onChange={handleInputChange} className="form-input w-full" required />
      </div>
      <div>
        <label className="block text-sm mb-1">Описание</label>
        <textarea name="description" value={formState.description} onChange={handleInputChange} className="form-input w-full" rows={3} required />
      </div>
      <div>
        <label className="block text-sm mb-1">Цена (₽/м)</label>
        <input type="number" name="price" value={formState.price} onChange={handleInputChange} className="form-input w-full" required />
      </div>
      <div>
        <label className="block text-sm mb-1">Состав</label>
        <input type="text" name="composition" value={formState.composition} onChange={handleInputChange} className="form-input w-full" required />
      </div>
      <div>
        <label className="block text-sm mb-1">Категория</label>
        <select name="category" value={formState.category} onChange={handleInputChange} className="form-select w-full" required>
          <option value="">Выберите категорию</option>
          {categories.map((cat: Category) => (
            <option key={cat._id} value={cat.slug}>{cat.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm mb-1">Остаток (м)</label>
        <input type="number" name="stock" value={formState.stock} onChange={handleInputChange} className="form-input w-full" required />
      </div>
      {/* Можно добавить загрузку изображений и другие поля */}
      {formError && <div className="text-red-500 text-sm">{formError}</div>}
      <div className="flex justify-end gap-2">
        <button type="button" className="btn px-4 py-2" onClick={onCancel}>Отмена</button>
        <button type="submit" className="btn px-4 py-2" disabled={saving}>{saving ? 'Сохранение...' : 'Сохранить'}</button>
      </div>
    </form>
  );
} 
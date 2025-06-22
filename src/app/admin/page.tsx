"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiPackage, FiShoppingBag, FiUsers, FiSettings, FiLogOut, FiPlus, FiEdit, FiTrash2, FiBarChart2 } from 'react-icons/fi';
import { FaCrown } from 'react-icons/fa';
import './admin-styles.css';

// Компонент админ-панели
export default function AdminPanel() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('products');

  const handleLogout = () => {
    // Здесь будет логика выхода из системы
    router.push('/login');
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">      {/* Боковое меню */}
      <aside className="w-full md:w-64 bg-gray-800 text-white admin-sidebar">
        <div className="p-4 border-b border-gray-700 flex flex-col items-center">          <div className="relative w-40 h-40 mb-3 rounded-full overflow-hidden bg-white p-2 logo-container">
            <div className="w-full h-full bg-contain bg-center bg-no-repeat" 
                 style={{ backgroundImage: "url('/tsarevna-logo.jpg')" }}>
            </div>
            <FaCrown className="crown-top" />
          </div>
          <div className="text-center">
            <h2 className="text-xl font-bold" style={{ fontFamily: "'Times New Roman', Times, serif" }}>Царевна Швеяна</h2>
            <p className="text-gray-400 text-sm">Волшебные ткани для рукоделия</p>
          </div>
        </div>
          <nav className="p-4">
          <ul className="space-y-2">
            <li>
              <button                onClick={() => setActiveTab('products')}
                className={`w-full flex items-center space-x-2 p-2 rounded-md transition ${
                  activeTab === 'products' 
                    ? 'tab-active' 
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                <FiPackage />
                <span>Товары</span>
              </button>
            </li>
            <li>
              <button onClick={() => setActiveTab('categories')}
                className={`w-full flex items-center space-x-2 p-2 rounded-md transition ${
                  activeTab === 'categories'
                    ? 'tab-active'
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                <FiSettings />
                <span>Категории</span>
              </button>
            </li>
            <li>
              <button                onClick={() => setActiveTab('orders')}
                className={`w-full flex items-center space-x-2 p-2 rounded-md transition ${
                  activeTab === 'orders' 
                    ? 'tab-active' 
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                <FiShoppingBag />
                <span>Заказы</span>
              </button>
            </li>
            <li>
              <Link href="/admin/statistics" className="w-full flex items-center space-x-2 p-2 rounded-md transition text-gray-300 hover:bg-gray-700">
                <FiBarChart2 />
                <span>Статистика</span>
              </Link>
            </li>
            <li>
              <button                onClick={() => setActiveTab('users')}
                className={`w-full flex items-center space-x-2 p-2 rounded-md transition ${
                  activeTab === 'users' 
                    ? 'tab-active' 
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                <FiUsers />
                <span>Пользователи</span>
              </button>
            </li>
            <li>
              <button                onClick={() => setActiveTab('settings')}
                className={`w-full flex items-center space-x-2 p-2 rounded-md transition ${
                  activeTab === 'settings' 
                    ? 'tab-active' 
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                <FiSettings />
                <span>Настройки</span>
              </button>
            </li>
          </ul>
          
          <div className="pt-8">
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-2 p-2 rounded-md text-gray-300 hover:bg-gray-700 transition"
            >
              <FiLogOut />
              <span>Выйти</span>
            </button>
          </div>
        </nav>
      </aside>
      
      {/* Основное содержимое */}
      <main className="flex-1 p-6">
        {activeTab === 'products' && <ProductsPanel />}
        {activeTab === 'categories' && <CategoriesPanel />}
        {activeTab === 'orders' && <OrdersPanel />}
        {activeTab === 'users' && <UsersPanel />}
        {activeTab === 'settings' && <SettingsPanel />}
      </main>
    </div>
  );
}

// Панель управления товарами
function ProductsPanel() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<any>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formState, setFormState] = useState({
    name: '',
    articleNumber: '',
    description: '',
    price: '',
    composition: '',
    category: '',
    stock: '',
    images: [] as string[],
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [catLoading, setCatLoading] = useState(true);
  const [catError, setCatError] = useState<string | null>(null);

  // Загрузка списка товаров
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/products');
      const result = await response.json();
      
      if (result.success) {
        setProducts(result.data);
      } else {
        setError(result.message || 'Ошибка при загрузке товаров');
      }
    } catch (err) {
      setError('Ошибка при загрузке товаров');
      console.error('Ошибка при загрузке товаров:', err);
    } finally {
      setLoading(false);
    }
  };

  // Загрузка категорий
  useEffect(() => {
    const fetchCategories = async () => {
      setCatLoading(true);
      try {
        const res = await fetch('/api/categories');
        const data = await res.json();
        if (data.success) {
          setCategories(data.data);
        } else {
          setCatError(data.message || 'Ошибка при загрузке категорий');
        }
      } catch (e) {
        setCatError('Ошибка при загрузке категорий');
      } finally {
        setCatLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // Загрузка товаров при монтировании компонента
  useEffect(() => {
    fetchProducts();
  }, []);  // Обработка открытия модального окна для добавления/редактирования
  const handleOpenModal = (product: any = null) => {
    if (product) {
      setFormState({
        name: product.name,
        articleNumber: product.articleNumber,
        description: product.description || '',
        price: product.price.toString(),
        composition: product.composition || '',
        category: product.category || '',
        stock: product.stock.toString(),
        images: product.images || [],
      });
      setCurrentProduct(product);
    } else {
      setFormState({
        name: '',
        articleNumber: '',
        description: '',
        price: '',
        composition: '',
        category: '',
        stock: '0',
        images: [],
      });
      setCurrentProduct(null);
    }
    setFormError(null);
    setShowModal(true);
  };
  
  // Обработка изменения полей формы
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormState({
      ...formState,
      [name]: value,
    });
  };

  // Загрузка изображений
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    const uploadedUrls: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const result = await response.json();
        if (result.success) {
          uploadedUrls.push(result.url);
        }
      }

      setFormState({
        ...formState,
        images: [...formState.images, ...uploadedUrls],
      });
    } catch (error) {
      console.error('Ошибка загрузки изображений:', error);
      setFormError('Ошибка при загрузке изображений');
    } finally {
      setUploadingImage(false);
    }
  };

  // Удаление изображения
  const removeImage = (index: number) => {
    const newImages = formState.images.filter((_, i) => i !== index);
    setFormState({
      ...formState,
      images: newImages,
    });
  };
  // Сохранение товара
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Валидация
    if (!formState.name || !formState.articleNumber || !formState.price || !formState.category) {
      setFormError('Пожалуйста, заполните все обязательные поля');
      return;
    }

    try {
      const productData = {
        ...formState,
        price: parseFloat(formState.price),
        stock: parseInt(formState.stock),
        // Убедимся, что категория передается как строка
        category: formState.category.trim(),
      };

      console.log('Saving product data:', productData);
      
      let response;
      
      if (currentProduct) {
        // Обновление товара
        response = await fetch(`/api/products/${currentProduct._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(productData),
        });
      } else {
        // Создание нового товара
        response = await fetch('/api/products', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(productData),
        });
      }

      const result = await response.json();
      
      if (result.success) {
        // Закрываем модальное окно и обновляем список товаров
        setShowModal(false);
        fetchProducts();
      } else {
        console.error('Error saving product:', result);
        setFormError(result.message || 'Ошибка при сохранении товара');
      }
    } catch (err) {
      console.error('Error in handleSaveProduct:', err);
      setFormError('Ошибка при сохранении товара');
    }
  };

  // Открытие подтверждения удаления
  const handleOpenDeleteConfirm = (id: string) => {
    setDeleteId(id);
    setShowDeleteConfirm(true);
  };

  // Удаление товара
  const handleDeleteProduct = async () => {
    if (!deleteId) return;
    
    try {
      const response = await fetch(`/api/products/${deleteId}`, {
        method: 'DELETE',
      });
      
      const result = await response.json();
      
      if (result.success) {
        setShowDeleteConfirm(false);
        fetchProducts();
      } else {
        setError(result.message || 'Ошибка при удалении товара');
      }
    } catch (err) {
      setError('Ошибка при удалении товара');
      console.error('Ошибка при удалении товара:', err);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl admin-title mb-5">Управление товарами</h2>        <button 
          onClick={() => handleOpenModal()} 
          className="btn-primary px-4 py-2 rounded-md flex items-center transition"
        >
          <FiPlus className="mr-2" />
          Добавить товар
        </button>
      </div>
      
      {/* Сообщение об ошибке */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
          <button 
            className="ml-2 text-red-700" 
            onClick={() => setError(null)}
          >
            ✕
          </button>
        </div>
      )}

      {/* Индикатор загрузки */}
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-600"></div>
          <p className="mt-2 text-gray-500">Загрузка товаров...</p>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          {products.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Артикул
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Название
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Категория
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Цена
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Наличие
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.articleNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{product.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{product.category}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{product.price} ₽</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        product.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {product.stock} м
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">                      <button 
                        onClick={() => handleOpenModal(product)} 
                        className="action-btn action-btn-edit mr-3 flex items-center"
                      >
                        <FiEdit className="mr-1" />
                        Редактировать
                      </button>
                      <button 
                        onClick={() => handleOpenDeleteConfirm(product._id)} 
                        className="action-btn action-btn-delete flex items-center"
                      >
                        <FiTrash2 className="mr-1" />
                        Удалить
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Товары не найдены
            </div>
          )}
        </div>
      )}

      {/* Модальное окно добавления/редактирования товара */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">
                  {currentProduct ? 'Редактирование товара' : 'Добавление нового товара'}
                </h3>
                <button 
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              {formError && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 text-sm rounded-md">
                  {formError}
                </div>
              )}

              <form onSubmit={handleSaveProduct}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Название *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formState.name}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Артикул *
                    </label>
                    <input
                      type="text"
                      name="articleNumber"
                      value={formState.articleNumber}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Категория *
                    </label>
                    <select
                      name="category"
                      value={formState.category}
                      onChange={handleInputChange}
                      className="form-select w-full"
                      required
                    >
                      <option value="">Выберите категорию</option>
                      {catLoading ? (
                        <option disabled>Загрузка...</option>
                      ) : catError ? (
                        <option disabled>{catError}</option>
                      ) :
                        categories.map((cat: any) => (
                          <option key={cat._id} value={cat.slug}>{cat.name}</option>
                        ))
                      }
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Цена (руб.) *
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={formState.price}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Состав *
                    </label>
                    <input
                      type="text"
                      name="composition"
                      value={formState.composition}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Наличие (м) *
                    </label>
                    <input
                      type="number"
                      name="stock"
                      value={formState.stock}
                      onChange={handleInputChange}
                      min="0"
                      step="1"
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>
                </div>                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Описание *
                  </label>
                  <textarea
                    name="description"
                    value={formState.description}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  ></textarea>
                </div>

                {/* Загрузка изображений */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Изображения товара
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  {uploadingImage && (
                    <p className="text-sm text-blue-600 mt-1">Загрузка изображений...</p>
                  )}
                  
                  {/* Предпросмотр загруженных изображений */}
                  {formState.images && formState.images.length > 0 && (
                    <div className="mt-2 grid grid-cols-3 gap-2">
                      {formState.images.map((imageUrl, index) => (
                        <div key={index} className="relative">
                          <img 
                            src={imageUrl} 
                            alt={`Изображение ${index + 1}`}
                            className="w-full h-20 object-cover rounded border"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-0 right-0 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Отмена
                  </button>                  <button
                    type="submit"
                    className="px-4 py-2 btn-primary rounded-md"
                  >
                    {currentProduct ? 'Сохранить изменения' : 'Добавить товар'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно подтверждения удаления */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-medium mb-4">Подтверждение удаления</h3>
              <p className="text-gray-700 mb-4">
                Вы уверены, что хотите удалить этот товар? Это действие невозможно отменить.
              </p>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Отмена
                </button>
                <button
                  onClick={handleDeleteProduct}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Удалить
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Панель управления заказами
function OrdersPanel() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<any>(null);
  const [formState, setFormState] = useState({
    status: ''
  });
  const [formError, setFormError] = useState<string | null>(null);

  // Загрузка списка заказов
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/orders');
      const result = await response.json();
      
      if (result.success) {
        setOrders(result.data);
      } else {
        setError(result.message || 'Ошибка при загрузке заказов');
      }
    } catch (err) {
      setError('Ошибка при загрузке заказов');
      console.error('Ошибка при загрузке заказов:', err);
    } finally {
      setLoading(false);
    }
  };

  // Загрузка заказов при монтировании компонента
  useEffect(() => {
    fetchOrders();
  }, []);

  // Просмотр деталей заказа
  const handleViewOrder = async (orderId: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`);
      const result = await response.json();
      
      if (result.success) {
        setCurrentOrder(result.data);
        setFormState({
          status: result.data.status
        });
        setShowModal(true);
      } else {
        setError(result.message || 'Ошибка при загрузке информации о заказе');
      }
    } catch (err) {
      setError('Ошибка при загрузке информации о заказе');
      console.error('Ошибка при загрузке информации о заказе:', err);
    }
  };

  // Обработка изменения полей формы
  const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormState({
      ...formState,
      [name]: value,
    });
  };

  // Обновление статуса заказа
  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentOrder) return;
    
    try {
      const response = await fetch(`/api/orders/${currentOrder._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: formState.status
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Закрываем модальное окно и обновляем список заказов
        setShowModal(false);
        fetchOrders();
      } else {
        setFormError(result.message || 'Ошибка при обновлении статуса заказа');
      }
    } catch (err) {
      setFormError('Ошибка при обновлении статуса заказа');
      console.error('Ошибка при обновлении статуса заказа:', err);
    }
  };

  // Функция для определения цвета статуса
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'canceled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Функция для перевода статуса
  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Ожидает обработки';
      case 'processing':
        return 'В обработке';
      case 'shipped':
        return 'Отправлен';
      case 'delivered':
        return 'Доставлен';
      case 'canceled':
        return 'Отменен';
      default:
        return status;
    }
  };

  // Форматирование даты
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Управление заказами</h2>
      </div>
      
      {/* Сообщение об ошибке */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
          <button 
            className="ml-2 text-red-700" 
            onClick={() => setError(null)}
          >
            ✕
          </button>
        </div>
      )}

      {/* Индикатор загрузки */}
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-600"></div>
          <p className="mt-2 text-gray-500">Загрузка заказов...</p>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          {orders.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Номер заказа
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Покупатель
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Дата
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Сумма
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Статус
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.orderNumber || order._id.substring(0, 8)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{order.customerName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{formatDate(order.createdAt)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{order.totalAmount?.toLocaleString()} ₽</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => handleViewOrder(order._id)} 
                        className="text-emerald-600 hover:text-emerald-900"
                      >
                        Просмотреть
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Заказы не найдены
            </div>
          )}
        </div>
      )}

      {/* Модальное окно просмотра/редактирования заказа */}
      {showModal && currentOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">
                  Заказ №{currentOrder.orderNumber || currentOrder._id.substring(0, 8)}
                </h3>
                <button 
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              {formError && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 text-sm rounded-md">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <h4 className="text-sm font-semibold text-gray-500 uppercase mb-2">Информация о заказе</h4>
                  <p className="text-sm"><span className="font-medium">Дата:</span> {formatDate(currentOrder.createdAt)}</p>
                  <p className="text-sm"><span className="font-medium">Общая сумма:</span> {currentOrder.totalAmount?.toLocaleString()} ₽</p>
                  <p className="text-sm">
                    <span className="font-medium">Статус:</span> 
                    <span className={`ml-1 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(currentOrder.status)}`}>
                      {getStatusText(currentOrder.status)}
                    </span>
                  </p>
                </div>
                
                <div>
                  <h4 className="text-sm font-semibold text-gray-500 uppercase mb-2">Информация о покупателе</h4>
                  <p className="text-sm"><span className="font-medium">ФИО:</span> {currentOrder.customerName}</p>
                  <p className="text-sm"><span className="font-medium">Телефон:</span> {currentOrder.phone}</p>
                  <p className="text-sm"><span className="font-medium">Email:</span> {currentOrder.email}</p>
                  {currentOrder.address && (
                    <p className="text-sm"><span className="font-medium">Адрес:</span> {currentOrder.address}</p>
                  )}
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-500 uppercase mb-2">Состав заказа</h4>
                <div className="bg-gray-50 rounded-md p-3">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-2 py-2 text-left text-xs font-medium text-gray-500">Товар</th>
                        <th className="px-2 py-2 text-right text-xs font-medium text-gray-500">Цена</th>
                        <th className="px-2 py-2 text-right text-xs font-medium text-gray-500">Кол-во</th>
                        <th className="px-2 py-2 text-right text-xs font-medium text-gray-500">Сумма</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {currentOrder.items.map((item: any, index: number) => {
                        const product = typeof item.productId === 'object' ? item.productId : { name: 'Товар недоступен' };
                        return (
                          <tr key={index}>
                            <td className="px-2 py-2 text-sm text-gray-900">{product.name}</td>
                            <td className="px-2 py-2 text-sm text-gray-900 text-right">{item.price} ₽</td>
                            <td className="px-2 py-2 text-sm text-gray-900 text-right">{item.quantity} м</td>
                            <td className="px-2 py-2 text-sm text-gray-900 text-right">{(item.price * item.quantity).toLocaleString()} ₽</td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan={3} className="px-2 py-2 text-right font-medium">Итого:</td>
                        <td className="px-2 py-2 text-right font-medium">{currentOrder.totalAmount.toLocaleString()} ₽</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              <form onSubmit={handleUpdateStatus} className="mb-4">
                <div className="flex items-end space-x-4">
                  <div className="flex-grow">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Изменить статус заказа
                    </label>
                    <select
                      name="status"
                      value={formState.status}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="pending">Ожидает обработки</option>
                      <option value="processing">В обработке</option>
                      <option value="shipped">Отправлен</option>
                      <option value="delivered">Доставлен</option>
                      <option value="canceled">Отменен</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
                  >
                    Обновить статус
                  </button>
                </div>
              </form>

              <div className="flex justify-end">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Закрыть
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Панель управления пользователями
function UsersPanel() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    role: '',
    password: ''
  });
  const [formError, setFormError] = useState<string | null>(null);

  // Загрузка списка пользователей
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/users');
      const result = await response.json();
      
      if (result.success) {
        setUsers(result.data);
      } else {
        setError(result.message || 'Ошибка при загрузке пользователей');
      }
    } catch (err) {
      setError('Ошибка при загрузке пользователей');
      console.error('Ошибка при загрузке пользователей:', err);
    } finally {
      setLoading(false);
    }
  };

  // Загрузка пользователей при монтировании компонента
  useEffect(() => {
    fetchUsers();
  }, []);

  // Обработка открытия модального окна для добавления/редактирования
  const handleOpenModal = (user: any = null) => {
    if (user) {
      // Редактирование существующего пользователя
      setFormState({
        name: user.name,
        email: user.email,
        role: user.role,
        password: '' // Пароль не показываем при редактировании
      });
      setCurrentUser(user);
    } else {
      // Добавление нового пользователя
      setFormState({
        name: '',
        email: '',
        role: 'user',
        password: ''
      });
      setCurrentUser(null);
    }
    setFormError(null);
    setShowModal(true);
  };

  // Обработка изменения полей формы
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormState({
      ...formState,
      [name]: value,
    });
  };

  // Сохранение пользователя
  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Валидация
    if (!formState.name || !formState.email || (!currentUser && !formState.password)) {
      setFormError('Пожалуйста, заполните все обязательные поля');
      return;
    }

    try {
      // Подготовка данных для отправки
      const userData: any = {
        name: formState.name,
        email: formState.email,
        role: formState.role
      };
      
      // Добавляем пароль только при создании нового пользователя или если он был изменен
      if (formState.password) {
        userData.password = formState.password;
      }

      let response;
      
      if (currentUser) {
        // Обновление пользователя
        response = await fetch(`/api/users/${currentUser._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userData),
        });
      } else {
        // Создание нового пользователя
        response = await fetch('/api/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userData),
        });
      }

      const result = await response.json();
      
      if (result.success) {
        // Закрываем модальное окно и обновляем список пользователей
        setShowModal(false);
        fetchUsers();
      } else {
        setFormError(result.message || 'Ошибка при сохранении пользователя');
      }
    } catch (err) {
      setFormError('Ошибка при сохранении пользователя');
      console.error('Ошибка при сохранении пользователя:', err);
    }
  };

  // Открытие подтверждения удаления
  const handleOpenDeleteConfirm = (id: string) => {
    setDeleteId(id);
    setShowDeleteConfirm(true);
  };

  // Удаление пользователя
  const handleDeleteUser = async () => {
    if (!deleteId) return;
    
    try {
      const response = await fetch(`/api/users/${deleteId}`, {
        method: 'DELETE',
      });
      
      const result = await response.json();
      
      if (result.success) {
        setShowDeleteConfirm(false);
        fetchUsers();
      } else {
        setError(result.message || 'Ошибка при удалении пользователя');
      }
    } catch (err) {
      setError('Ошибка при удалении пользователя');
      console.error('Ошибка при удалении пользователя:', err);
    }
  };

  // Форматирование даты
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Управление пользователями</h2>
        <button 
          onClick={() => handleOpenModal()} 
          className="bg-emerald-600 text-white px-4 py-2 rounded-md flex items-center hover:bg-emerald-700 transition"
        >
          <FiPlus className="mr-2" />
          Добавить пользователя
        </button>
      </div>
      
      {/* Сообщение об ошибке */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
          <button 
            className="ml-2 text-red-700" 
            onClick={() => setError(null)}
          >
            ✕
          </button>
        </div>
      )}

      {/* Индикатор загрузки */}
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-600"></div>
          <p className="mt-2 text-gray-500">Загрузка пользователей...</p>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          {users.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Имя
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Роль
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Дата регистрации
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user.role === 'admin' ? 'Администратор' : 'Пользователь'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{formatDate(user.createdAt)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => handleOpenModal(user)} 
                        className="text-emerald-600 hover:text-emerald-900 mr-3"
                      >
                        Редактировать
                      </button>
                      <button 
                        onClick={() => handleOpenDeleteConfirm(user._id)} 
                        className="text-red-600 hover:text-red-900"
                      >
                        Удалить
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Пользователи не найдены
            </div>
          )}
        </div>
      )}

      {/* Модальное окно добавления/редактирования пользователя */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">
                  {currentUser ? 'Редактирование пользователя' : 'Добавление нового пользователя'}
                </h3>
                <button 
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              {formError && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 text-sm rounded-md">
                  {formError}
                </div>
              )}

              <form onSubmit={handleSaveUser}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Имя *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formState.name}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formState.email}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Роль *
                  </label>
                  <select
                    name="role"
                    value={formState.role}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  >
                    <option value="user">Пользователь</option>
                    <option value="admin">Администратор</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {currentUser ? 'Новый пароль (оставьте пустым, чтобы не менять)' : 'Пароль *'}
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formState.password}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required={!currentUser}
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
                  >
                    {currentUser ? 'Сохранить изменения' : 'Добавить пользователя'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно подтверждения удаления */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-medium mb-4">Подтверждение удаления</h3>
              <p className="text-gray-700 mb-4">
                Вы уверены, что хотите удалить этого пользователя? Это действие невозможно отменить.
              </p>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Отмена
                </button>
                <button
                  onClick={handleDeleteUser}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Удалить
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Панель настроек
function SettingsPanel() {
  const [formState, setFormState] = useState({
    shopName: '',
    shopDescription: '',
    shopPhone: '',
    shopEmail: '',
    shopAddress: '',
    enablePickup: true,
    enableDelivery: true,
    enableCash: true,
    enableCard: true
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);

  // Загрузка настроек при открытии панели
  useEffect(() => {
    const fetchSettings = async () => {
      setInitialLoading(true);
      try {
        const res = await fetch('/api/settings');
        const data = await res.json();
        if (data.success && data.data) {
          setFormState(data.data);
        } else {
          setError(data.message || 'Ошибка при загрузке настроек');
        }
      } catch (e) {
        setError('Ошибка при загрузке настроек');
      } finally {
        setInitialLoading(false);
      }
    };
    fetchSettings();
  }, []);

  // Обработка изменения полей формы
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    setFormState({
      ...formState,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    });
  };

  // Сохранение настроек
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formState),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setFormState(data.data);
        setSuccess(true);
      } else {
        setError(data.message || 'Ошибка при сохранении настроек');
      }
    } catch (err) {
      setError('Ошибка при сохранении настроек');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return <div>Загрузка настроек...</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Настройки магазина</h2>
      
      {/* Сообщение об успехе */}
      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
          Настройки успешно сохранены
          <button 
            className="ml-2 text-green-700" 
            onClick={() => setSuccess(false)}
          >
            ✕
          </button>
        </div>
      )}
      
      {/* Сообщение об ошибке */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
          <button 
            className="ml-2 text-red-700" 
            onClick={() => setError(null)}
          >
            ✕
          </button>
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg p-6">
        <form onSubmit={handleSaveSettings} className="max-w-xl">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Название магазина
              </label>
              <input
                type="text"
                name="shopName"
                value={formState.shopName}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Описание магазина
              </label>
              <textarea
                name="shopDescription"
                value={formState.shopDescription}
                onChange={handleInputChange}
                rows={3}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              ></textarea>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Телефон
              </label>
              <input
                type="text"
                name="shopPhone"
                value={formState.shopPhone}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="shopEmail"
                value={formState.shopEmail}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Адрес
              </label>
              <input
                type="text"
                name="shopAddress"
                value={formState.shopAddress}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            
            <div className="pt-4">
              <h3 className="text-lg font-medium mb-3">Способы получения</h3>
              
              <div className="flex items-center mb-2">
                <input
                  type="checkbox"
                  id="enablePickup"
                  name="enablePickup"
                  checked={formState.enablePickup}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                />
                <label htmlFor="enablePickup" className="ml-2 text-sm text-gray-700">
                  Самовывоз из магазина
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="enableDelivery"
                  name="enableDelivery"
                  checked={formState.enableDelivery}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                />
                <label htmlFor="enableDelivery" className="ml-2 text-sm text-gray-700">
                  Доставка курьером
                </label>
              </div>
            </div>
            
            <div className="pt-2">
              <h3 className="text-lg font-medium mb-3">Способы оплаты</h3>
              
              <div className="flex items-center mb-2">
                <input
                  type="checkbox"
                  id="enableCash"
                  name="enableCash"
                  checked={formState.enableCash}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                />
                <label htmlFor="enableCash" className="ml-2 text-sm text-gray-700">
                  Наличными при получении
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="enableCard"
                  name="enableCard"
                  checked={formState.enableCard}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                />
                <label htmlFor="enableCard" className="ml-2 text-sm text-gray-700">
                  Банковской картой онлайн
                </label>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 flex items-center"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  Сохранение...
                </>
              ) : (
                'Сохранить настройки'
              )}
            </button>
          </div>
        </form>
      </div>    </div>
  );
}

// Панель управления категориями
function CategoriesPanel() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<any>(null);
  const [formState, setFormState] = useState({ name: '', slug: '', image: '' });
  const [formError, setFormError] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Загрузка категорий
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/categories');
      const result = await response.json();
      if (result.success) {
        setCategories(result.data);
      } else {
        setError(result.message || 'Ошибка при загрузке категорий');
      }
    } catch (err) {
      setError('Ошибка при загрузке категорий');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleOpenModal = (category: any = null) => {
    if (category) {
      setFormState({ name: category.name, slug: category.slug, image: category.image || '' });
      setCurrentCategory(category);
    } else {
      setFormState({ name: '', slug: '', image: '' });
      setCurrentCategory(null);
    }
    setFormError(null);
    setShowModal(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormState({ ...formState, [e.target.name]: e.target.value });
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    try {
      const method = currentCategory ? 'PUT' : 'POST';
      const url = currentCategory ? `/api/categories/${currentCategory._id}` : '/api/categories';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formState),
      });
      const result = await response.json();
      if (result.success) {
        setShowModal(false);
        fetchCategories();
      } else {
        setFormError(result.message || 'Ошибка при сохранении категории');
      }
    } catch (err) {
      setFormError('Ошибка при сохранении категории');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!window.confirm('Удалить категорию?')) return;
    try {
      const response = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      const result = await response.json();
      if (result.success) {
        fetchCategories();
      } else {
        alert(result.message || 'Ошибка при удалении');
      }
    } catch (err) {
      alert('Ошибка при удалении');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Категории</h2>
        <button className="btn px-4 py-2" onClick={() => handleOpenModal()}>Добавить категорию</button>
      </div>
      {loading ? (
        <div>Загрузка...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <div key={cat._id} className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
              {cat.image ? (
                <img src={cat.image} alt={cat.name} className="w-32 h-32 object-cover rounded mb-2" />
              ) : (
                <div className="w-32 h-32 bg-gray-200 rounded mb-2 flex items-center justify-center text-gray-400">Нет фото</div>
              )}
              <div className="font-bold mb-1">{cat.name}</div>
              <div className="text-xs text-gray-500 mb-2">{cat.slug}</div>
              <div className="flex space-x-2">
                <button className="btn px-2 py-1 text-xs" onClick={() => handleOpenModal(cat)}>Редактировать</button>
                <button className="btn px-2 py-1 text-xs bg-red-100 text-red-600" onClick={() => handleDeleteCategory(cat._id)}>Удалить</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Модальное окно для добавления/редактирования */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" onClick={() => setShowModal(false)}>&times;</button>
            <h3 className="text-lg font-bold mb-4">{currentCategory ? 'Редактировать' : 'Добавить'} категорию</h3>
            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div>
                <label className="block text-sm mb-1">Название (рус.)</label>
                <input type="text" name="name" value={formState.name} onChange={handleInputChange} className="form-input w-full" required />
              </div>
              <div>
                <label className="block text-sm mb-1">Slug (англ.)</label>
                <input type="text" name="slug" value={formState.slug} onChange={handleInputChange} className="form-input w-full" required />
              </div>
              <div>
                <label className="block text-sm mb-1">Ссылка на фото</label>
                <div
                  className={`border-2 border-dashed rounded p-3 text-center cursor-pointer ${uploadingImage ? 'bg-gray-100' : 'hover:bg-pink-50'}`}
                  onDragOver={e => { e.preventDefault(); e.stopPropagation(); }}
                  onDrop={async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (!e.dataTransfer.files || e.dataTransfer.files.length === 0) return;
                    setUploadingImage(true);
                    const file = e.dataTransfer.files[0];
                    const formData = new FormData();
                    formData.append('file', file);
                    try {
                      const res = await fetch('/api/upload', { method: 'POST', body: formData });
                      const data = await res.json();
                      if (data.success && data.url) {
                        setFormState(fs => ({ ...fs, image: data.url }));
                      } else {
                        alert(data.message || 'Ошибка загрузки');
                      }
                    } catch {
                      alert('Ошибка загрузки');
                    } finally {
                      setUploadingImage(false);
                    }
                  }}
                >
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="category-image-upload"
                    onChange={async (e) => {
                      if (!e.target.files || e.target.files.length === 0) return;
                      setUploadingImage(true);
                      const file = e.target.files[0];
                      const formData = new FormData();
                      formData.append('file', file);
                      try {
                        const res = await fetch('/api/upload', { method: 'POST', body: formData });
                        const data = await res.json();
                        if (data.success && data.url) {
                          setFormState(fs => ({ ...fs, image: data.url }));
                        } else {
                          alert(data.message || 'Ошибка загрузки');
                        }
                      } catch {
                        alert('Ошибка загрузки');
                      } finally {
                        setUploadingImage(false);
                      }
                    }}
                    disabled={uploadingImage}
                  />
                  <label htmlFor="category-image-upload" className="block cursor-pointer">
                    {uploadingImage ? (
                      <span className="text-pink-500">Загрузка...</span>
                    ) : formState.image ? (
                      <img src={formState.image} alt="Превью" className="w-24 h-24 object-cover rounded mx-auto mb-2" />
                    ) : (
                      <span className="text-gray-400">Перетащите файл или кликните для выбора</span>
                    )}
                  </label>
                  {formState.image && !uploadingImage && (
                    <button
                      type="button"
                      className="mt-2 text-xs text-red-500 underline hover:text-red-700"
                      onClick={() => setFormState(fs => ({ ...fs, image: '' }))}
                    >Удалить фото</button>
                  )}
                </div>
                <input type="text" name="image" value={formState.image} onChange={handleInputChange} className="form-input w-full mt-2" placeholder="URL изображения (опционально)" />
              </div>
              {formError && <div className="text-red-500 text-sm">{formError}</div>}
              <div className="flex justify-end">
                <button type="submit" className="btn px-4 py-2" disabled={uploadingImage}>Сохранить</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

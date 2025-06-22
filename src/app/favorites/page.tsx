"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FaHeart, FaCrown } from "react-icons/fa";
import { useSession } from "next-auth/react";
import apiClient from "@/lib/apiClient";

export default function FavoritesPage() {
  const { data: session, status } = useSession();
  const [favorites, setFavorites] = useState<string[]>([]); // массив productId
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Загрузка избранного
  useEffect(() => {
    const fetchFavorites = async () => {
      setLoading(true);
      let favIds: string[] = [];
      if (status === "authenticated") {
        // Для авторизованных — запрос к API (реализуем позже)
        try {
          const res = await apiClient.get("/api/favorites");
          if (res.success && res.data) favIds = res.data;
        } catch {}
      } else {
        // Для неавторизованных — localStorage
        const saved = localStorage.getItem("favorites");
        if (saved) favIds = JSON.parse(saved);
      }
      setFavorites(favIds);
      // Получаем товары по id
      if (favIds.length > 0) {
        const prods = await Promise.all(
          favIds.map(async (id) => {
            const res = await fetch(`/api/products/${id}`);
            const data = await res.json();
            return data.success && data.data ? data.data : null;
          })
        );
        setProducts(prods.filter(Boolean));
      } else {
        setProducts([]);
      }
      setLoading(false);
    };
    fetchFavorites();
  }, [status]);

  // Удалить из избранного
  const removeFavorite = async (id: string) => {
    let newFavs = favorites.filter((fid) => fid !== id);
    setFavorites(newFavs);
    setProducts(products.filter((p) => p._id !== id));
    if (status === "authenticated") {
      // TODO: запрос к API
      await apiClient.post("/api/favorites", { productId: id, action: "remove" });
    } else {
      localStorage.setItem("favorites", JSON.stringify(newFavs));
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
        <FaHeart className="text-pink-500" /> Избранное
      </h1>
      {loading ? (
        <div>Загрузка...</div>
      ) : products.length === 0 ? (
        <div className="text-gray-500">Нет избранных товаров</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product._id} className="product-card relative">
              <button
                className="absolute top-3 right-3 text-pink-500 hover:text-pink-700 z-10"
                onClick={() => removeFavorite(product._id)}
                title="Убрать из избранного"
              >
                <FaHeart />
              </button>
              <Link href={`/product/${product.slug || product._id}`}>
                <div className="h-64 bg-gray-200 relative">
                  {product.images && product.images.length > 0 ? (
                    <Image
                      src={product.images[0].startsWith('http') ? product.images[0] : '/' + product.images[0].replace(/^\/+/, '')}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/vercel.svg';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-200">Нет фото</div>
                  )}
                  <div className="absolute top-3 left-3 text-amber-500 text-sm">
                    <FaCrown />
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-medium mb-2 hover:text-pink-600 transition">{product.name}</h3>
                  <p className="product-price">{product.price} ₽/м</p>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 
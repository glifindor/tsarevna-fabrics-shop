import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

// Типы ответов API
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: any;
  pagination?: {
    page: number;
    limit: number;
    totalPages: number;
    totalItems: number;
  };
}

// Настраиваем базовые параметры axios
const api = axios.create({
  baseURL: '',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Обработчик успешных ответов
const handleSuccess = <T>(response: AxiosResponse<ApiResponse<T>>): ApiResponse<T> => {
  console.log('API Response:', response.config.url, response.data);
  return response.data;
};

// Обработчик ошибок
const handleError = (error: AxiosError<ApiResponse>): ApiResponse => {
  // Если сервер вернул ошибку с сообщением
  if (error.response) {
    return error.response.data;
  }

  // Если проблема с сетью или запрос был прерван
  if (error.request) {
    return {
      success: false,
      message: 'Не удалось получить ответ от сервера. Проверьте подключение к интернету.',
    };
  }

  // Ошибка при формировании запроса
  return {
    success: false,
    message: 'Произошла ошибка при отправке запроса.',
    error: error.message,
  };
};

// Функции для работы с API
export const apiClient = {
  // GET запрос
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      console.log(`API GET запрос: ${url}`, config);
      const response = await api.get<ApiResponse<T>>(url, config);
      console.log(`API GET ответ: ${url}`, response.data);
      return handleSuccess<T>(response);
    } catch (error) {
      console.error(`API GET ошибка: ${url}`, error);
      return handleError(error as AxiosError<ApiResponse>);
    }
  },

  // POST запрос
  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      console.log(`API POST запрос: ${url}`, { data, config });
      const response = await api.post<ApiResponse<T>>(url, data, config);
      console.log(`API POST ответ: ${url}`, response.data);
      return handleSuccess<T>(response);
    } catch (error) {
      console.error(`API POST ошибка: ${url}`, error);
      return handleError(error as AxiosError<ApiResponse>);
    }
  },

  // PUT запрос
  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await api.put<ApiResponse<T>>(url, data, config);
      return handleSuccess<T>(response);
    } catch (error) {
      return handleError(error as AxiosError<ApiResponse>);
    }
  },

  // DELETE запрос
  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await api.delete<ApiResponse<T>>(url, config);
      return handleSuccess<T>(response);
    } catch (error) {
      return handleError(error as AxiosError<ApiResponse>);
    }
  },
};

export default apiClient;

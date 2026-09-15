import api from "./axios";
import type { Category, Product } from "../types";

export interface ProductFilters {
  categoryId?: number | null;
  search?: string;
  lowStock?: boolean;
}

export interface CreateProductPayload {
  name: string;
  category_id: number;
  price: number;
  stock: number;
  unit?: string;
}

export type UpdateProductPayload = CreateProductPayload;

export interface ProductResponse {
  id: number;
  message: string;
}

export const getProducts = async (
  filters: ProductFilters = {},
): Promise<Product[]> => {
  const response = await api.get<Product[]>("/products", {
    params: {
      category_id: filters.categoryId ?? undefined,
      search: filters.search || undefined,
      low_stock: filters.lowStock || undefined,
    },
  });

  return response.data;
};

export const createProduct = async (
  product: CreateProductPayload,
): Promise<ProductResponse> => {
  const response = await api.post<ProductResponse>("/products", product);

  return response.data;
};

export const updateProduct = async (
  id: number,
  product: UpdateProductPayload,
): Promise<ProductResponse> => {
  const response = await api.put<ProductResponse>(
    `/products/${id}`,
    product,
  );

  return response.data;
};

export const deleteProduct = async (
  id: number,
): Promise<ProductResponse> => {
  const response = await api.delete<ProductResponse>(`/products/${id}`);

  return response.data;
};

export const getCategories = async (): Promise<Category[]> => {
  const response = await api.get<Category[]>("/categories");

  return response.data;
};
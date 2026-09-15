import api from "./axios";
import type { Sale } from "../types";

export interface SaleFilters {
  productId?: number | null;
  fromDate?: string;
  toDate?: string;
  soldBy?: number | null;
  search?: string;
}

export interface CreateSalePayload {
  product_id: number;
  quantity: number;
  sold_on: string;
}

export const getSales = async (
  filters: SaleFilters = {},
): Promise<Sale[]> => {
  const response = await api.get<Sale[]>("/sales", {
    params: {
      product_id: filters.productId ?? undefined,
      from: filters.fromDate || undefined,
      to: filters.toDate || undefined,
      sold_by: filters.soldBy ?? undefined,
      search: filters.search || undefined,
    },
  });

  return response.data;
};

export const createSale = async (
  sale: CreateSalePayload,
): Promise<Sale> => {
  const response = await api.post<Sale>("/sales", sale);

  return response.data;
};
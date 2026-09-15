
import api from "./axios";

import type {
  CategoryRevenue,
  KPIs,
  MonthlyRevenue,
  TopProduct,
} from "../types";

export interface AnalyticsFilters {
  fromDate?: string;
  toDate?: string;
  categoryId?: number | null;
}

export const getKPIs = async (
  filters: AnalyticsFilters = {},
): Promise<KPIs> => {
  const response = await api.get<KPIs>("/analytics/kpis", {
    params: {
      from: filters.fromDate || undefined,
      to: filters.toDate || undefined,
      category_id: filters.categoryId ?? undefined,
    },
  });

  return response.data;
};

interface CategoryRevenueResponse {
  category_id: number;
  category_name: string;
  revenue: string | number;
}

export const getCategoryRevenue = async (
  filters: AnalyticsFilters = {},
): Promise<CategoryRevenue[]> => {
  const response = await api.get<CategoryRevenueResponse[]>(
    "/analytics/by-category",
    {
      params: {
        from: filters.fromDate || undefined,
        to: filters.toDate || undefined,
        category_id: filters.categoryId ?? undefined,
      },
    },
  );

  return response.data.map((item) => ({
    category: item.category_name,
    revenue: Number(item.revenue),
  }));
};

export const getMonthlyRevenue = async (
  filters: AnalyticsFilters = {},
): Promise<MonthlyRevenue[]> => {
  const response = await api.get<MonthlyRevenue[]>(
    "/analytics/monthly-revenue",
    {
      params: {
        from: filters.fromDate || undefined,
        to: filters.toDate || undefined,
        category_id: filters.categoryId ?? undefined,
      },
    },
  );

  return response.data;
};

export const getTopProducts = async (
  filters: AnalyticsFilters = {},
): Promise<TopProduct[]> => {
  const response = await api.get<TopProduct[]>(
    "/analytics/top-products",
    {
      params: {
        from: filters.fromDate || undefined,
        to: filters.toDate || undefined,
        category_id: filters.categoryId ?? undefined,
      },
    },
  );

  return response.data;
};


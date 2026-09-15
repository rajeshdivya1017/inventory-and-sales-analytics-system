import { useQuery } from "@tanstack/react-query";

import {
  getCategoryRevenue,
  getKPIs,
  getMonthlyRevenue,
  getTopProducts,
  type AnalyticsFilters,
} from "../api/analytics";

export const useKPIs = (filters: AnalyticsFilters = {}) => {
  return useQuery({
    queryKey: ["analytics", "kpis", filters],
    queryFn: () => getKPIs(filters),
    refetchInterval: 30000,
  });
};

export const useCategoryRevenue = (
  filters: AnalyticsFilters = {},
) => {
  return useQuery({
    queryKey: ["analytics", "category-revenue", filters],
    queryFn: () => getCategoryRevenue(filters),
    refetchInterval: 30000,
  });
};

export const useMonthlyRevenue = (
  filters: AnalyticsFilters = {},
) => {
  return useQuery({
    queryKey: ["analytics", "monthly-revenue", filters],
    queryFn: () => getMonthlyRevenue(filters),
    refetchInterval: 30000,
  });
};

export const useTopProducts = (
  filters: AnalyticsFilters = {},
) => {
  return useQuery({
    queryKey: ["analytics", "top-products", filters],
    queryFn: () => getTopProducts(filters),
    refetchInterval: 30000,
  });
};
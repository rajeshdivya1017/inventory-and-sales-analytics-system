import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createSale,
  getSales,
  type CreateSalePayload,
  type SaleFilters,
} from "../api/sales";

export const useSales = (filters: SaleFilters = {}) => {
  return useQuery({
    queryKey: ["sales", filters],
    queryFn: () => getSales(filters),
  });
};

export const useCreateSale = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sale: CreateSalePayload) =>
      createSale(sale),

    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["sales"],
      });

      void queryClient.invalidateQueries({
        queryKey: ["products"],
      });

      void queryClient.invalidateQueries({
        queryKey: ["analytics"],
      });
    },
  });
};
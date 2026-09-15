import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createProduct,
  deleteProduct,
  getProducts,
  updateProduct,
  type CreateProductPayload,
  type ProductFilters,
  type UpdateProductPayload,
} from "../api/products";

export const useProducts = (filters: ProductFilters = {}) => {
  return useQuery({
    queryKey: ["products", filters],
    queryFn: () => getProducts(filters),
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (product: CreateProductPayload) =>
      createProduct(product),

    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["products"],
      });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      product,
    }: {
      id: number;
      product: UpdateProductPayload;
    }) => updateProduct(id, product),

    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["products"],
      });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteProduct(id),

    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["products"],
      });
    },
  });
};
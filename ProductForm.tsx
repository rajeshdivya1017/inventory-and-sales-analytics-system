
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { getCategories } from "../api/products";
import { productSchema, type ProductFormData } from "../schemas";
import type { Product } from "../types";

interface ProductFormProps {
  product?: Product;
  onSubmit: (data: ProductFormData) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

const ProductForm = ({
  product,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: ProductFormProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      category_id: 0,
      price: 0,
      stock: 0,
      unit: "",
    },
  });

  const { data: categories = [], isLoading: categoriesLoading } =
    useQuery({
      queryKey: ["categories"],
      queryFn: getCategories,
    });

  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        category_id: product.category_id,
        price: product.price,
        stock: product.stock,
        unit: product.unit,
      });
    }
  }, [product, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label
          htmlFor="name"
          className="mb-1 block text-sm font-medium"
        >
          Product Name
        </label>

        <input
          id="name"
          type="text"
          {...register("name")}
          placeholder="Enter product name"
          autoComplete="off"
          className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-gray-300"
        />

        {errors.name && (
          <p className="mt-1 text-sm text-red-600">
            {errors.name.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="category_id"
          className="mb-1 block text-sm font-medium"
        >
          Category
        </label>

        <select
          id="category_id"
          {...register("category_id", { valueAsNumber: true })}
          disabled={categoriesLoading}
          className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-gray-300"
        >
          <option value={0}>
            {categoriesLoading
              ? "Loading categories..."
              : "Select category"}
          </option>

          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>

        {errors.category_id && (
          <p className="mt-1 text-sm text-red-600">
            {errors.category_id.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="price"
          className="mb-1 block text-sm font-medium"
        >
          Price
        </label>

        <input
          id="price"
          type="number"
          step="0.01"
          min="0.01"
          {...register("price", { valueAsNumber: true })}
          placeholder="Enter price"
          className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-gray-300"
        />

        {errors.price && (
          <p className="mt-1 text-sm text-red-600">
            {errors.price.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="stock"
          className="mb-1 block text-sm font-medium"
        >
          Stock
        </label>

        <input
          id="stock"
          type="number"
          min="0"
          {...register("stock", { valueAsNumber: true })}
          placeholder="Enter stock quantity"
          className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-gray-300"
        />

        {errors.stock && (
          <p className="mt-1 text-sm text-red-600">
            {errors.stock.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="unit"
          className="mb-1 block text-sm font-medium"
        >
          Unit
        </label>

        <input
          id="unit"
          type="text"
          {...register("unit")}
          placeholder="e.g. piece, box, kg"
          className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-gray-300"
        />

        {errors.unit && (
          <p className="mt-1 text-sm text-red-600">
            {errors.unit.message}
          </p>
        )}
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isSubmitting || categoriesLoading}
          className="rounded-md border px-4 py-2 font-medium transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting
            ? "Saving..."
            : product
              ? "Update Product"
              : "Add Product"}
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border px-4 py-2 transition-colors hover:bg-gray-50"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default ProductForm;


import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { saleSchema, type SaleFormData } from "../schemas";
import type { Product } from "../types";

interface SaleFormProps {
  products: Product[];
  onSubmit: (data: SaleFormData) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

const SaleForm = ({
  products,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: SaleFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SaleFormData>({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      product_id: 0,
      quantity: 1,
      sold_on: new Date().toISOString(),
    },
  });

  const availableProducts = products.filter(
    (product) => product.stock > 0,
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label
          htmlFor="product_id"
          className="mb-1 block text-sm font-medium"
        >
          Product
        </label>

        <select
          id="product_id"
          {...register("product_id", { valueAsNumber: true })}
          disabled={availableProducts.length === 0 || isSubmitting}
          className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-gray-300 disabled:cursor-not-allowed disabled:bg-gray-100"
        >
          <option value={0}>
            {availableProducts.length === 0
              ? "No products available"
              : "Select Product"}
          </option>

          {availableProducts.map((product) => (
            <option key={product.id} value={product.id}>
              {product.name} — Stock: {product.stock}
            </option>
          ))}
        </select>

        {errors.product_id && (
          <p className="mt-1 text-sm text-red-600">
            {errors.product_id.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="quantity"
          className="mb-1 block text-sm font-medium"
        >
          Quantity
        </label>

        <input
          id="quantity"
          type="number"
          min="1"
          {...register("quantity", { valueAsNumber: true })}
          disabled={isSubmitting || availableProducts.length === 0}
          className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-gray-300 disabled:cursor-not-allowed disabled:bg-gray-100"
        />

        {errors.quantity && (
          <p className="mt-1 text-sm text-red-600">
            {errors.quantity.message}
          </p>
        )}
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={
            isSubmitting || availableProducts.length === 0
          }
          className="rounded-md border px-4 py-2 font-medium transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? "Saving..." : "Record Sale"}
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="rounded-md border px-4 py-2 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default SaleForm;
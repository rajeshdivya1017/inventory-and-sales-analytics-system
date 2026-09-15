import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import {
  getCategories,
  type ProductFilters,
} from "../api/products";
import {
  useCreateProduct,
  useDeleteProduct,
  useProducts,
  useUpdateProduct,
} from "../hooks/useProducts";
import { useDebounce } from "../hooks/useDebounce";
import { useToast } from "../hooks/useToast";
import ProductForm from "../components/ProductForm";
import type { Product } from "../types";
import { type ProductFormData } from "../schemas";
import { useAuth } from "../context/AuthContext";

const ProductsPage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [lowStock, setLowStock] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] =
    useState<Product | undefined>(undefined);

  const debouncedSearch = useDebounce(search, 300);

  const filters: ProductFilters = {
    search: debouncedSearch.trim() || undefined,
    categoryId,
    lowStock: lowStock || undefined,
  };

  const {
    data: products,
    isLoading: productsLoading,
    isError: productsError,
  } = useProducts(filters);

  const {
    data: categories,
    isLoading: categoriesLoading,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const deleteMutation = useDeleteProduct();

  const isAdmin = user?.role === "admin";

  const handleAdd = () => {
    setEditingProduct(undefined);
    setShowForm(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingProduct(undefined);
  };

  const handleSubmit = async (data: ProductFormData) => {
    try {
      if (editingProduct) {
        await updateMutation.mutateAsync({
          id: editingProduct.id,
          product: data,
        });

        showToast("Product updated successfully", "success");
      } else {
        await createMutation.mutateAsync(data);

        showToast("Product added successfully", "success");
      }

      handleCancel();
    } catch {
      showToast(
        editingProduct
          ? "Unable to update product"
          : "Unable to add product",
        "error",
      );
    }
  };

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?",
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(id);
      showToast("Product deleted successfully", "success");
    } catch {
      showToast(
        "Unable to delete product. It may have existing sales.",
        "error",
      );
    }
  };

  const isSubmitting =
    createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-sm text-gray-500">
            Manage and view inventory products
          </p>
        </div>

        {isAdmin && (
          <button
            type="button"
            onClick={handleAdd}
            className="rounded-md border px-4 py-2"
          >
            Add Product
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <input
          type="search"
          placeholder="Search products..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="rounded-md border px-3 py-2"
        />

        <select
          value={categoryId ?? ""}
          onChange={(event) => {
            const value = event.target.value;
            setCategoryId(value ? Number(value) : null);
          }}
          className="rounded-md border px-3 py-2"
          disabled={categoriesLoading}
        >
          <option value="">All Categories</option>

          {categories?.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>

        <label className="flex items-center gap-2 rounded-md border px-3 py-2">
          <input
            type="checkbox"
            checked={lowStock}
            onChange={(event) => setLowStock(event.target.checked)}
          />
          Low Stock
        </label>

        <button
          type="button"
          onClick={() => {
            setSearch("");
            setCategoryId(null);
            setLowStock(false);
          }}
          className="rounded-md border px-4 py-2"
        >
          Reset
        </button>
      </div>

      {showForm && isAdmin && (
        <div className="rounded-lg border bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold">
            {editingProduct ? "Edit Product" : "Add Product"}
          </h2>

          <ProductForm
            product={editingProduct}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={isSubmitting}
          />
        </div>
      )}

      {productsLoading && <div>Loading products...</div>}

      {productsError && (
        <div>Unable to load products.</div>
      )}

      {!productsLoading &&
        !productsError &&
        products &&
        products.length === 0 && (
          <div>No products found.</div>
        )}

      {!productsLoading &&
        !productsError &&
        products &&
        products.length > 0 && (
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-3 font-medium">
                    Product
                  </th>
                  <th className="px-4 py-3 font-medium">
                    Category
                  </th>
                  <th className="px-4 py-3 font-medium">
                    Price
                  </th>
                  <th className="px-4 py-3 font-medium">
                    Stock
                  </th>
                  <th className="px-4 py-3 font-medium">
                    Unit
                  </th>
                  {isAdmin && (
                    <th className="px-4 py-3 font-medium">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>

              <tbody>
                {products.map((product) => (
                  <tr
                    key={product.id}
                    className={`border-b last:border-b-0 ${
                      product.stock <= 10
                        ? "bg-amber-50"
                        : ""
                    }`}
                  >
                    <td className="px-4 py-3">
                      {product.name}
                    </td>

                    <td className="px-4 py-3">
                      {product.category_name}
                    </td>

                    <td className="px-4 py-3">
                      ₹{product.price.toLocaleString()}
                    </td>

                    <td className="px-4 py-3">
                      {product.stock}
                    </td>

                    <td className="px-4 py-3">
                      {product.unit}
                    </td>

                    {isAdmin && (
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleEdit(product)}
                            className="rounded-md border px-3 py-1"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              void handleDelete(product.id)
                            }
                            disabled={deleteMutation.isPending}
                            className="rounded-md border px-3 py-1"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
    </div>
  );
};

export default ProductsPage;
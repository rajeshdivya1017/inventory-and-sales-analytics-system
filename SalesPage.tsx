import { useMemo, useState } from "react";

import {
  useCreateSale,
  useSales,
} from "../hooks/useSales";
import { useProducts } from "../hooks/useProducts";
import { useDebounce } from "../hooks/useDebounce";
import { useToast } from "../hooks/useToast";
import { useFilterStore } from "../store/useFilterStore";
import SaleForm from "../components/SalesForm";
import type { Sale } from "../types";
import type { SaleFormData } from "../schemas";

const SalesPage = () => {
  const [showForm, setShowForm] = useState(false);

  const {
    productId,
    soldBy,
    fromDate,
    toDate,
    search,
    setProductId,
    setSoldBy,
    setFromDate,
    setToDate,
    setSearch,
    resetFilters,
  } = useFilterStore();

  const debouncedSearch = useDebounce(search, 300);

  const {
    data: products,
    isLoading: productsLoading,
    isError: productsError,
  } = useProducts();

  const salesFilters = {
    productId,
    soldBy,
    fromDate: fromDate || undefined,
    toDate: toDate || undefined,
  };

  const {
    data: sales,
    isLoading: salesLoading,
    isError: salesError,
  } = useSales(salesFilters);

  const createSaleMutation = useCreateSale();
  const { showToast } = useToast();

  const filteredSales = useMemo(() => {
    if (!sales) {
      return [];
    }

    const searchValue = debouncedSearch.trim().toLowerCase();

    if (!searchValue) {
      return sales;
    }

    return sales.filter((sale) => {
      const productName = sale.product_name.toLowerCase();
      const sellerName = sale.seller_name.toLowerCase();

      return (
        productName.includes(searchValue) ||
        sellerName.includes(searchValue)
      );
    });
  }, [sales, debouncedSearch]);

  const sellers = useMemo(() => {
    if (!sales) {
      return [];
    }

    const uniqueSellers = new Map<number, string>();

    sales.forEach((sale) => {
      uniqueSellers.set(sale.sold_by, sale.seller_name);
    });

    return Array.from(uniqueSellers.entries()).map(
      ([id, name]) => ({
        id,
        name,
      }),
    );
  }, [sales]);

  const handleSubmit = async (data: SaleFormData) => {
    try {
      await createSaleMutation.mutateAsync({
        ...data,
        sold_on: new Date().toISOString(),
      });

      showToast("Sale recorded successfully", "success");
      setShowForm(false);
    } catch {
      showToast("Unable to record sale", "error");
    }
  };

  const handleCancel = () => {
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Sales</h1>
          <p className="text-sm text-gray-500">
            Record and view inventory sales
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="rounded-md border px-4 py-2"
        >
          Record Sale
        </button>
      </div>

      <div className="flex flex-wrap gap-3 rounded-lg border bg-white p-4">
        <input
          type="search"
          placeholder="Search sales..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          aria-label="Search sales"
          className="rounded-md border px-3 py-2"
        />

        <select
          value={productId ?? ""}
          onChange={(event) => {
            const value = event.target.value;
            setProductId(value ? Number(value) : null);
          }}
          disabled={productsLoading}
          aria-label="Filter by product"
          className="rounded-md border px-3 py-2"
        >
          <option value="">
            {productsLoading
              ? "Loading products..."
              : "All Products"}
          </option>

          {products?.map((product) => (
            <option key={product.id} value={product.id}>
              {product.name}
            </option>
          ))}
        </select>

        <select
          value={soldBy ?? ""}
          onChange={(event) => {
            const value = event.target.value;
            setSoldBy(value ? Number(value) : null);
          }}
          aria-label="Filter by seller"
          className="rounded-md border px-3 py-2"
        >
          <option value="">All Sellers</option>

          {sellers.map((seller) => (
            <option key={seller.id} value={seller.id}>
              {seller.name}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={fromDate}
          onChange={(event) => setFromDate(event.target.value)}
          aria-label="From date"
          className="rounded-md border px-3 py-2"
        />

        <input
          type="date"
          value={toDate}
          onChange={(event) => setToDate(event.target.value)}
          aria-label="To date"
          className="rounded-md border px-3 py-2"
        />

        <button
          type="button"
          onClick={resetFilters}
          className="rounded-md border px-4 py-2"
        >
          Clear
        </button>
      </div>

      {showForm && (
        <div className="rounded-lg border bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold">
            Record New Sale
          </h2>

          {productsLoading && (
            <p>Loading products...</p>
          )}

          {productsError && (
            <p>Unable to load products.</p>
          )}

          {!productsLoading &&
            !productsError &&
            products && (
              <SaleForm
                products={products}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isSubmitting={createSaleMutation.isPending}
              />
            )}
        </div>
      )}

      {salesLoading && (
        <div>Loading sales...</div>
      )}

      {salesError && (
        <div>Unable to load sales.</div>
      )}

      {!salesLoading &&
        !salesError &&
        sales &&
        filteredSales.length === 0 && (
          <div>No sales found.</div>
        )}

      {!salesLoading &&
        !salesError &&
        filteredSales.length > 0 && (
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-3 font-medium">
                    Product
                  </th>
                  <th className="px-4 py-3 font-medium">
                    Quantity
                  </th>
                  <th className="px-4 py-3 font-medium">
                    Unit Price
                  </th>
                  <th className="px-4 py-3 font-medium">
                    Total
                  </th>
                  <th className="px-4 py-3 font-medium">
                    Seller
                  </th>
                  <th className="px-4 py-3 font-medium">
                    Date
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredSales.map((sale: Sale) => (
                  <tr
                    key={sale.id}
                    className="border-b last:border-b-0"
                  >
                    <td className="px-4 py-3">
                      {sale.product_name}
                    </td>

                    <td className="px-4 py-3">
                      {sale.quantity}
                    </td>

                    <td className="px-4 py-3">
                      ₹{sale.unit_price.toLocaleString()}
                    </td>

                    <td className="px-4 py-3">
                      ₹{sale.total_amount.toLocaleString()}
                    </td>

                    <td className="px-4 py-3">
                      {sale.seller_name}
                    </td>

                    <td className="px-4 py-3">
                      {new Date(
                        sale.sold_on,
                      ).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
    </div>
  );
};

export default SalesPage;
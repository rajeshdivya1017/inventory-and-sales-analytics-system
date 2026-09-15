import { useTopProducts } from "../../hooks/useAnalytics";
import { useFilterStore } from "../../store/useFilterStore";

const TopProductsTable = () => {
  const {
    categoryId,
    fromDate,
    toDate,
  } = useFilterStore();

  const { data, isLoading, isError } = useTopProducts({
    categoryId,
    fromDate: fromDate || undefined,
    toDate: toDate || undefined,
  });

  if (isLoading) {
    return (
      <div className="rounded-lg border bg-white p-6">
        Loading top products...
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="rounded-lg border bg-white p-6">
        Unable to load top products.
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="rounded-lg border bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold">
          Top Products
        </h2>

        <p className="text-sm text-gray-500">
          No product sales found for the selected filters.
        </p>
      </div>
    );
  }

  const topProducts = [...data]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  return (
    <div className="rounded-lg border bg-white p-6">
      <h2 className="mb-4 text-lg font-semibold">
        Top Products
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px] text-left text-sm">
          <thead>
            <tr className="border-b bg-gray-50">
              <th
                scope="col"
                className="px-4 py-3 font-medium"
              >
                Rank
              </th>

              <th
                scope="col"
                className="px-4 py-3 font-medium"
              >
                Product
              </th>

              <th
                scope="col"
                className="px-4 py-3 font-medium"
              >
                Units Sold
              </th>

              <th
                scope="col"
                className="px-4 py-3 font-medium"
              >
                Revenue
              </th>
            </tr>
          </thead>

          <tbody>
            {topProducts.map((product, index) => (
              <tr
                key={product.product_name}
                className="border-b last:border-b-0 hover:bg-gray-50"
              >
                <td className="px-4 py-3 font-medium">
                  #{index + 1}
                </td>

                <td className="px-4 py-3">
                  {product.product_name}
                </td>

                <td className="px-4 py-3">
                  {product.units_sold.toLocaleString("en-IN")}
                </td>

                <td className="px-4 py-3 font-medium">
                  ₹{product.revenue.toLocaleString("en-IN")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TopProductsTable;
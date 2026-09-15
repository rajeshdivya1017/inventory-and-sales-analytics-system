import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useCategoryRevenue } from "../../hooks/useAnalytics";
import { useFilterStore } from "../../store/useFilterStore";

const formatCurrency = (value: number): string =>
  `₹${value.toLocaleString("en-IN")}`;

const CategoryBarChart = () => {
  const {
    categoryId,
    fromDate,
    toDate,
  } = useFilterStore();

  const { data, isLoading, isError } = useCategoryRevenue({
    categoryId,
    fromDate: fromDate || undefined,
    toDate: toDate || undefined,
  });

  if (isLoading) {
    return (
      <div className="rounded-lg border bg-white p-6">
        Loading category revenue...
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="rounded-lg border bg-white p-6">
        Unable to load category revenue.
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-white p-6">
      <h2 className="mb-4 text-lg font-semibold">
        Revenue by Category
      </h2>

      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{
              top: 10,
              right: 20,
              left: 30,
              bottom: 10,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="category" />

            <YAxis
              width={90}
              tickFormatter={(value: number) =>
                formatCurrency(value)
              }
            />

            <Tooltip
              formatter={(value) =>
                formatCurrency(Number(value))
              }
            />

            <Bar
              dataKey="revenue"
              fill="#2563eb"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CategoryBarChart;


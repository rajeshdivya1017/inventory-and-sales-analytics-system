
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import { useCategoryRevenue } from "../../hooks/useAnalytics";
import { useFilterStore } from "../../store/useFilterStore";

const CHART_COLORS = [
  "#2563eb",
  "#16a34a",
  "#ea580c",
  "#9333ea",
  "#0891b2",
  "#dc2626",
];

const formatCurrency = (value: number): string =>
  `₹${value.toLocaleString("en-IN")}`;

const CategoryPieChart = () => {
  const { categoryId, fromDate, toDate } = useFilterStore();

  const { data, isLoading, isError } = useCategoryRevenue({
    categoryId,
    fromDate: fromDate || undefined,
    toDate: toDate || undefined,
  });

  if (isLoading) {
    return (
      <div className="rounded-lg border bg-white p-6">
        Loading category chart...
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="rounded-lg border bg-white p-6">
        Unable to load category chart.
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-white p-6">
      <h2 className="mb-4 text-lg font-semibold">
        Category Revenue Distribution
      </h2>

      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="revenue"
              nameKey="category"
              cx="50%"
              cy="45%"
              outerRadius="65%"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`${entry.category}-${index}`}
                  fill={
                    CHART_COLORS[index % CHART_COLORS.length]
                  }
                />
              ))}
            </Pie>

            <Tooltip
              formatter={(value) =>
                formatCurrency(Number(value))
              }
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2 flex flex-wrap justify-center gap-x-5 gap-y-2">
        {data.map((entry, index) => (
          <div
            key={`${entry.category}-${index}`}
            className="flex items-center gap-2 text-sm text-gray-600"
          >
            <span
              className="h-3 w-3 rounded-full"
              style={{
                backgroundColor:
                  CHART_COLORS[index % CHART_COLORS.length],
              }}
              aria-hidden="true"
            />

            <span>{entry.category}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryPieChart;


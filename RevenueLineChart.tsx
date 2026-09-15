
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useMonthlyRevenue } from "../../hooks/useAnalytics";
import { useFilterStore } from "../../store/useFilterStore";

const formatCurrency = (value: number): string =>
  `₹${value.toLocaleString("en-IN")}`;

const RevenueLineChart = () => {
  const {
    categoryId,
    fromDate,
    toDate,
  } = useFilterStore();

  const { data, isLoading, isError } = useMonthlyRevenue({
    categoryId,
    fromDate: fromDate || undefined,
    toDate: toDate || undefined,
  });

  if (isLoading) {
    return (
      <div className="rounded-lg border bg-white p-6">
        Loading revenue chart...
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="rounded-lg border bg-white p-6">
        Unable to load revenue chart.
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-white p-6">
      <h2 className="mb-4 text-lg font-semibold">
        Monthly Revenue
      </h2>

      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{
              top: 10,
              right: 20,
              left: 30,
              bottom: 10,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="month" />

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

            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#2563eb"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RevenueLineChart;


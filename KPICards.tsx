import {
  DollarSign,
  Package,
  ShoppingCart,
  TriangleAlert,
} from "lucide-react";

import { useKPIs } from "../hooks/useAnalytics";
import { useFilterStore } from "../store/useFilterStore";

const KPICards = () => {
  const { categoryId, fromDate, toDate } = useFilterStore();

  const { data, isLoading, isError } = useKPIs({
    categoryId,
    fromDate: fromDate || undefined,
    toDate: toDate || undefined,
  });

  if (isLoading) {
    return <div>Loading KPIs...</div>;
  }

  if (isError || !data) {
    return <div>Unable to load KPIs</div>;
  }

  const cards = [
    {
      title: "Total Revenue",
      value: `₹${data.total_revenue.toLocaleString("en-IN")}`,
      icon: DollarSign,
    },
    {
      title: "Total Sales",
      value: data.total_sales.toLocaleString("en-IN"),
      icon: ShoppingCart,
    },
    {
      title: "Total Products",
      value: data.total_products.toLocaleString("en-IN"),
      icon: Package,
    },
    {
      title: "Low Stock",
      value: data.low_stock_count.toLocaleString("en-IN"),
      icon: TriangleAlert,
    },
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
        gap: "16px",
        width: "100%",
      }}
    >
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.title}
            style={{
              minWidth: 0,
              minHeight: "120px",
              padding: "20px",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              backgroundColor: "#ffffff",
              boxSizing: "border-box",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "#6b7280",
                }}
              >
                {card.title}
              </p>

              <Icon
                size={20}
                style={{
                  flexShrink: 0,
                  color: "#6b7280",
                }}
              />
            </div>

            <p
              style={{
                margin: "12px 0 0",
                fontSize: "24px",
                lineHeight: 1.2,
                fontWeight: 600,
                color: "#111827",
                wordBreak: "break-word",
              }}
            >
              {card.value}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default KPICards;
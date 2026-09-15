import FilterBar from "../components/FilterBar";
import KPICards from "../components/KPICards";
import CategoryBarChart from "../components/charts/CategoryBarChart";
import CategoryPieChart from "../components/charts/CategoryPieChart";
import RevenueLineChart from "../components/charts/RevenueLineChart";
import TopProductsTable from "../components/charts/TopProductsTable";


const Dashboard = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">
          Inventory & Sales Dashboard
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Monitor sales performance and inventory analytics.
        </p>
      </div>

      <FilterBar />

      <KPICards />

      <RevenueLineChart />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <CategoryBarChart />
        <CategoryPieChart />
      </div>

      <TopProductsTable />
    </div>
  );
};

export default Dashboard;
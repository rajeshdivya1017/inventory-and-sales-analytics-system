import { useQuery } from "@tanstack/react-query";

import { getCategories } from "../api/products";
import { useFilterStore } from "../store/useFilterStore";

const FilterBar = () => {
  const {
    categoryId,
    setCategoryId,
    fromDate,
    setFromDate,
    toDate,
    setToDate,
    resetFilters,
  } = useFilterStore();

  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-white p-4">
      <select
        value={categoryId ?? ""}
        onChange={(event) => {
          const value = event.target.value;
          setCategoryId(value ? Number(value) : null);
        }}
        disabled={categoriesLoading}
        aria-label="Filter by category"
        className="rounded-md border px-3 py-2"
      >
        <option value="">
          {categoriesLoading ? "Loading categories..." : "All Categories"}
        </option>

        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
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
        className="rounded-md border px-4 py-2 transition-colors hover:bg-gray-50"
      >
        Clear
      </button>
    </div>
  );
};

export default FilterBar;
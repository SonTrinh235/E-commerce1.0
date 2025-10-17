import { useState, useEffect } from "react";
import { sortArray, filterArray } from "./dataHelpers";

const getMockData = (dataArray, page = 1, limit = 10) => {
  // Ensure inputs are valid
  if (!Array.isArray(dataArray) || dataArray.length === 0) {
    return { list: [], page: 1, limit, total: 0, totalPages: 0 };
  }

  const total = dataArray.length;
  const totalPages = Math.ceil(total / limit);

  // Calculate start and end indices for slicing the array
  const start = (page - 1) * limit;
  const end = page * limit;

  // Slice the array to get the list for the requested page
  const list = dataArray.slice(start, end);

  return {
    list: list,
    page: page,
    limit: limit,
    total: total,
    totalPages: totalPages,
  };
};

// NOTE: The 'initialLimit' is part of the implementation's T
const usePaginatedData = (dataArray, initialLimit = 10) => {
  // 1. State for the data array (the 'list' from Paginated<T>)
  const [dataList, setDataList] = useState([]);

  // 2. State for the pagination metadata (the rest of Paginated<T>)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: initialLimit,
    total: 0,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // --- NEW SORT & FILTER STATE ---
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });
  const [filterConfig, setFilterConfig] = useState({});

  // 3. The reusable fetching logic
  const fetchData = async (
    page = pagination.page,
    currentSort = sortConfig,
    currentFilter = filterConfig
  ) => {
    setIsLoading(true);
    setError(null);

    // --- MOCK/API LOGIC ---
    try {
      // APPLY FILTER to the full raw array
      const filteredData = filterArray(dataArray, currentFilter);

      // APPLY SORT to the filtered array
      const sortedData = sortArray(
        filteredData,
        currentSort.key,
        currentSort.direction
      );

      // In a real app, this would be:
      // const response = await fetch(`${endpointURL}?page=${page}&limit=${pagination.limit}`);

      // For now, use a generic mock helper based on the endpoint:
      const data = await getMockData(dataArray, page, pagination.limit); // Must return Paginated<T> structure

      setDataList(data.list);
      setPagination(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Initial fetch on mount
  useEffect(() => {
    fetchData(pagination.page);
  }, [dataArray]); // Re-fetch if the endpoint changes

  // 5. Public handler for page changes
  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      fetchData(newPage);
    }
  };

  // NEW: Function to change sort settings
  const handleSort = (newKey) => {
    let direction = "ascending";
    if (sortConfig.key === newKey && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    const newSortConfig = { key: newKey, direction };

    setSortConfig(newSortConfig);
    setPagination((prev) => ({ ...prev, page: 1 })); // Reset to page 1

    // Refetch/re-slice immediately with the new sort config
    fetchData(1, newSortConfig, filterConfig);
  };

  // NEW: Function to change filter settings
  const handleFilter = (newFilterConfig) => {
    setFilterConfig(newFilterConfig);
    setPagination((prev) => ({ ...prev, page: 1 })); // Reset to page 1

    // Refetch/re-slice immediately with the new filter config
    fetchData(1, sortConfig, newFilterConfig);
  };

  return {
    dataList, // The array of T
    pagination, // The metadata
    isLoading,
    error,
    handlePageChange,
    sortConfig, // Exported for UI to show active sort
    handleSort, // Exported for UI to trigger sort
    filterConfig, // Exported for UI to manage filter input values
    handleFilter, // Exported for UI to trigger filter
  };
};

export default usePaginatedData;

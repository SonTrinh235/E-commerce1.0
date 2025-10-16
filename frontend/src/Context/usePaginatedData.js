import { useState, useEffect } from 'react';
// Assume your mock data function (getMockData) handles different types based on URL
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
        totalPages: 0 
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // 3. The reusable fetching logic
    const fetchData = async (page = pagination.page) => {
        setIsLoading(true);
        setError(null);

        // --- MOCK/API LOGIC ---
        try {
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

    return {
        dataList, // The array of T
        pagination, // The metadata
        isLoading,
        error,
        handlePageChange,
    };
};

export default usePaginatedData;
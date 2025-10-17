/**
 * Generic function to sort an array by a given key and direction.
 */
export const sortArray = (arr, key, direction) => {
    if (!key || !arr || arr.length === 0) return arr;

    // Use a copy (.slice()) to avoid mutating the original array
    return arr.slice().sort((a, b) => {
        const aVal = a[key];
        const bVal = b[key];
        
        // Handle undefined/null values gracefully
        if (aVal === undefined || aVal === null) return direction === 'ascending' ? 1 : -1;
        if (bVal === undefined || bVal === null) return direction === 'ascending' ? -1 : 1;

        // Standard comparison logic
        if (aVal < bVal) return direction === 'ascending' ? -1 : 1;
        if (aVal > bVal) return direction === 'ascending' ? 1 : -1;
        return 0;
    });
};

/**
 * Generic function to filter an array based on simple key-value pairs.
 * Assumes filterConfig is an object like: { category: 'Vegetables', status: 'InStock' }
 */
export const filterArray = (arr, filterConfig) => {
    if (!filterConfig || Object.keys(filterConfig).length === 0) return arr;
    
    return arr.filter(item => {
        // Check every filter condition
        for (const key in filterConfig) {
            const filterValue = filterConfig[key];
            
            // Skip if filter is set to 'All', 'all', null, or empty string
            if (!filterValue || filterValue.toLowerCase() === 'all') {
                continue;
            }
            
            // Basic case-insensitive comparison (adjust if you need complex filtering)
            if (
                item[key] === undefined || 
                String(item[key]).toLowerCase() !== String(filterValue).toLowerCase()
            ) {
                return false; // Item does not match this filter
            }
        }
        return true; // Item matches all active filters
    });
};
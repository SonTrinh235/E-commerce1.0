import { useState, useEffect } from 'react';

/**
 * Custom hook to debounce a value.
 * @param {any} value The value to debounce.
 * @param {number} delay The delay in milliseconds.
 * @returns The debounced value.
 */
function useDebounce(value, delay) {
  // State to store the debounced value
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // 1. Set up a timer that updates 'debouncedValue' after the 'delay'
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // 2. Cleanup function: This runs if the 'value' or 'delay' changes
    //    before the timeout is complete. It clears the previous timer,
    //    effectively resetting the clock whenever the user types again.
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]); // Only re-run if 'value' or 'delay' changes

  return debouncedValue;
}

export default useDebounce;
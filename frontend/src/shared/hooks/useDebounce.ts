import { useEffect, useState } from "react";

/**
 * Hook do debouncing wartości
 * @param value - Wartość do debounce'owania
 * @param delay - Opóźnienie w ms (default: 500ms)
 */
export const useDebounce = <T>(value: T, delay = 500): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

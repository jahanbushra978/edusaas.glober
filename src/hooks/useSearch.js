import { useState, useMemo, useEffect, useCallback, useRef } from "react";

function getNestedValue(obj, path) {
  return path.split(".").reduce((acc, part) => acc?.[part], obj);
}

function defaultFilterFn(item, query, fields) {
  return fields.some((field) => {
    const value = getNestedValue(item, field);
    return value != null && String(value).toLowerCase().includes(query);
  });
}

export function useSearch({
  data = [],
  fields = [],
  filterFn = null,
  debounceMs = 350,
  initialValue = "",
} = {}) {
  const [search, setSearch] = useState(initialValue);
  const [debouncedSearch, setDebouncedSearch] = useState(initialValue);
  const mountedRef = useRef(false);

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, debounceMs);
    return () => clearTimeout(timer);
  }, [search, debounceMs]);

  const query = useMemo(() => debouncedSearch.toLowerCase().trim(), [debouncedSearch]);

  const filteredData = useMemo(() => {
    if (!query) return data;
    if (filterFn) {
      return data.filter((item) => filterFn(item, query));
    }
    if (fields.length > 0) {
      return data.filter((item) => defaultFilterFn(item, query, fields));
    }
    return data;
  }, [data, query, fields, filterFn]);

  const clearSearch = useCallback(() => {
    setSearch("");
    setDebouncedSearch("");
  }, []);

  return {
    search,
    setSearch,
    debouncedSearch,
    clearSearch,
    filteredData,
    query,
  };
}

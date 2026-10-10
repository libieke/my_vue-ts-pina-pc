export interface UseTableOptions<T> {
  initialData?: T[];
  pageSize?: number;
  currentPage?: number;
}
export function useTable<T extends Record<string, any>>(options: UseTableOptions<T> = {}) {
  const allData = ref<T[]>(Array.isArray(options.initialData) ? options.initialData : []);
  const currentPage = ref<number>(options.currentPage ?? 1);
  const pageSize = ref<number>(options.pageSize ?? 10);
  const searchForm = ref<Record<string, any>>({});
  const filteredData = computed(() => {
    const source = Array.isArray(allData.value) ? allData.value : [];
    const filters = Object.entries(searchForm.value ?? {});
    if (!filters.length) {
      return source;
    }
    return source.filter(row => {
      return filters.every(([key, value]) => {
        if (value === "" || value === null || value === undefined) {
          return true;
        }
        const itemValue = row?.[key];
        const target = String(itemValue ?? "").trim().toLowerCase();
        const query = String(value).trim().toLowerCase();
        return target.includes(query);
      });
    });
  });
  const pagedData = computed(() => {
    const source = Array.isArray(filteredData.value) ? filteredData.value : [];
    const start = (currentPage.value - 1) * pageSize.value;
    const end = start + pageSize.value;
    return source.slice(start, end);
  });
  const resetPage = () => {
    currentPage.value = 1;
  };
  const setData = (data: T[] | null | undefined) => {
    allData.value = Array.isArray(data) ? data : [];
    resetPage();
  };
  return {
    allData,
    currentPage,
    pageSize,
    searchForm,
    filteredData,
    pagedData,
    resetPage,
    setData
  };
}
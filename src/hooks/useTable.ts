// 表格 Hook 的配置项
export interface UseTableOptions<T> {
  // 初始数据列表
  initialData?: T[]
  // 每页数量
  pageSize?: number
  // 当前页码
  currentPage?: number
}

// 通用表格 Hook：负责数据、搜索和分页状态的统一管理
export function useTable<T extends Record<string, any>>(
  options: UseTableOptions<T> = {}
) {
  // 原始数据
  const allData = ref<T[]>(Array.isArray(options.initialData) ? options.initialData : [])
  // 当前页
  const currentPage = ref<number>(options.currentPage ?? 1)
  // 每页条数
  const pageSize = ref<number>(options.pageSize ?? 10)
  // 搜索表单，支持动态字段过滤
  const searchForm = ref<Record<string, any>>({})

  // 过滤后的数据
  const filteredData = computed(() => {
    const source = Array.isArray(allData.value) ? allData.value : []
    const filters = Object.entries(searchForm.value ?? {})

    if (!filters.length) {
      return source
    }

    return source.filter((row) => {
      return filters.every(([key, value]) => {
        if (value === '' || value === null || value === undefined) {
          return true
        }

        const itemValue = row?.[key]
        const target = String(itemValue ?? '').trim().toLowerCase()
        const query = String(value).trim().toLowerCase()
        return target.includes(query)
      })
    })
  })

  // 当前页展示数据
  const pagedData = computed(() => {
    const source = Array.isArray(filteredData.value) ? filteredData.value : []
    const start = (currentPage.value - 1) * pageSize.value
    const end = start + pageSize.value
    return source.slice(start, end)
  })

  // 回到第一页
  const resetPage = () => {
    currentPage.value = 1
  }

  // 重置数据源，便于异步数据回填后自动刷新表格
  const setData = (data: T[] | null | undefined) => {
    allData.value = Array.isArray(data) ? data : []
    resetPage()
  }

  return {
    allData,
    currentPage,
    pageSize,
    searchForm,
    filteredData,
    pagedData,
    resetPage,
    setData,
  }
}

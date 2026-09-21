// 审批状态类型，支持字符串、数字和标准枚举值
export type ApprovalStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'cancelled'
  | 'draft'
  | number
  | string

// 审批状态展示信息
export interface ApprovalStatusMeta {
  label: string
  type: 'success' | 'warning' | 'info' | 'danger'
}

// 默认状态映射表：将后端或前端状态值统一转换为展示文案
const defaultStatusMap: Record<string, ApprovalStatusMeta> = {
  pending: { label: '待审批', type: 'warning' },
  approved: { label: '已通过', type: 'success' },
  rejected: { label: '已驳回', type: 'danger' },
  cancelled: { label: '已取消', type: 'info' },
  draft: { label: '草稿', type: 'info' },
  0: { label: '待审批', type: 'warning' },
  1: { label: '已通过', type: 'success' },
  2: { label: '已驳回', type: 'danger' },
  3: { label: '已取消', type: 'info' },
  4: { label: '草稿', type: 'info' },
}

// 审批状态 Hook：统一格式化状态文案和状态样式
export function useApprovalStatus(customMap: Record<string, ApprovalStatusMeta> = {}) {
  const statusMap = {
    ...defaultStatusMap,
    ...customMap,
  }

  // 根据状态值返回完整展示信息
  const getStatusMeta = (status: ApprovalStatus): ApprovalStatusMeta => {
    const key = String(status ?? '').toLowerCase()
    return statusMap[key] ?? { label: '未知状态', type: 'info' }
  }

  // 获取状态文本
  const getStatusLabel = (status: ApprovalStatus) => {
    return getStatusMeta(status).label
  }

  // 获取状态样式类型，方便绑定 el-tag / badge 等组件
  const getStatusType = (status: ApprovalStatus) => {
    return getStatusMeta(status).type
  }

  return {
    statusMap,
    getStatusMeta,
    getStatusLabel,
    getStatusType,
  }
}

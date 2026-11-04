
export type ApprovalStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'cancelled'
  | 'draft'
  | number
  | string

export interface ApprovalStatusMeta {
  label: string
  type: 'success' | 'warning' | 'info' | 'danger'
}

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

export function useApprovalStatus(customMap: Record<string, ApprovalStatusMeta> = {}) {
  const statusMap = {
    ...defaultStatusMap,
    ...customMap,
  }

  const getStatusMeta = (status: ApprovalStatus): ApprovalStatusMeta => {
    const key = String(status ?? '').toLowerCase()
    return statusMap[key] ?? { label: '未知状态', type: 'info' }
  }

  const getStatusLabel = (status: ApprovalStatus) => {
    return getStatusMeta(status).label
  }

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

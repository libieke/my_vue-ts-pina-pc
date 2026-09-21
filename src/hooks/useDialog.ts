// 对话框通用 Hook：统一处理显示/隐藏状态
export function useDialog(initialVisible = false) {
  // 当前显示状态
  const visible = ref(initialVisible)

  // 打开弹窗
  const open = () => {
    visible.value = true
  }

  // 关闭弹窗
  const close = () => {
    visible.value = false
  }

  // 切换弹窗状态，可接受显式值
  const toggle = (value?: boolean) => {
    visible.value = value ?? !visible.value
  }

  return {
    visible,
    open,
    close,
    toggle,
  }
}

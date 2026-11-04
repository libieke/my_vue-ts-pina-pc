
export function useDialog(initialVisible = false) {
  const visible = ref(initialVisible)

  const open = () => {
    visible.value = true
  }

  const close = () => {
    visible.value = false
  }

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

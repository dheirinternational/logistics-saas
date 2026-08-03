export type DHEIRToastType = "success" | "error" | "info"

export type DHEIRToastItem = {
  id: string
  type: DHEIRToastType
  message: string
  exiting?: boolean
}

type ToastListener = (toasts: DHEIRToastItem[]) => void

const DEFAULT_DURATION_MS = 4500

let toasts: DHEIRToastItem[] = []
const listeners = new Set<ToastListener>()

function emit() {
  const snapshot = [...toasts]
  listeners.forEach((listener) => listener(snapshot))
}

function dismiss(id: string) {
  toasts = toasts.map((t) => (t.id === id ? { ...t, exiting: true } : t))
  emit()
  window.setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id)
    emit()
  }, 220)
}

function show(type: DHEIRToastType, message: string, durationMs = DEFAULT_DURATION_MS) {
  const trimmed = message?.trim()
  if (!trimmed) return

  const id =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random()}`

  toasts = [...toasts, { id, type, message: trimmed }]
  emit()

  window.setTimeout(() => dismiss(id), durationMs)
}

export function subscribeToasts(listener: ToastListener) {
  listeners.add(listener)
  listener([...toasts])
  return () => {
    listeners.delete(listener)
  }
}

export function dismissToast(id: string) {
  dismiss(id)
}

export const toast = {
  success: (message: string) => show("success", message),
  error: (message: string) => show("error", message),
  info: (message: string) => show("info", message),
}

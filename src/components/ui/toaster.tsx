
"use client"

import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, secondaryAction, onClose, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="flex w-full items-center justify-between">
                {title && <ToastTitle>{title}</ToastTitle>}
                <div className="flex gap-2 ml-4">
                {action}
                {secondaryAction}
                </div>
            </div>
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}

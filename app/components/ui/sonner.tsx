"use client"

import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-pp-card group-[.toaster]:text-pp-text group-[.toaster]:border-pp-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-pp",
          actionButton:
            "group-[.toast]:bg-gold group-[.toast]:text-[#0B0B0D]",
          cancelButton:
            "group-[.toast]:bg-muted-pp group-[.toast]:text-muted-pp",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
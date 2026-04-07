import { forwardRef, type ComponentPropsWithoutRef } from "react"

import { cn } from "@/lib/utils"

import styles from "./AppModal.module.css"

export const AppModalBody = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<"div">
>(function AppModalBody({ className, ...props }, ref) {
  return (
    <div
      ref={ref}
      data-slot="app-modal-body"
      className={cn(styles.body, className)}
      {...props}
    />
  )
})

export const AppModalField = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<"div">
>(function AppModalField({ className, ...props }, ref) {
  return (
    <div
      ref={ref}
      data-slot="app-modal-field"
      className={cn(styles.field, className)}
      {...props}
    />
  )
})

export const AppModalActions = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<"div">
>(function AppModalActions({ className, ...props }, ref) {
  return (
    <div
      ref={ref}
      data-slot="app-modal-actions"
      className={cn(styles.actions, className)}
      {...props}
    />
  )
})

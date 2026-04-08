import { forwardRef } from "react"

import { Button, type ButtonProps } from "@/shared/ui/button"

/** 모달·다이얼로그 하단 액션에서 쓰는 너비 프리셋 (`dsButtonVariants.dimension`). */
export type ModalDialogActionSize = "hug" | "fixedMd"

type LockedButtonProps = Omit<
  ButtonProps,
  "appearance" | "dimension" | "variant" | "size"
>

export type ModalPrimaryButtonProps = LockedButtonProps & {
  /** 기본 `hug`. 넓은 고정 폭이 필요할 때만 `fixedMd`. */
  actionSize?: ModalDialogActionSize
}

export type ModalSecondaryButtonProps = LockedButtonProps & {
  actionSize?: ModalDialogActionSize
}

const dimensionForActionSize = (actionSize: ModalDialogActionSize) =>
  actionSize === "fixedMd" ? "fixedMd" : "hug"

/**
 * 모달/시트 하단 **주요** 액션 — DS `fill` + `hug` | `fixedMd` 고정.
 * `variant`/`size`로 shadcn 경로를 쓰지 않도록 막는다.
 */
export const ModalPrimaryButton = forwardRef<
  HTMLElement,
  ModalPrimaryButtonProps
>(function ModalPrimaryButton(
  { actionSize = "hug", className, type = "button", ...props },
  ref,
) {
  return (
    <Button
      ref={ref}
      type={type}
      appearance="fill"
      dimension={dimensionForActionSize(actionSize)}
      className={className}
      {...props}
    />
  )
})

/**
 * 모달/시트 하단 **보조** 액션(취소 등) — DS `outline` + 동일 dimension 프리셋.
 */
export const ModalSecondaryButton = forwardRef<
  HTMLElement,
  ModalSecondaryButtonProps
>(function ModalSecondaryButton(
  { actionSize = "hug", className, type = "button", ...props },
  ref,
) {
  return (
    <Button
      ref={ref}
      type={type}
      appearance="outline"
      dimension={dimensionForActionSize(actionSize)}
      className={className}
      {...props}
    />
  )
})


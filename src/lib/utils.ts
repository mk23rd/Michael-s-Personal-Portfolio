import { clsx, type ClassValue } from "clsx"
import type { CSSProperties } from "react"
import { twMerge } from "tailwind-merge"

/**
 * Utility helper for composing Tailwind class names.
 *
 * - Accepts any values supported by `clsx` (strings, arrays, objects).
 * - Uses `twMerge` to intelligently merge Tailwind classes so utilities like
 *   `px-2 px-4` are resolved to the last declaration.
 *
 * Example:
 *   cn("px-2", condition && "px-4", "text-sm")
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Type-safe way to pass CSS custom properties through React's `style` prop. */
export function vars(values: Record<`--${string}`, string | number>, base?: CSSProperties): CSSProperties {
  return { ...base, ...values } as CSSProperties
}

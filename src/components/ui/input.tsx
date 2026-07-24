import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "h-11 w-full rounded-xl border border-linen bg-white/90 px-4 text-sm text-ink placeholder:text-ink-soft/60 shadow-sm outline-none transition focus:border-azure focus:ring-2 focus:ring-azure/25",
      className
    )}
    {...props}
  />
));
Input.displayName = "Input";

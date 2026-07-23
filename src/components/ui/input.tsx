import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "h-11 w-full rounded-xl border border-slate-300/80 bg-white/80 px-4 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm outline-none transition focus:border-lagoon-400 focus:ring-2 focus:ring-lagoon-400/40",
      className
    )}
    {...props}
  />
));
Input.displayName = "Input";

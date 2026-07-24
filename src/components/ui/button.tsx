import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "coral" | "danger";
type Size = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variants: Record<Variant, string> = {
  primary: "bg-azure text-white shadow-lg shadow-azure/25 hover:bg-azure-deep",
  secondary: "bg-ink text-white hover:bg-ink/90",
  ghost: "bg-transparent text-ink-soft hover:bg-azure/10 hover:text-ink",
  outline: "border border-linen bg-card/80 text-ink hover:border-azure",
  coral: "bg-coral text-white shadow-lg shadow-coral/25 hover:bg-coral/90",
  danger: "bg-rose-500 text-white hover:bg-rose-600",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-7 text-base",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-azure focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  )
);
Button.displayName = "Button";

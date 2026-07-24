import type { ReactNode } from "react";
import { SkyBackdrop } from "@/components/SkyBackdrop";

/** Centered frosted card over the summer-sky backdrop — onboarding screens. */
export function GradientShell({
  children,
  maxWidth = "max-w-lg",
}: {
  children: ReactNode;
  maxWidth?: string;
}) {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden px-5 py-10">
      <SkyBackdrop />
      <div
        className={`glass-card reveal reveal-1 relative w-full ${maxWidth} rounded-4xl p-8`}
      >
        {children}
      </div>
    </div>
  );
}

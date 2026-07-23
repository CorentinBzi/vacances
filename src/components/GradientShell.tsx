import type { ReactNode } from "react";
import { motion } from "framer-motion";

/** Centered frosted card over the travel gradient — used by onboarding screens. */
export function GradientShell({
  children,
  maxWidth = "max-w-lg",
}: {
  children: ReactNode;
  maxWidth?: string;
}) {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden travel-gradient px-5 py-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_15%,rgba(255,255,255,0.3),transparent_45%),radial-gradient(circle_at_80%_85%,rgba(255,255,255,0.22),transparent_40%)]" />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className={`glass relative z-10 w-full ${maxWidth} rounded-4xl p-8 shadow-2xl shadow-black/20`}
      >
        {children}
      </motion.div>
    </div>
  );
}

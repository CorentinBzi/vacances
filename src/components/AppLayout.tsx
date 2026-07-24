import type { ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogOut, Palmtree, ShieldCheck } from "lucide-react";
import { SkyBackdrop } from "@/components/SkyBackdrop";
import { useAuth } from "@/context/AuthContext";
import { isAdmin } from "@/config/appConfig";
import { usingSharedBackend } from "@/lib/db";

export function AppLayout({
  children,
  wide = false,
}: {
  children: ReactNode;
  wide?: boolean;
}) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen">
      <SkyBackdrop />
      <header className="sticky top-0 z-30 border-b border-white/60 bg-white/60 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-azure text-white shadow-md shadow-azure/25">
              <Palmtree className="h-5 w-5" />
            </span>
            <span className="font-display text-lg font-extrabold tracking-tight text-ink">
              Dream Vacation<span className="text-coral">.</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            {!usingSharedBackend && (
              <span
                title="Mode local : activez Firebase pour partager entre appareils."
                className="hidden rounded-full bg-gold/20 px-3 py-1 text-xs font-medium text-coral sm:inline"
              >
                💾 Mode local
              </span>
            )}
            <span className="flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1.5 text-sm font-semibold text-ink ring-1 ring-linen">
              {user && isAdmin(user.name) && (
                <ShieldCheck className="h-4 w-4 text-azure" />
              )}
              {user?.name}
            </span>
            <button
              onClick={() => {
                logout();
                navigate("/login", { replace: true });
              }}
              className="grid h-9 w-9 place-items-center rounded-xl text-ink-soft transition hover:bg-white/70 hover:text-coral"
              title="Se déconnecter"
            >
              <LogOut className="h-[18px] w-[18px]" />
            </button>
          </div>
        </div>
      </header>

      <main
        className={`mx-auto w-full px-4 py-8 sm:px-6 ${
          wide ? "max-w-7xl" : "max-w-6xl"
        }`}
      >
        {children}
      </main>
    </div>
  );
}

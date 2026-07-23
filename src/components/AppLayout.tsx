import type { ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogOut, Palmtree, ShieldCheck } from "lucide-react";
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
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-sand to-orange-50/60">
      <header className="sticky top-0 z-30 border-b border-white/60 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-lagoon-500 to-sunset-500 text-white shadow-md">
              <Palmtree className="h-5 w-5" />
            </span>
            <span className="font-display text-lg font-bold text-slate-800">
              Dream Vacation
            </span>
          </Link>

          <div className="flex items-center gap-3">
            {!usingSharedBackend && (
              <span
                title="Mode local : activez Firebase pour partager entre appareils."
                className="hidden rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700 sm:inline"
              >
                💾 Mode local
              </span>
            )}
            <span className="flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1.5 text-sm font-semibold text-slate-700 ring-1 ring-slate-200">
              {user && isAdmin(user.name) && (
                <ShieldCheck className="h-4 w-4 text-lagoon-500" />
              )}
              {user?.name}
            </span>
            <button
              onClick={() => {
                logout();
                navigate("/login", { replace: true });
              }}
              className="grid h-9 w-9 place-items-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-rose-500"
              title="Se déconnecter"
            >
              <LogOut className="h-4.5 w-4.5" />
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

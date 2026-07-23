import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { LoginPage } from "@/pages/LoginPage";
import { NameSelectPage } from "@/pages/NameSelectPage";
import { ChangePasswordPage } from "@/pages/ChangePasswordPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { TripPage } from "@/pages/TripPage";
import { ProposalCreatePage } from "@/pages/ProposalCreatePage";
import { ProposalDetailPage } from "@/pages/ProposalDetailPage";

function FullScreenLoader() {
  return (
    <div className="flex h-screen items-center justify-center travel-gradient">
      <div className="animate-pulse text-lg font-semibold text-white/90">
        Chargement…
      </div>
    </div>
  );
}

/** Gate for authenticated pages. */
function RequireAuth({ children }: { children: JSX.Element }) {
  const { user, onboarding, ready } = useAuth();
  const location = useLocation();
  if (!ready) return <FullScreenLoader />;
  if (!user) {
    if (onboarding?.stage === "select-name")
      return <Navigate to="/select-name" replace />;
    if (onboarding?.stage === "change-password")
      return <Navigate to="/change-password" replace />;
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return children;
}

export default function App() {
  const { user, onboarding, ready } = useAuth();
  if (!ready) return <FullScreenLoader />;

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/" replace /> : <LoginPage />}
      />
      <Route
        path="/select-name"
        element={
          onboarding?.stage === "select-name" ? (
            <NameSelectPage />
          ) : (
            <Navigate to={user ? "/" : "/login"} replace />
          )
        }
      />
      <Route
        path="/change-password"
        element={
          onboarding?.stage === "change-password" ? (
            <ChangePasswordPage />
          ) : (
            <Navigate to={user ? "/" : "/login"} replace />
          )
        }
      />

      <Route
        path="/"
        element={
          <RequireAuth>
            <DashboardPage />
          </RequireAuth>
        }
      />
      <Route
        path="/trip/:tripId"
        element={
          <RequireAuth>
            <TripPage />
          </RequireAuth>
        }
      />
      <Route
        path="/trip/:tripId/new"
        element={
          <RequireAuth>
            <ProposalCreatePage />
          </RequireAuth>
        }
      />
      <Route
        path="/trip/:tripId/proposal/:proposalId"
        element={
          <RequireAuth>
            <ProposalDetailPage />
          </RequireAuth>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

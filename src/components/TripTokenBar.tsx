import { useState } from "react";
import { KeyRound, Copy, Check, Link2 } from "lucide-react";

/** Admin-only: shows a trip's share token with copy + copy-invite-link. */
export function TripTokenBar({
  token,
  tripId,
}: {
  token: string;
  tripId: string;
}) {
  const [copied, setCopied] = useState<"token" | "link" | null>(null);

  const inviteLink = `${window.location.origin}${import.meta.env.BASE_URL}join/${token}`;

  async function copy(kind: "token" | "link", value: string) {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      /* clipboard blocked — ignore */
    }
    setCopied(kind);
    setTimeout(() => setCopied(null), 1600);
  }

  return (
    <div className="flex flex-wrap items-center gap-2 border-t border-linen bg-azure/5 px-4 py-3">
      <span className="inline-flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-1 font-mono text-sm font-semibold tracking-wider text-ink ring-1 ring-linen">
        <KeyRound className="h-3.5 w-3.5 text-azure" />
        {token}
      </span>
      <button
        type="button"
        onClick={() => copy("token", token)}
        className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-ink-soft transition hover:bg-white hover:text-azure"
        title="Copier le token"
      >
        {copied === "token" ? (
          <>
            <Check className="h-3.5 w-3.5 text-emerald-600" /> Copié
          </>
        ) : (
          <>
            <Copy className="h-3.5 w-3.5" /> Token
          </>
        )}
      </button>
      <button
        type="button"
        onClick={() => copy("link", inviteLink)}
        title={`Copier le lien d'invitation (${tripId})`}
        className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-ink-soft transition hover:bg-white hover:text-azure"
      >
        {copied === "link" ? (
          <>
            <Check className="h-3.5 w-3.5 text-emerald-600" /> Copié
          </>
        ) : (
          <>
            <Link2 className="h-3.5 w-3.5" /> Lien
          </>
        )}
      </button>
    </div>
  );
}

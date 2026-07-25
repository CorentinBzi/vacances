import { useState, type FormEvent } from "react";
import { MessageCircle, Send, Loader2, Pencil, Trash2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { db, type Comment } from "@/lib/db";

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const min = Math.floor(diff / 60000);
  if (min < 1) return "à l'instant";
  if (min < 60) return `il y a ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `il y a ${h} h`;
  const d = Math.floor(h / 24);
  return `il y a ${d} j`;
}

export function CommentsPanel({
  tripId,
  proposalId,
  comments,
  currentUser,
}: {
  tripId: string;
  proposalId: string;
  comments: Comment[];
  currentUser: string;
}) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [confirmId, setConfirmId] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const value = text.trim();
    if (!value) return;
    setSending(true);
    try {
      await db.addComment(tripId, proposalId, currentUser, value);
      setText("");
    } finally {
      setSending(false);
    }
  }

  async function saveEdit(id: string) {
    const value = editText.trim();
    if (!value) return;
    await db.editComment(tripId, proposalId, id, value);
    setEditingId(null);
  }

  const ordered = [...comments].sort((a, b) => a.createdAt - b.createdAt);

  return (
    <div className="rounded-3xl border border-white/70 bg-white/70 p-6 shadow-lg">
      <h3 className="mb-4 flex items-center gap-2 font-display text-xl font-bold text-ink">
        <MessageCircle className="h-5 w-5 text-azure" /> Commentaires
        <span className="text-base font-normal text-ink-soft">
          ({comments.length})
        </span>
      </h3>

      <div className="space-y-3">
        {ordered.length === 0 && (
          <p className="text-sm text-ink-soft">
            Sois le premier à donner ton avis 💬
          </p>
        )}
        {ordered.map((c) => {
          const mine = c.author === currentUser;
          const isEditing = editingId === c.id;
          return (
            <div key={c.id} className="group flex gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-azure to-gold text-sm font-bold text-white">
                {c.author.slice(0, 1).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1 rounded-2xl bg-azure/5 px-4 py-2.5">
                <div className="flex items-baseline justify-between gap-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-semibold text-ink">
                      {c.author}
                    </span>
                    <span className="text-[11px] text-ink-soft">
                      {timeAgo(c.createdAt)}
                    </span>
                  </div>
                  {mine && !isEditing && (
                    <div className="flex gap-1 opacity-60 transition group-hover:opacity-100">
                      <button
                        type="button"
                        title="Modifier"
                        onClick={() => {
                          setEditingId(c.id);
                          setEditText(c.text);
                          setConfirmId(null);
                        }}
                        className="rounded-md p-1 text-ink-soft hover:bg-white hover:text-azure"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        title="Supprimer"
                        onClick={() => setConfirmId(c.id)}
                        className="rounded-md p-1 text-ink-soft hover:bg-white hover:text-coral"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {isEditing ? (
                  <div className="mt-1.5 flex items-center gap-2">
                    <input
                      autoFocus
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveEdit(c.id);
                        if (e.key === "Escape") setEditingId(null);
                      }}
                      className="h-9 flex-1 rounded-lg border border-linen bg-white px-3 text-sm text-ink outline-none focus:border-azure focus:ring-2 focus:ring-azure/25"
                    />
                    <button
                      type="button"
                      title="Enregistrer"
                      onClick={() => saveEdit(c.id)}
                      className="grid h-9 w-9 place-items-center rounded-lg bg-azure text-white hover:bg-azure-deep"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      title="Annuler"
                      onClick={() => setEditingId(null)}
                      className="grid h-9 w-9 place-items-center rounded-lg bg-white text-ink-soft ring-1 ring-linen hover:text-ink"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <p className="mt-0.5 whitespace-pre-wrap break-words text-sm text-ink-soft">
                    {c.text}
                  </p>
                )}

                {confirmId === c.id && (
                  <div className="mt-2 flex items-center gap-2 rounded-lg bg-coral/10 px-3 py-1.5 text-xs text-coral">
                    Supprimer ce commentaire&nbsp;?
                    <button
                      type="button"
                      onClick={async () => {
                        await db.deleteComment(tripId, proposalId, c.id);
                        setConfirmId(null);
                      }}
                      className="ml-auto rounded-md bg-coral px-2 py-0.5 font-semibold text-white hover:bg-coral-soft"
                    >
                      Oui
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmId(null)}
                      className="rounded-md bg-white px-2 py-0.5 font-medium text-ink-soft ring-1 ring-linen"
                    >
                      Non
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <form onSubmit={submit} className="mt-5 flex items-center gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={`Commenter en tant que ${currentUser}…`}
          className="h-11 flex-1 rounded-xl border border-linen bg-white px-4 text-sm text-ink outline-none focus:border-azure focus:ring-2 focus:ring-azure/25"
        />
        <Button type="submit" disabled={sending || !text.trim()}>
          {sending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>
    </div>
  );
}

import { useState, type FormEvent } from "react";
import { MessageCircle, Send, Loader2 } from "lucide-react";
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

  const ordered = [...comments].sort((a, b) => a.createdAt - b.createdAt);

  return (
    <div className="rounded-3xl border border-white/70 bg-white/70 p-6 shadow-lg">
      <h3 className="mb-4 flex items-center gap-2 font-display text-xl font-bold text-slate-900">
        <MessageCircle className="h-5 w-5 text-lagoon-500" /> Commentaires
        <span className="text-base font-normal text-slate-400">
          ({comments.length})
        </span>
      </h3>

      <div className="space-y-3">
        {ordered.length === 0 && (
          <p className="text-sm text-slate-400">
            Sois le premier à donner ton avis 💬
          </p>
        )}
        {ordered.map((c) => (
          <div key={c.id} className="flex gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-lagoon-400 to-sunset-400 text-sm font-bold text-white">
              {c.author.slice(0, 1).toUpperCase()}
            </span>
            <div className="min-w-0 flex-1 rounded-2xl bg-slate-50 px-4 py-2.5">
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-semibold text-slate-800">
                  {c.author}
                </span>
                <span className="text-[11px] text-slate-400">
                  {timeAgo(c.createdAt)}
                </span>
              </div>
              <p className="mt-0.5 whitespace-pre-wrap break-words text-sm text-slate-600">
                {c.text}
              </p>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={submit} className="mt-5 flex items-center gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={`Commenter en tant que ${currentUser}…`}
          className="h-11 flex-1 rounded-xl border border-slate-300/80 bg-white px-4 text-sm outline-none focus:border-lagoon-400 focus:ring-2 focus:ring-lagoon-400/40"
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

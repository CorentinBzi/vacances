import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, MessageCircle, MapPin, ListChecks, User } from "lucide-react";
import { WeatherBadge } from "@/components/WeatherBadge";
import { db, type Proposal } from "@/lib/db";
import { formatLongDate } from "@/lib/dates";
import { cn } from "@/lib/utils";

export function ProposalCard({
  tripId,
  proposal,
  currentUser,
}: {
  tripId: string;
  proposal: Proposal;
  currentUser: string;
}) {
  const voteCount = Object.keys(proposal.votes).length;
  const hasVoted = !!proposal.votes[currentUser];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col overflow-hidden rounded-3xl border border-white/70 bg-white shadow-lg shadow-slate-200/60"
    >
      <Link to={`/trip/${tripId}/proposal/${proposal.id}`} className="group">
        <div className="relative h-28 overflow-hidden bg-gradient-to-br from-lagoon-500 via-cyan-400 to-sunset-400">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_-20%,rgba(255,255,255,0.45),transparent_55%)]" />
          <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
            <div className="flex items-center gap-1.5 text-white drop-shadow">
              <MapPin className="h-4 w-4" />
              <span className="text-sm font-medium">
                {proposal.destination.name}
              </span>
            </div>
          </div>
        </div>
        <div className="p-5">
          <h3 className="font-display text-xl font-bold text-slate-900 group-hover:text-lagoon-600">
            {proposal.title}
          </h3>
          {proposal.startDate && (
            <p className="mt-1 text-sm text-slate-500">
              {formatLongDate(proposal.startDate)}
              {proposal.endDate && proposal.endDate !== proposal.startDate
                ? ` → ${formatLongDate(proposal.endDate)}`
                : ""}
            </p>
          )}
        </div>
      </Link>

      <div className="mt-auto flex flex-col gap-3 px-5 pb-5">
        <div className="flex flex-wrap items-center gap-2">
          <WeatherBadge
            lat={proposal.destination.lat}
            lon={proposal.destination.lon}
            startDate={proposal.startDate}
            endDate={proposal.endDate}
            compact
          />
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-500">
            <ListChecks className="h-3 w-3" /> {proposal.items.length} étape(s)
          </span>
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 pt-3">
          <span className="flex items-center gap-1 text-xs text-slate-400">
            <User className="h-3 w-3" /> {proposal.createdBy}
          </span>
          <div className="flex items-center gap-2">
            <Link
              to={`/trip/${tripId}/proposal/${proposal.id}`}
              className="flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-500 hover:bg-slate-200"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              {proposal.comments.length}
            </Link>
            <button
              onClick={() => db.toggleVote(tripId, proposal.id, currentUser)}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold transition",
                hasVoted
                  ? "bg-rose-500 text-white shadow-sm shadow-rose-500/30"
                  : "bg-rose-50 text-rose-500 hover:bg-rose-100"
              )}
            >
              <Heart className={cn("h-4 w-4", hasVoted && "fill-current")} />
              {voteCount}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

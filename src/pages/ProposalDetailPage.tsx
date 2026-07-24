import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Heart, MapPin, CalendarRange, User } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Timeline } from "@/components/Timeline";
import { DestinationSlideshow } from "@/components/DestinationSlideshow";
import { CommentsPanel } from "@/components/CommentsPanel";
import { WeatherBadge } from "@/components/WeatherBadge";
import { useAuth } from "@/context/AuthContext";
import { db, type Proposal } from "@/lib/db";
import { formatLongDate } from "@/lib/dates";
import { cn } from "@/lib/utils";

export function ProposalDetailPage() {
  const { tripId = "", proposalId = "" } = useParams();
  const { user } = useAuth();
  const userName = user?.name ?? "";
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(
    () =>
      db.subscribeProposals(tripId, (list) => {
        setProposals(list);
        setLoaded(true);
      }),
    [tripId]
  );

  const proposal = useMemo(
    () => proposals.find((p) => p.id === proposalId),
    [proposals, proposalId]
  );

  if (!loaded) {
    return (
      <AppLayout>
        <div className="animate-pulse py-20 text-center text-slate-400">
          Chargement…
        </div>
      </AppLayout>
    );
  }

  if (!proposal) {
    return (
      <AppLayout>
        <div className="py-20 text-center">
          <p className="text-ink-soft">Cette proposition n'existe plus.</p>
          <Link
            to={`/trip/${tripId}`}
            className="mt-4 inline-flex items-center gap-1.5 text-azure-deep hover:underline"
          >
            <ArrowLeft className="h-4 w-4" /> Retour au voyage
          </Link>
        </div>
      </AppLayout>
    );
  }

  const voteCount = Object.keys(proposal.votes).length;
  const hasVoted = !!proposal.votes[userName];
  const total = proposal.items.reduce((s, it) => s + (it.cost ?? 0), 0);

  return (
    <AppLayout wide>
      <Link
        to={`/trip/${tripId}`}
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-slate-800"
      >
        <ArrowLeft className="h-4 w-4" /> Retour au voyage
      </Link>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-bold text-ink">
            {proposal.title}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-soft">
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-azure" />
              {proposal.destination.displayName}
            </span>
            {proposal.startDate && (
              <span className="flex items-center gap-1.5">
                <CalendarRange className="h-4 w-4" />
                {formatLongDate(proposal.startDate)}
                {proposal.endDate ? ` → ${formatLongDate(proposal.endDate)}` : ""}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <User className="h-4 w-4" /> Proposé par {proposal.createdBy}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <WeatherBadge
            lat={proposal.destination.lat}
            lon={proposal.destination.lon}
            startDate={proposal.startDate}
            endDate={proposal.endDate}
          />
          <button
            onClick={() => db.toggleVote(tripId, proposal.id, userName)}
            className={cn(
              "flex items-center gap-2 rounded-full px-5 py-3 font-semibold shadow-sm transition",
              hasVoted
                ? "bg-coral text-white shadow-coral/30"
                : "bg-white text-coral ring-1 ring-coral/25 hover:bg-coral/10"
            )}
          >
            <Heart className={cn("h-5 w-5", hasVoted && "fill-current")} />
            {voteCount} vote{voteCount > 1 ? "s" : ""}
          </button>
        </div>
      </div>

      {/* Two-column: timeline + slideshow */}
      <div className="mt-8 grid gap-8 lg:grid-cols-[1.3fr_1fr]">
        <motion.section
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          className="rounded-3xl border border-white/70 bg-white/70 p-6 shadow-lg"
        >
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-display text-2xl font-bold text-ink">
              Itinéraire
            </h2>
            {total > 0 && (
              <span className="rounded-full bg-azure/10 px-3 py-1 text-sm font-medium text-ink-soft">
                Total estimé : {total} €
              </span>
            )}
          </div>
          <Timeline items={proposal.items} />
        </motion.section>

        <motion.aside
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:sticky lg:top-24 lg:self-start"
        >
          <DestinationSlideshow proposal={proposal} />
        </motion.aside>
      </div>

      {/* Comments */}
      <div className="mt-8 max-w-3xl">
        <CommentsPanel
          tripId={tripId}
          proposalId={proposal.id}
          comments={proposal.comments}
          currentUser={userName}
        />
      </div>
    </AppLayout>
  );
}

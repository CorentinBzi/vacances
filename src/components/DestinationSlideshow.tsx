import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Compass, ImageOff, Loader2 } from "lucide-react";
import { getDestinationImages, type DestinationImage } from "@/lib/api/images";
import type { Proposal } from "@/lib/db";
import { formatLongDate } from "@/lib/dates";

interface Slide {
  image?: DestinationImage;
  title: string;
  subtitle: string;
}

const AUTOPLAY_MS = 5000;

/** AI-free "generated" slideshow: real destination photos + itinerary
 *  highlights, animated in the style of the showcase card. */
export function DestinationSlideshow({ proposal }: { proposal: Proposal }) {
  const [images, setImages] = useState<DestinationImage[] | null>(null);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const dest = proposal.destination.name;

  useEffect(() => {
    let alive = true;
    setImages(null);
    getDestinationImages(dest, 6).then((imgs) => {
      if (alive) setImages(imgs);
    });
    return () => {
      alive = false;
    };
  }, [dest]);

  // Build slides from highlights + photos.
  const slides = useMemo<Slide[]>(() => {
    const highlights = proposal.items
      .filter((i) => i.type === "place" || i.type === "activity")
      .map((i) => i.title);
    const dateLine =
      proposal.startDate && proposal.endDate
        ? `${formatLongDate(proposal.startDate)} → ${formatLongDate(proposal.endDate)}`
        : proposal.startDate
          ? formatLongDate(proposal.startDate)
          : "Oct – Déc 2026";

    const imgs = images ?? [];
    const base: Slide[] = [
      { image: imgs[0], title: dest, subtitle: dateLine },
    ];
    const taglines = [
      "Le grand départ",
      ...highlights,
      "Souvenirs à venir",
      "Prêts pour l'aventure ?",
    ];
    const count = Math.max(imgs.length, 1);
    for (let i = 1; i < count; i++) {
      base.push({
        image: imgs[i],
        title: dest,
        subtitle: taglines[(i - 1) % taglines.length] || "Évasion",
      });
    }
    return base;
  }, [images, proposal, dest]);

  useEffect(() => {
    if (paused || slides.length <= 1) return;
    const t = setInterval(
      () => setIndex((i) => (i + 1) % slides.length),
      AUTOPLAY_MS
    );
    return () => clearInterval(t);
  }, [paused, slides.length]);

  useEffect(() => {
    if (index >= slides.length) setIndex(0);
  }, [slides.length, index]);

  const go = (dir: number) =>
    setIndex((i) => (i + dir + slides.length) % slides.length);

  const current = slides[index] ?? slides[0];

  return (
    <div
      className="relative mx-auto flex min-h-[60vh] w-full max-w-sm flex-col gap-2 overflow-hidden rounded-[2rem] border border-gray-800 bg-black/80 p-2 shadow-[0_35px_60px_-15px_rgba(0,0,0,0.6)] backdrop-blur-sm"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-2">
        <span className="flex items-center gap-1.5 text-sm font-medium text-white/90">
          <Compass className="h-5 w-5 text-sky-400" /> Diaporama
        </span>
        <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs text-white/70">
          {slides.length > 0 ? `${index + 1}/${slides.length}` : "—"}
        </span>
      </div>

      {/* Title */}
      <div className="bg-gradient-to-r from-blue-300 to-purple-400 bg-clip-text px-2 text-center font-display text-3xl font-bold uppercase leading-tight text-transparent">
        {current?.title ?? dest}
      </div>

      {/* Image stage */}
      <div className="relative mx-2 flex-1 overflow-hidden rounded-2xl">
        {images === null ? (
          <div className="flex h-full min-h-[36vh] items-center justify-center text-white/60">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.7, ease: "easeInOut" }}
              className="relative h-full min-h-[36vh]"
            >
              {current?.image?.url ? (
                <>
                  <img
                    src={current.image.url}
                    alt={current.subtitle}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                </>
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-azure via-[#3aa7db] to-gold text-white">
                  <ImageOff className="h-8 w-8 opacity-70" />
                  <span className="text-sm opacity-80">Pas de photo trouvée</span>
                </div>
              )}
              <div className="absolute bottom-3 left-3 right-3">
                <p className="font-display text-lg italic text-white drop-shadow">
                  {current?.subtitle}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        )}

        {/* Nav arrows */}
        {slides.length > 1 && (
          <>
            <button
              onClick={() => go(-1)}
              className="absolute left-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-black/40 text-white backdrop-blur transition hover:bg-black/70"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => go(1)}
              className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-black/40 text-white backdrop-blur transition hover:bg-black/70"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        )}
      </div>

      {/* Dots */}
      {slides.length > 1 && (
        <div className="flex items-center justify-center gap-1.5 py-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-5 bg-white" : "w-1.5 bg-white/40"
              }`}
            />
          ))}
        </div>
      )}

      <p className="px-3 pb-2 text-center text-[11px] text-white/40">
        Photos : Wikipedia / Openverse
      </p>
    </div>
  );
}

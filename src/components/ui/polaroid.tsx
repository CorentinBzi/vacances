import { useState } from "react";
import { cn } from "@/lib/utils";

export interface PolaroidProps {
  src: string;
  caption: string;
  emoji?: string;
  /** Tailwind rotate class, e.g. "-rotate-6". */
  rotate?: string;
  className?: string;
  style?: React.CSSProperties;
}

/** A tilted, floating polaroid photo card. Falls back to a gradient if the
 *  image fails to load, so the login screen never shows broken images. */
export function Polaroid({
  src,
  caption,
  emoji = "📸",
  rotate = "rotate-0",
  className,
  style,
}: PolaroidProps) {
  const [failed, setFailed] = useState(false);

  return (
    <figure
      className={cn(
        "w-40 select-none rounded-sm bg-white p-2 pb-3 shadow-2xl shadow-black/30 ring-1 ring-black/5 animate-float-slow",
        rotate,
        className
      )}
      style={style}
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-sm bg-gradient-to-br from-lagoon-400 to-sunset-400">
        {!failed ? (
          <img
            src={src}
            alt={caption}
            loading="lazy"
            onError={() => setFailed(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-4xl">
            {emoji}
          </div>
        )}
      </div>
      <figcaption className="pt-2 text-center font-display text-sm italic text-slate-700">
        {caption}
      </figcaption>
    </figure>
  );
}

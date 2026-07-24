import { cn } from "@/lib/utils";

/**
 * A hand-built summer-postcard scene — sun, sea, a little sailboat and a plane
 * tracing a dashed trail across the sky. Fully self-contained SVG in the app's
 * palette; scales to fill whatever banner it's placed in.
 */
export function DreamVacationIllustration({
  className,
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 480 240"
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label="Illustration : voilier et avion au coucher de soleil"
      className={cn("h-full w-full", className)}
    >
      <defs>
        <linearGradient id="dv-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#bfe3fb" />
          <stop offset="55%" stopColor="#eaf4fe" />
          <stop offset="100%" stopColor="#fde7c4" />
        </linearGradient>
        <radialGradient id="dv-sun" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffe0a3" />
          <stop offset="60%" stopColor="#f2a541" />
          <stop offset="100%" stopColor="#f2a541" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="dv-sea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3aa7db" />
          <stop offset="100%" stopColor="#0d7cc7" />
        </linearGradient>
      </defs>

      {/* Sky */}
      <rect width="480" height="240" fill="url(#dv-sky)" />

      {/* Sun + glow */}
      <circle cx="392" cy="78" r="70" fill="url(#dv-sun)" />
      <circle cx="392" cy="78" r="30" fill="#ffd67a" />

      {/* Clouds */}
      <g fill="#ffffff">
        <g opacity="0.95">
          <ellipse cx="96" cy="52" rx="34" ry="15" />
          <ellipse cx="122" cy="46" rx="24" ry="17" />
          <ellipse cx="72" cy="47" rx="20" ry="13" />
        </g>
        <g opacity="0.8">
          <ellipse cx="300" cy="40" rx="26" ry="11" />
          <ellipse cx="322" cy="36" rx="18" ry="12" />
        </g>
      </g>

      {/* Plane + dashed trail arcing toward the sun */}
      <path
        d="M60 150 Q 190 60 340 96"
        fill="none"
        stroke="#ffffff"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="1 12"
        opacity="0.9"
      />
      <g transform="translate(336 92) rotate(18)" fill="#14395c">
        <path d="M0 0 L22 -4 L28 0 L22 4 Z" />
        <path d="M8 -2 L2 -12 L6 -12 L14 -3 Z" />
        <path d="M8 2 L2 12 L6 12 L14 3 Z" />
      </g>

      {/* Sea */}
      <path d="M0 168 Q 240 150 480 168 L480 240 L0 240 Z" fill="url(#dv-sea)" />
      <path
        d="M0 168 Q 240 150 480 168"
        fill="none"
        stroke="#ffffff"
        strokeWidth="2"
        opacity="0.4"
      />
      {/* Water sparkles */}
      <g stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" opacity="0.45">
        <path d="M64 196 h16" />
        <path d="M120 214 h22" />
        <path d="M300 200 h18" />
        <path d="M372 216 h20" />
        <path d="M200 220 h14" />
      </g>

      {/* Sailboat */}
      <g transform="translate(224 150)">
        {/* mast */}
        <path d="M2 -44 L2 6" stroke="#14395c" strokeWidth="2.5" />
        {/* main sail */}
        <path d="M4 -42 L4 2 L34 2 Z" fill="#ffffff" />
        {/* fore sail */}
        <path d="M0 -40 L0 0 L-26 0 Z" fill="#e0693a" />
        {/* hull */}
        <path d="M-34 6 Q 4 26 44 6 L36 18 Q 4 30 -26 18 Z" fill="#c74a20" />
        {/* little flag */}
        <path d="M2 -44 L16 -40 L2 -36 Z" fill="#f2a541" />
      </g>

      {/* Birds */}
      <g stroke="#14395c" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.55">
        <path d="M150 70 q 6 -6 12 0 q 6 -6 12 0" />
        <path d="M176 84 q 5 -5 10 0 q 5 -5 10 0" />
      </g>
    </svg>
  );
}

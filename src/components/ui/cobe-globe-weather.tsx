import { useCallback, useEffect, useRef } from "react";
import createGlobe from "cobe";

export interface WeatherMarker {
  id: string;
  location: [number, number];
  emoji: string;
}

interface GlobeWeatherProps {
  markers?: WeatherMarker[];
  className?: string;
  speed?: number;
}

// Travel stickers placed at real coordinates — each emoji evokes its region.
const defaultMarkers: WeatherMarker[] = [
  { id: "paris", location: [48.85, 2.35], emoji: "🗼" },
  { id: "londres", location: [51.5, -0.12], emoji: "🎡" },
  { id: "rome", location: [41.9, 12.5], emoji: "🏛️" },
  { id: "santorin", location: [36.4, 25.4], emoji: "🏺" },
  { id: "islande", location: [64.9, -19.0], emoji: "🌋" },
  { id: "marrakech", location: [31.6, -8.0], emoji: "🕌" },
  { id: "egypte", location: [30.0, 31.2], emoji: "🔺" },
  { id: "kenya", location: [-1.3, 36.8], emoji: "🦒" },
  { id: "lecap", location: [-33.9, 18.4], emoji: "🦁" },
  { id: "dubai", location: [25.2, 55.3], emoji: "🏙️" },
  { id: "inde", location: [27.2, 78.0], emoji: "🐘" },
  { id: "tokyo", location: [35.68, 139.77], emoji: "⛩️" },
  { id: "pekin", location: [39.9, 116.4], emoji: "🐼" },
  { id: "bangkok", location: [13.75, 100.5], emoji: "🛕" },
  { id: "bali", location: [-8.65, 115.22], emoji: "🌴" },
  { id: "sydney", location: [-33.87, 151.21], emoji: "🦘" },
  { id: "newyork", location: [40.71, -74.0], emoji: "🗽" },
  { id: "mexico", location: [19.4, -99.1], emoji: "🌮" },
  { id: "cusco", location: [-13.5, -71.97], emoji: "🦙" },
  { id: "rio", location: [-22.9, -43.17], emoji: "🏖️" },
];

export function GlobeWeather({
  markers = defaultMarkers,
  className = "",
  speed = 0.003,
}: GlobeWeatherProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerInteracting = useRef<{ x: number; y: number } | null>(null);
  const dragOffset = useRef({ phi: 0, theta: 0 });
  const phiOffsetRef = useRef(0);
  const thetaOffsetRef = useRef(0);
  const isPausedRef = useRef(false);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    pointerInteracting.current = { x: e.clientX, y: e.clientY };
    if (canvasRef.current) canvasRef.current.style.cursor = "grabbing";
    isPausedRef.current = true;
  }, []);

  const handlePointerUp = useCallback(() => {
    if (pointerInteracting.current !== null) {
      phiOffsetRef.current += dragOffset.current.phi;
      thetaOffsetRef.current += dragOffset.current.theta;
      dragOffset.current = { phi: 0, theta: 0 };
    }
    pointerInteracting.current = null;
    if (canvasRef.current) canvasRef.current.style.cursor = "grab";
    isPausedRef.current = false;
  }, []);

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (pointerInteracting.current !== null) {
        dragOffset.current = {
          phi: (e.clientX - pointerInteracting.current.x) / 300,
          theta: (e.clientY - pointerInteracting.current.y) / 1000,
        };
      }
    };
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerup", handlePointerUp, { passive: true });
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [handlePointerUp]);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    let globe: ReturnType<typeof createGlobe> | null = null;
    let animationId: number;
    let phi = 0;

    const autoSpeed = window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches
      ? 0
      : speed;

    function init() {
      const width = canvas.offsetWidth;
      if (width === 0 || globe) return;

      const devicePixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      globe = createGlobe(canvas, {
        devicePixelRatio,
        width: width * devicePixelRatio,
        height: width * devicePixelRatio,
        phi: 0,
        theta: 0.2,
        dark: 0,
        diffuse: 1.5,
        mapSamples: 16000,
        mapBrightness: 10,
        baseColor: [0.98, 0.98, 1],
        markerColor: [0.4, 0.7, 0.95],
        glowColor: [0.94, 0.93, 0.91],
        markerElevation: 0.12,
        markers: markers.map((m) => ({
          location: m.location,
          size: 0.025,
          id: m.id,
        })),
        arcs: [],
        arcColor: [0.5, 0.8, 1],
        arcWidth: 0.5,
        arcHeight: 0.25,
        opacity: 0.7,
      });
      function animate() {
        if (!isPausedRef.current) phi += autoSpeed;
        globe!.update({
          phi: phi + phiOffsetRef.current + dragOffset.current.phi,
          theta: 0.2 + thetaOffsetRef.current + dragOffset.current.theta,
        });
        animationId = requestAnimationFrame(animate);
      }
      animate();
      setTimeout(() => canvas && (canvas.style.opacity = "1"));
    }

    if (canvas.offsetWidth > 0) {
      init();
    } else {
      const ro = new ResizeObserver((entries) => {
        if (entries[0]?.contentRect.width && entries[0].contentRect.width > 0) {
          ro.disconnect();
          init();
        }
      });
      ro.observe(canvas);
    }

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
      if (globe) globe.destroy();
    };
  }, [markers, speed]);

  return (
    <div className={`relative aspect-square select-none ${className}`}>
      <style>{`
        @keyframes weather-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
      `}</style>
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <defs>
          <filter id="sticker-outline-weather">
            <feMorphology
              in="SourceAlpha"
              result="Dilated"
              operator="dilate"
              radius="2"
            />
            <feFlood floodColor="#ffffff" result="OutlineColor" />
            <feComposite
              in="OutlineColor"
              in2="Dilated"
              operator="in"
              result="Outline"
            />
            <feMerge>
              <feMergeNode in="Outline" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        style={{
          width: "100%",
          height: "100%",
          cursor: "grab",
          opacity: 0,
          transition: "opacity 1.2s ease",
          borderRadius: "50%",
          touchAction: "none",
        }}
      />
      {markers.map((m) => (
        <div
          key={m.id}
          style={
            {
              position: "absolute",
              positionAnchor: `--cobe-${m.id}`,
              bottom: "anchor(top)",
              left: "anchor(center)",
              translate: "-50% 0",
              fontSize: "1.8rem",
              filter:
                "url(#sticker-outline-weather) drop-shadow(0 2px 6px rgba(100,150,220,0.4))",
              pointerEvents: "none",
              opacity: `var(--cobe-visible-${m.id}, 0)`,
              transition: "opacity 0.3s, filter 0.3s",
              animation: "weather-float 3s ease-in-out infinite",
            } as React.CSSProperties & { positionAnchor?: string }
          }
        >
          {m.emoji}
        </div>
      ))}
    </div>
  );
}

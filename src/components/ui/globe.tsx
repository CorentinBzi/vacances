import createGlobe, { type COBEOptions } from "cobe";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const GLOBE_CONFIG: COBEOptions = {
  width: 800,
  height: 800,
  onRender: () => {},
  devicePixelRatio: 2,
  phi: 0,
  theta: 0.3,
  dark: 0,
  diffuse: 0.4,
  mapSamples: 16000,
  mapBrightness: 1.2,
  baseColor: [1, 1, 1],
  markerColor: [251 / 255, 100 / 255, 21 / 255],
  glowColor: [1, 1, 1],
  markers: [
    { location: [48.8566, 2.3522], size: 0.09 }, // Paris
    { location: [41.9028, 12.4964], size: 0.07 }, // Rome
    { location: [37.9838, 23.7275], size: 0.06 }, // Athens
    { location: [35.0116, 135.7681], size: 0.06 }, // Kyoto
    { location: [-8.4095, 115.1889], size: 0.08 }, // Bali
    { location: [40.4168, -3.7038], size: 0.06 }, // Madrid
    { location: [64.9631, -19.0208], size: 0.05 }, // Iceland
    { location: [31.6295, -7.9811], size: 0.06 }, // Marrakech
    { location: [-33.8688, 151.2093], size: 0.07 }, // Sydney
    { location: [25.2048, 55.2708], size: 0.06 }, // Dubai
    { location: [40.7128, -74.006], size: 0.08 }, // New York
    { location: [13.7563, 100.5018], size: 0.06 }, // Bangkok
  ],
};

export function Globe({
  className,
  config = GLOBE_CONFIG,
}: {
  className?: string;
  config?: COBEOptions;
}) {
  const phiRef = useRef(0);
  const widthRef = useRef(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerInteracting = useRef<number | null>(null);
  const pointerInteractionMovement = useRef(0);
  const [r, setR] = useState(0);

  const updatePointerInteraction = (value: number | null) => {
    pointerInteracting.current = value;
    if (canvasRef.current) {
      canvasRef.current.style.cursor = value !== null ? "grabbing" : "grab";
    }
  };

  const updateMovement = (clientX: number) => {
    if (pointerInteracting.current !== null) {
      const delta = clientX - pointerInteracting.current;
      pointerInteractionMovement.current = delta;
      setR(delta / 200);
    }
  };

  const onRender = useCallback(
    (state: Record<string, number>) => {
      if (pointerInteracting.current === null) phiRef.current += 0.005;
      state.phi = phiRef.current + r;
      state.width = widthRef.current * 2;
      state.height = widthRef.current * 2;
    },
    [r]
  );

  const onResize = () => {
    if (canvasRef.current) widthRef.current = canvasRef.current.offsetWidth;
  };

  useEffect(() => {
    window.addEventListener("resize", onResize);
    onResize();

    const globe = createGlobe(canvasRef.current!, {
      ...config,
      width: widthRef.current * 2,
      height: widthRef.current * 2,
      onRender,
    });

    const t = setTimeout(() => {
      if (canvasRef.current) canvasRef.current.style.opacity = "1";
    });
    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", onResize);
      globe.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className={cn(
        "absolute inset-0 mx-auto aspect-[1/1] w-full max-w-[600px]",
        className
      )}
    >
      <canvas
        className="size-full opacity-0 transition-opacity duration-500 [contain:layout_paint_size]"
        ref={canvasRef}
        onPointerDown={(e) =>
          updatePointerInteraction(
            e.clientX - pointerInteractionMovement.current
          )
        }
        onPointerUp={() => updatePointerInteraction(null)}
        onPointerOut={() => updatePointerInteraction(null)}
        onMouseMove={(e) => updateMovement(e.clientX)}
        onTouchMove={(e) =>
          e.touches[0] && updateMovement(e.touches[0].clientX)
        }
      />
    </div>
  );
}

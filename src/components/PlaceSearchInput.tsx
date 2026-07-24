import { useEffect, useRef, useState } from "react";
import { Loader2, MapPin, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { searchPlaces, type PlaceResult } from "@/lib/api/places";
import { cn } from "@/lib/utils";

const DEBOUNCE_MS = 350;

/** Debounced OpenStreetMap place search with a results dropdown. */
export function PlaceSearchInput({
  placeholder = "Rechercher un lieu, une ville, un pays…",
  value,
  onSelect,
  onClear,
  className,
}: {
  placeholder?: string;
  value?: string;
  onSelect: (place: PlaceResult) => void;
  onClear?: () => void;
  className?: string;
}) {
  const [text, setText] = useState(value ?? "");
  const [results, setResults] = useState<PlaceResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => setText(value ?? ""), [value]);

  useEffect(() => {
    if (text.trim().length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const timer = setTimeout(async () => {
      abortRef.current?.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      try {
        const res = await searchPlaces(text, { signal: ctrl.signal });
        setResults(res);
        setOpen(true);
      } catch {
        /* aborted or network error */
      } finally {
        setLoading(false);
      }
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [text]);

  // Close dropdown on outside click.
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node))
        setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={boxRef} className={cn("relative", className)}>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft/60" />
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onFocus={() => results.length && setOpen(true)}
          placeholder={placeholder}
          className="pl-9 pr-9"
        />
        {loading ? (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-ink-soft/60" />
        ) : text ? (
          <button
            type="button"
            onClick={() => {
              setText("");
              setResults([]);
              onClear?.();
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-ink-soft/60 hover:bg-azure/10"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      {open && results.length > 0 && (
        <ul className="absolute z-40 mt-2 max-h-72 w-full overflow-auto rounded-2xl border border-linen bg-card p-1.5 shadow-xl">
          {results.map((r) => (
            <li key={r.id}>
              <button
                type="button"
                onClick={() => {
                  onSelect(r);
                  setText(r.name);
                  setOpen(false);
                }}
                className="flex w-full items-start gap-2 rounded-xl px-3 py-2 text-left hover:bg-azure/10"
              >
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-azure" />
                <span>
                  <span className="block text-sm font-medium text-ink">
                    {r.name}
                  </span>
                  <span className="block text-xs text-ink-soft line-clamp-1">
                    {r.displayName}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

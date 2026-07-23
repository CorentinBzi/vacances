// Date helpers for the availability window. All arithmetic is done in UTC so
// there are no daylight-saving / timezone off-by-one surprises.

const MS_PER_DAY = 86_400_000;

const MONTH_LABELS = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

export const WEEKDAY_LABELS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

function parse(iso: string): Date {
  return new Date(iso + "T00:00:00Z");
}

/** Inclusive list of ISO days between two ISO dates. */
export function enumerateDays(startISO: string, endISO: string): string[] {
  const days: string[] = [];
  let t = parse(startISO).getTime();
  const end = parse(endISO).getTime();
  while (t <= end) {
    days.push(new Date(t).toISOString().slice(0, 10));
    t += MS_PER_DAY;
  }
  return days;
}

export interface MonthGrid {
  key: string; // "2026-10"
  label: string; // "Octobre 2026"
  /** 7-column, Monday-first cells; null = padding. */
  cells: (string | null)[];
}

/** Group ISO days into Monday-first month grids for calendar rendering. */
export function groupIntoMonths(days: string[]): MonthGrid[] {
  const byMonth = new Map<string, string[]>();
  for (const d of days) {
    const key = d.slice(0, 7);
    if (!byMonth.has(key)) byMonth.set(key, []);
    byMonth.get(key)!.push(d);
  }

  return [...byMonth.entries()].map(([key, monthDays]) => {
    const first = parse(monthDays[0]);
    // JS: Sunday=0..Saturday=6 -> convert to Monday-first index.
    const lead = (first.getUTCDay() + 6) % 7;
    const cells: (string | null)[] = Array(lead).fill(null);
    for (const d of monthDays) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);
    const [y, m] = key.split("-");
    return {
      key,
      label: `${MONTH_LABELS[Number(m) - 1]} ${y}`,
      cells,
    };
  });
}

export function formatDayNumber(iso: string): string {
  return String(parse(iso).getUTCDate());
}

export function formatLongDate(iso: string): string {
  const d = parse(iso);
  return `${WEEKDAY_LABELS[(d.getUTCDay() + 6) % 7]} ${d.getUTCDate()} ${
    MONTH_LABELS[d.getUTCMonth()]
  } ${d.getUTCFullYear()}`;
}

export interface AvailabilityRow {
  userName: string;
  unavailableDates: string[];
}

export interface DayStat {
  date: string;
  availableCount: number;
  unavailableNames: string[];
  /** True when everyone who submitted is available. */
  perfect: boolean;
}

/**
 * For each day, how many of the submitted participants are available and who
 * is not. `submittedCount` is the number of people who have entered their
 * availability (the denominator for "perfect" days).
 */
export function computeDayStats(
  days: string[],
  rows: AvailabilityRow[]
): { stats: Map<string, DayStat>; submittedCount: number } {
  const submittedCount = rows.length;
  const stats = new Map<string, DayStat>();
  for (const date of days) {
    const unavailableNames = rows
      .filter((r) => r.unavailableDates.includes(date))
      .map((r) => r.userName);
    const availableCount = submittedCount - unavailableNames.length;
    stats.set(date, {
      date,
      availableCount,
      unavailableNames,
      perfect: submittedCount > 0 && unavailableNames.length === 0,
    });
  }
  return { stats, submittedCount };
}

export interface BestWindow {
  start: string;
  end: string;
  length: number;
}

/** Longest runs of consecutive "perfect" days (everyone available). */
export function findBestWindows(
  days: string[],
  stats: Map<string, DayStat>,
  max = 3
): BestWindow[] {
  const windows: BestWindow[] = [];
  let runStart: string | null = null;
  let prev: string | null = null;

  const flush = (end: string) => {
    if (runStart) {
      const length =
        Math.round((parse(end).getTime() - parse(runStart).getTime()) / MS_PER_DAY) +
        1;
      windows.push({ start: runStart, end, length });
    }
    runStart = null;
  };

  for (const d of days) {
    if (stats.get(d)?.perfect) {
      if (!runStart) runStart = d;
    } else {
      if (prev) flush(prev);
    }
    prev = d;
  }
  if (runStart && prev) flush(prev);

  return windows.sort((a, b) => b.length - a.length).slice(0, max);
}

import { formatClock } from "@/lib/formatTime";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const BUCKET_LABEL: Record<string, string> = {
  "5min": "5 minute stretch",
  "10min": "10 minute stretch",
  "15min": "15 minute stretch",
  break: "Break",
};

/**
 * Purely presentational — no data fetching of its own. Rendered identically
 * whether inline in the main window or portalled into the Document PiP
 * window, so "looks the same in both places" holds by construction.
 */
export function Timer({
  bucketKind,
  remainingMs,
  totalMs,
  className,
}: {
  bucketKind: string;
  remainingMs: number;
  totalMs: number;
  className?: string;
}) {
  const progressPercent = totalMs > 0 ? (1 - remainingMs / totalMs) * 100 : 0;

  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
        {BUCKET_LABEL[bucketKind] ?? bucketKind}
      </span>
      <span className="font-display text-7xl font-semibold tabular-nums">
        {formatClock(remainingMs)}
      </span>
      <Progress value={progressPercent} className="w-40" />
    </div>
  );
}

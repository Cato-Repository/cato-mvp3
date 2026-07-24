import { cn } from "@/lib/utils";

const BUCKET_LABEL: Record<string, string> = {
  "5min": "5 minutes",
  "10min": "10 minutes",
  "15min": "15 minutes",
  break: "Break",
};

export function BucketSection({
  kind,
  durationMinutes,
  steps,
}: {
  kind: string;
  durationMinutes: number;
  steps: { _id: string; title: string; completed: boolean }[];
}) {
  const isBreak = kind === "break";

  return (
    <section className={cn("flex flex-col gap-2 rounded-lg border p-4", isBreak && "bg-accent/20")}>
      <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
        {BUCKET_LABEL[kind] ?? kind}
        {!isBreak && ` · ${durationMinutes} min`}
      </span>
      {isBreak ? (
        <p className="text-muted-foreground text-sm">
          Step away for {durationMinutes} minutes before the next task.
        </p>
      ) : (
        <ol className="flex flex-col gap-1.5">
          {steps.map((step, i) => (
            <li key={step._id} className="flex gap-2 text-sm">
              <span className="text-muted-foreground w-4 shrink-0 text-right">
                {i + 1}.
              </span>
              <span>{step.title}</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { BucketSection } from "@/components/breakdown/BucketSection";
import { Skeleton } from "@/components/ui/skeleton";
import type { Id } from "@/convex/_generated/dataModel";

export function BreakdownView({
  taskId,
  onStartSession,
  starting,
}: {
  taskId: Id<"tasks">;
  onStartSession: () => void;
  starting: boolean;
}) {
  const buckets = useQuery(api.breakdown.getBreakdownForTask, { taskId });

  if (buckets == null) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-24 w-full rounded-lg" />
        <Skeleton className="h-24 w-full rounded-lg" />
        <Skeleton className="h-24 w-full rounded-lg" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {buckets.map((bucket) => (
        <BucketSection
          key={bucket._id}
          kind={bucket.kind}
          durationMinutes={bucket.durationMinutes}
          steps={bucket.steps}
        />
      ))}
      <Button size="lg" className="mt-2" onClick={onStartSession} disabled={starting}>
        {starting ? "Starting..." : "Start session"}
      </Button>
    </div>
  );
}

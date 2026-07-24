"use client";

import { useEffect, useRef, useState } from "react";
import { useAction, useMutation, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { ClarificationChat } from "@/components/clarification/ClarificationChat";
import { BreakdownView } from "@/components/breakdown/BreakdownView";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight } from "lucide-react";
import type { Id } from "@/convex/_generated/dataModel";

/**
 * The clarification + breakdown-review phases, rendered inline under a
 * task card on /plan instead of navigating to /plan/[taskId]. Once a
 * session actually starts, this hands off to the dedicated full-page
 * session view instead of trying to embed the timer here — the PiP
 * timer's lifecycle needs a page that won't unmount out from under it,
 * which an accordion section can't promise.
 */
export function TaskWorkspace({ taskId }: { taskId: Id<"tasks"> }) {
  const router = useRouter();
  const task = useQuery(api.tasks.getTask, { taskId });
  const activeSession = useQuery(api.sessions.getActiveSessionForTask, { taskId });
  const buckets = useQuery(api.breakdown.getBreakdownForTask, { taskId });
  const generateBreakdown = useAction(api.breakdownActions.generateBreakdown);
  const startSession = useMutation(api.sessions.startSession);

  const [starting, setStarting] = useState(false);
  const generatingRef = useRef(false);

  const clarificationDone = task?.clarificationDone === true;
  const hasBreakdown = buckets != null && buckets.length > 0;

  useEffect(() => {
    if (
      clarificationDone &&
      task?.status === "not_started" &&
      buckets != null &&
      buckets.length === 0 &&
      !generatingRef.current
    ) {
      generatingRef.current = true;
      generateBreakdown({ taskId }).finally(() => {
        generatingRef.current = false;
      });
    }
  }, [clarificationDone, task?.status, buckets, generateBreakdown, taskId]);

  async function handleStartSession() {
    setStarting(true);
    await startSession({ taskId });
    router.push(`/plan/${taskId}`);
  }

  if (task === undefined) {
    return <Skeleton className="h-16 w-full rounded-lg" />;
  }
  if (task === null) return null;

  if (activeSession != null) {
    return (
      <Button
        variant="outline"
        className="w-full justify-between"
        onClick={() => router.push(`/plan/${taskId}`)}
      >
        Session in progress
        <ArrowRight className="h-4 w-4" />
      </Button>
    );
  }

  if (!clarificationDone) {
    return <ClarificationChat taskId={taskId} />;
  }

  if (!hasBreakdown) {
    return (
      <div className="flex flex-col gap-2">
        <p className="text-muted-foreground text-center text-sm">
          Breaking this down into small steps...
        </p>
        <Skeleton className="h-16 w-full rounded-lg" />
      </div>
    );
  }

  return <BreakdownView taskId={taskId} onStartSession={handleStartSession} starting={starting} />;
}

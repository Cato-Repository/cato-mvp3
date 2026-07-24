"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Timer } from "@/components/session/Timer";
import { CurrentStepLine } from "@/components/session/CurrentStepLine";
import { PipHost } from "@/components/session/PipHost";
import { notifyFocusStreak } from "@/lib/notifications";
import { Pause, Play, Square } from "lucide-react";
import type { Id } from "@/convex/_generated/dataModel";

const FOCUS_STREAK_MS = 15 * 60 * 1000;

export function SessionView({
  taskId,
  pipWindow,
  onPipClosed,
}: {
  taskId: Id<"tasks">;
  pipWindow: Window | null;
  onPipClosed: () => void;
}) {
  const session = useQuery(api.sessions.getActiveSessionForTask, { taskId });
  const buckets = useQuery(api.breakdown.getBreakdownForTask, { taskId });
  const pauseSession = useMutation(api.sessions.pauseSession);
  const resumeSession = useMutation(api.sessions.resumeSession);
  const advanceBucket = useMutation(api.sessions.advanceBucket);
  const endSession = useMutation(api.sessions.endSession);
  const toggleStepCompleted = useMutation(api.breakdown.toggleStepCompleted);
  const claimFocusStreak = useMutation(api.sessions.claimFocusStreakNotification);

  const [now, setNow] = useState(() => Date.now());
  const advancingRef = useRef(false);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const currentBucket = buckets?.find((b) => b._id === session?.currentBucketId);

  // Auto-advance to the next bucket once the current one's time is up.
  useEffect(() => {
    if (session === null || session === undefined) return;
    if (session.status !== "active" || currentBucket === undefined) return;
    const remainingMs = currentBucket.durationMinutes * 60 * 1000 - (now - session.bucketStartedAt);
    if (remainingMs <= 0 && !advancingRef.current) {
      advancingRef.current = true;
      advanceBucket({ sessionId: session._id }).finally(() => {
        advancingRef.current = false;
      });
    }
  }, [now, session, currentBucket, advanceBucket]);

  // 15-minute sustained-focus streak check, cross-tab-safe via a Convex claim.
  useEffect(() => {
    if (session === null || session === undefined) return;
    if (session.status !== "active" || session.segmentStartedAt === undefined) return;

    const sustainedMs = session.accumulatedMs + (now - session.segmentStartedAt);
    if (sustainedMs < FOCUS_STREAK_MS) return;

    claimFocusStreak({
      sessionId: session._id,
      segmentStartedAt: session.segmentStartedAt,
    }).then((won) => {
      if (!won) return;
      toast("Nice focus — 15 min in.", {
        description: "Keep going, one step at a time.",
        duration: 6000,
      });
      notifyFocusStreak("15 focused minutes. Nice and steady.");
    });
  }, [now, session, claimFocusStreak]);

  if (session === undefined || buckets === undefined) return null;
  if (session === null || currentBucket === undefined) return null;

  const totalMs = currentBucket.durationMinutes * 60 * 1000;
  const elapsedMs = now - session.bucketStartedAt;
  const remainingMs = session.status === "active" ? Math.max(0, totalMs - elapsedMs) : totalMs - elapsedMs;

  const firstIncompleteStep = currentBucket.steps.find((s) => !s.completed);
  const stepText =
    currentBucket.kind === "break"
      ? "Step away for a moment."
      : (firstIncompleteStep?.title ?? "All steps in this stretch are done.");

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center gap-8 px-6">
      <PipHost pipWindow={pipWindow} onPipClosed={onPipClosed}>
        <Timer bucketKind={currentBucket.kind} remainingMs={remainingMs} totalMs={totalMs} />
        <CurrentStepLine text={stepText} />
      </PipHost>

      {pipWindow !== null && (
        <p className="text-muted-foreground text-xs">
          Timer is running in the floating window.
        </p>
      )}

      <div className="flex items-center gap-2">
        {firstIncompleteStep !== undefined && currentBucket.kind !== "break" && (
          <Button
            variant="outline"
            onClick={() => toggleStepCompleted({ stepId: firstIncompleteStep._id, completed: true })}
          >
            Done, next step
          </Button>
        )}
        {session.status === "active" ? (
          <Button variant="outline" size="icon" onClick={() => pauseSession({ sessionId: session._id })}>
            <Pause />
          </Button>
        ) : (
          <Button variant="outline" size="icon" onClick={() => resumeSession({ sessionId: session._id })}>
            <Play />
          </Button>
        )}
        <Button variant="ghost" size="icon" onClick={() => endSession({ sessionId: session._id })}>
          <Square />
        </Button>
      </div>
    </div>
  );
}

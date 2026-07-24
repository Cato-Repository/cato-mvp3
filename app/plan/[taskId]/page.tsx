"use client";

import { use, useEffect, useRef, useState } from "react";
import { useAction, useMutation, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { ClarificationChat } from "@/components/clarification/ClarificationChat";
import { BreakdownView } from "@/components/breakdown/BreakdownView";
import { SessionView } from "@/components/session/SessionView";
import { Skeleton } from "@/components/ui/skeleton";
import { openTimerPipWindow } from "@/lib/pip";
import { ensureNotificationPermission } from "@/lib/notifications";
import type { Id } from "@/convex/_generated/dataModel";

export default function TaskPage({
  params,
}: {
  params: Promise<{ taskId: string }>;
}) {
  const { taskId } = use(params);
  const id = taskId as Id<"tasks">;
  const router = useRouter();

  const task = useQuery(api.tasks.getTask, { taskId: id });
  const activeSession = useQuery(api.sessions.getActiveSessionForTask, { taskId: id });
  const buckets = useQuery(api.breakdown.getBreakdownForTask, { taskId: id });
  const generateBreakdown = useAction(api.breakdownActions.generateBreakdown);
  const startSession = useMutation(api.sessions.startSession);

  const [pipWindow, setPipWindow] = useState<Window | null>(null);
  const [starting, setStarting] = useState(false);
  const generatingRef = useRef(false);

  const clarificationDone = task?.clarificationDone === true;
  const hasBreakdown = buckets != null && buckets.length > 0;

  useEffect(() => {
    if (task === null) router.replace("/plan");
  }, [task, router]);

  useEffect(() => {
    if (
      clarificationDone &&
      task?.status === "not_started" &&
      buckets != null &&
      buckets.length === 0 &&
      !generatingRef.current
    ) {
      generatingRef.current = true;
      generateBreakdown({ taskId: id }).finally(() => {
        generatingRef.current = false;
      });
    }
  }, [clarificationDone, task?.status, buckets, generateBreakdown, id]);

  async function handleStartSession() {
    setStarting(true);
    // Must be the first async call in this handler — a Document PiP
    // request needs the click's transient user-activation, which is
    // consumed by any earlier `await`.
    const win = await openTimerPipWindow();
    setPipWindow(win);
    await startSession({ taskId: id });
    await ensureNotificationPermission();
    setStarting(false);
  }

  if (task === undefined) {
    return (
      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center gap-4 px-6">
        <Skeleton className="h-24 w-full rounded-lg" />
      </div>
    );
  }
  if (task === null) return null;

  return (
    <div className="flex h-screen flex-col">
      <header className="flex items-center border-b px-6 py-4">
        <span className="font-display truncate text-sm font-medium">{task.title}</span>
      </header>
      <main className="flex min-h-0 flex-1 flex-col">
        {activeSession != null ? (
          <SessionView taskId={id} initialPipWindow={pipWindow} />
        ) : (
          <div className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center gap-4 px-6 py-12">
            {!clarificationDone ? (
              <ClarificationChat taskId={id} />
            ) : hasBreakdown ? (
              <BreakdownView taskId={id} onStartSession={handleStartSession} starting={starting} />
            ) : (
              <>
                <p className="text-muted-foreground text-center text-sm">
                  Breaking this down into small steps...
                </p>
                <Skeleton className="h-24 w-full rounded-lg" />
                <Skeleton className="h-24 w-full rounded-lg" />
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

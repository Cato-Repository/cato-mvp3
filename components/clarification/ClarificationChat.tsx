"use client";

import { useEffect, useRef, useState } from "react";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ClarificationTurn } from "@/components/clarification/ClarificationTurn";
import { Skeleton } from "@/components/ui/skeleton";
import type { Id } from "@/convex/_generated/dataModel";

export function ClarificationChat({ taskId }: { taskId: Id<"tasks"> }) {
  const turns = useQuery(api.clarification.getTurnsForTask, { taskId });
  const submitAnswer = useMutation(api.clarification.submitAnswer);
  const askNextQuestion = useAction(api.clarificationActions.askNextQuestion);
  const [answer, setAnswer] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const askedFirstQuestion = useRef(false);

  useEffect(() => {
    if (turns === undefined) return;
    if (turns.length === 0 && !askedFirstQuestion.current) {
      askedFirstQuestion.current = true;
      setIsThinking(true);
      askNextQuestion({ taskId }).finally(() => setIsThinking(false));
    }
  }, [turns, taskId, askNextQuestion]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = answer.trim();
    if (trimmed === "") return;
    setAnswer("");
    await submitAnswer({ taskId, content: trimmed });
    setIsThinking(true);
    await askNextQuestion({ taskId });
    setIsThinking(false);
  }

  const lastTurn = turns?.[turns.length - 1];
  const awaitingAnswer = lastTurn?.role === "assistant" && !isThinking;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        {turns?.map((turn) => (
          <ClarificationTurn key={turn._id} role={turn.role} content={turn.content} />
        ))}
        {isThinking && (
          <div className="flex justify-start">
            <Skeleton className="h-9 w-48 rounded-xl" />
          </div>
        )}
      </div>

      {awaitingAnswer && (
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <Input
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type your answer..."
            autoFocus
          />
          <Button type="submit" disabled={answer.trim() === ""}>
            Send
          </Button>
        </form>
      )}
    </div>
  );
}

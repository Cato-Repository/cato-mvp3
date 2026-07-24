import { z } from "zod";

const clarifyResultSchema = z.object({
  done: z.boolean(),
  question: z.string().optional(),
});

export type ClarifyResult = z.infer<typeof clarifyResultSchema>;

export type ClarifyTurn = { role: "assistant" | "user"; content: string };

const FALLBACK_QUESTIONS = [
  "What does \"done\" look like for this task?",
  "Roughly how much time do you realistically have for this today?",
  "Is there a specific part of this you're most unsure how to start?",
];

/**
 * Stub for the clarification LLM call. Real implementation (Vertex AI /
 * Gemini via `generateObject`) is deferred — this mimics the intended
 * behavior (ask up to 2 short follow-up questions, then signal done) with
 * a fixed question pool so the UI and Convex plumbing around it are fully
 * exercisable without live credentials. Swap the body of this function for
 * a real `generateObject` call when Vertex AI is wired up; the schema and
 * call signature are designed to stay the same.
 */
export async function clarifyNextQuestion(
  taskTitle: string,
  priorTurns: ClarifyTurn[]
): Promise<ClarifyResult> {
  await new Promise((resolve) => setTimeout(resolve, 400));

  const questionsAskedSoFar = priorTurns.filter((t) => t.role === "assistant").length;
  const userHasAnswered = priorTurns.some((t) => t.role === "user");

  if (questionsAskedSoFar === 0) {
    return {
      done: false,
      question: `To help break down "${taskTitle}", ${FALLBACK_QUESTIONS[0].toLowerCase()}`,
    };
  }

  if (questionsAskedSoFar === 1 && userHasAnswered) {
    return { done: false, question: FALLBACK_QUESTIONS[1] };
  }

  return { done: true };
}

export { clarifyResultSchema };

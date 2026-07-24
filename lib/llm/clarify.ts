import { generateObject } from "ai";
import { z } from "zod";
import { vertex, GEMINI_MODEL } from "./vertex";

const clarifyResultSchema = z.object({
  done: z.boolean(),
  question: z.string().optional(),
});

export type ClarifyResult = z.infer<typeof clarifyResultSchema>;

export type ClarifyTurn = { role: "assistant" | "user"; content: string };

// Hard safety cap independent of the model's own judgment — keeps the
// clarification round from running away even if the LLM keeps asking.
const MAX_QUESTIONS = 2;

export async function clarifyNextQuestion(
  taskTitle: string,
  priorTurns: ClarifyTurn[]
): Promise<ClarifyResult> {
  const questionsAskedSoFar = priorTurns.filter((t) => t.role === "assistant").length;
  if (questionsAskedSoFar >= MAX_QUESTIONS) {
    return { done: true };
  }

  const transcript =
    priorTurns.length > 0
      ? priorTurns.map((t) => `${t.role === "assistant" ? "You" : "User"}: ${t.content}`).join("\n")
      : "(no messages yet)";

  const { object } = await generateObject({
    model: vertex(GEMINI_MODEL),
    schema: clarifyResultSchema,
    prompt: `You are helping a user clarify a task before it gets broken down into a short focused work session.

Task: "${taskTitle}"

Conversation so far:
${transcript}

Decide whether you already have enough context to break this task down into concrete steps. If the task is still vague (e.g. you don't know what "done" looks like, what's already been done, or what part they're stuck on), ask ONE short, conversational follow-up question — under 20 words, not a form field. Otherwise, set done to true and omit the question. You will not be allowed to ask more than ${MAX_QUESTIONS} questions total, so don't hold back if you have a genuinely important one.`,
  });

  return object;
}

export { clarifyResultSchema };

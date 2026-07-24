import { generateObject } from "ai";
import { z } from "zod";
import { vertex, GEMINI_MODEL } from "./vertex";

const bucketSchema = z.object({
  kind: z.enum(["5min", "10min", "15min", "break"]),
  durationMinutes: z.number(),
  steps: z.array(z.string()),
});

const breakdownSchema = z.object({
  buckets: z.array(bucketSchema),
});

export type BreakdownBucket = z.infer<typeof bucketSchema>;
export type BreakdownResult = z.infer<typeof breakdownSchema>;

// The LLM only fills in step text for the three timed buckets — bucket
// kind/order/duration and the trailing break are fixed by the product
// spec, not left to the model, so there's no schema surface for it to
// get that structure wrong.
const stepsSchema = z.object({
  fiveMinuteSteps: z.array(z.string()),
  tenMinuteSteps: z.array(z.string()),
  fifteenMinuteSteps: z.array(z.string()),
});

export async function generateTaskBreakdown(
  taskTitle: string,
  clarificationContext: string[]
): Promise<BreakdownResult> {
  const context =
    clarificationContext.length > 0
      ? clarificationContext.map((c, i) => `${i + 1}. ${c}`).join("\n")
      : "(no additional context provided)";

  const { object } = await generateObject({
    model: vertex(GEMINI_MODEL),
    schema: stepsSchema,
    prompt: `Break the following task into a short focused work session made of three increasingly substantial stretches: a 5-minute warm-up, a 10-minute stretch, and a 15-minute stretch. Each stretch should list 1-4 short, concrete, actionable steps (not vague), phrased as direct instructions to the person doing the task. The 5-minute steps should be low-friction ways to start. The 15-minute steps should carry the bulk of the work.

Task: "${taskTitle}"

Additional context from the user:
${context}`,
  });

  return {
    buckets: [
      { kind: "5min", durationMinutes: 5, steps: object.fiveMinuteSteps },
      { kind: "10min", durationMinutes: 10, steps: object.tenMinuteSteps },
      { kind: "15min", durationMinutes: 15, steps: object.fifteenMinuteSteps },
      { kind: "break", durationMinutes: 5, steps: [] },
    ],
  };
}

export { breakdownSchema };

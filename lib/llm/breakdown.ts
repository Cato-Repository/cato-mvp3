import { z } from "zod";

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

/**
 * Stub for the breakdown LLM call. Real implementation (Vertex AI / Gemini
 * via `generateObject`) is deferred — this returns a shape-correct, fixed
 * 4-bucket sequence (5 / 10 / 15 min + break) with generic but plausible
 * step text derived from the task title, so the UI and Convex plumbing
 * around it are fully exercisable without live credentials. Swap the body
 * of this function for a real `generateObject` call when Vertex AI is
 * wired up; the schema and call signature are designed to stay the same.
 */
export async function generateTaskBreakdown(
  taskTitle: string,
  clarificationContext: string[]
): Promise<BreakdownResult> {
  await new Promise((resolve) => setTimeout(resolve, 600));

  const context = clarificationContext.length > 0 ? clarificationContext.join(" ") : "";
  void context; // included for parity with the eventual real prompt, unused by the stub

  return {
    buckets: [
      {
        kind: "5min",
        durationMinutes: 5,
        steps: [
          `Open everything you need for "${taskTitle}"`,
          "Write one sentence describing what a finished result looks like",
        ],
      },
      {
        kind: "10min",
        durationMinutes: 10,
        steps: [
          "Rough out the first section or piece",
          "Note anything you're unsure about instead of stopping to look it up",
        ],
      },
      {
        kind: "15min",
        durationMinutes: 15,
        steps: [
          "Fill in the rest of the draft",
          "Resolve the open questions you noted earlier",
          "Do a quick pass to tidy it up",
        ],
      },
      {
        kind: "break",
        durationMinutes: 5,
        steps: [],
      },
    ],
  };
}

export { breakdownSchema };

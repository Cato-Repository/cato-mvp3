"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { generateTaskBreakdown } from "../lib/llm/breakdown";

export const generateBreakdown = action({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    const data = await ctx.runQuery(internal.breakdown.getTaskAndTurnsForBreakdownInternal, {
      taskId: args.taskId,
    });
    if (data === null) throw new Error("Task not found");

    const clarificationContext = data.turns.map((t) => t.content);
    const result = await generateTaskBreakdown(data.task.title, clarificationContext);

    await ctx.runMutation(internal.breakdown.insertBreakdownInternal, {
      taskId: args.taskId,
      buckets: result.buckets,
    });

    console.log("breakdown_generated", {
      taskId: args.taskId,
      bucketCount: result.buckets.length,
    });
  },
});

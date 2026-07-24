import { v } from "convex/values";
import { internalQuery, internalMutation, mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

export const getBreakdownForTask = query({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (user === null) return null;

    const task = await ctx.db.get("tasks", args.taskId);
    if (task === null || task.userId !== user._id) return null;

    const buckets = await ctx.db
      .query("buckets")
      .withIndex("by_taskId", (q) => q.eq("taskId", args.taskId))
      .collect();
    buckets.sort((a, b) => a.order - b.order);

    const bucketsWithSteps = await Promise.all(
      buckets.map(async (bucket) => {
        const steps = await ctx.db
          .query("microSteps")
          .withIndex("by_bucketId", (q) => q.eq("bucketId", bucket._id))
          .collect();
        steps.sort((a, b) => a.order - b.order);
        return { ...bucket, steps };
      })
    );

    return bucketsWithSteps;
  },
});

export const toggleStepCompleted = mutation({
  args: { stepId: v.id("microSteps"), completed: v.boolean() },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (user === null) throw new Error("Not authenticated");

    const step = await ctx.db.get("microSteps", args.stepId);
    if (step === null) throw new Error("Step not found");
    const bucket = await ctx.db.get("buckets", step.bucketId);
    if (bucket === null) throw new Error("Bucket not found");
    const task = await ctx.db.get("tasks", bucket.taskId);
    if (task === null || task.userId !== user._id) {
      throw new Error("Step not found");
    }

    await ctx.db.patch("microSteps", args.stepId, { completed: args.completed });
  },
});

export const getTaskAndTurnsForBreakdownInternal = internalQuery({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    const task = await ctx.db.get("tasks", args.taskId);
    if (task === null) return null;

    const turns = await ctx.db
      .query("clarificationTurns")
      .withIndex("by_taskId", (q) => q.eq("taskId", args.taskId))
      .collect();
    turns.sort((a, b) => a.order - b.order);

    return { task, turns };
  },
});

export const insertBreakdownInternal = internalMutation({
  args: {
    taskId: v.id("tasks"),
    buckets: v.array(
      v.object({
        kind: v.string(),
        durationMinutes: v.number(),
        steps: v.array(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    for (let i = 0; i < args.buckets.length; i++) {
      const bucket = args.buckets[i];
      const bucketId = await ctx.db.insert("buckets", {
        taskId: args.taskId,
        kind: bucket.kind,
        order: i,
        durationMinutes: bucket.durationMinutes,
      });
      for (let j = 0; j < bucket.steps.length; j++) {
        await ctx.db.insert("microSteps", {
          bucketId,
          title: bucket.steps[j],
          order: j,
          completed: false,
        });
      }
    }

    await ctx.db.patch("tasks", args.taskId, { status: "broken_down" });
  },
});

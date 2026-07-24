import { mutation, query, internalQuery, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { getCurrentUser } from "./users";

export const createTask = mutation({
  args: { date: v.string(), title: v.string() },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (user === null) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("tasks")
      .withIndex("by_userId_and_date", (q) =>
        q.eq("userId", user._id).eq("date", args.date)
      )
      .collect();
    const nextOrder = existing.length === 0
      ? 0
      : Math.max(...existing.map((t) => t.order)) + 1;

    return await ctx.db.insert("tasks", {
      userId: user._id,
      date: args.date,
      title: args.title,
      status: "not_started",
      order: nextOrder,
      createdAt: Date.now(),
    });
  },
});

export const getTasksForDate = query({
  args: { date: v.string() },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (user === null) return [];

    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_userId_and_date", (q) =>
        q.eq("userId", user._id).eq("date", args.date)
      )
      .collect();
    return tasks.sort((a, b) => a.order - b.order);
  },
});

export const getTask = query({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (user === null) return null;

    const task = await ctx.db.get("tasks", args.taskId);
    if (task === null || task.userId !== user._id) return null;
    return task;
  },
});

export const getTaskByIdInternal = internalQuery({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    return await ctx.db.get("tasks", args.taskId);
  },
});

export const updateTaskStatusInternal = internalMutation({
  args: { taskId: v.id("tasks"), status: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch("tasks", args.taskId, { status: args.status });
  },
});

export const deleteTask = mutation({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (user === null) throw new Error("Not authenticated");

    const task = await ctx.db.get("tasks", args.taskId);
    if (task === null || task.userId !== user._id) {
      throw new Error("Task not found");
    }

    const turns = await ctx.db
      .query("clarificationTurns")
      .withIndex("by_taskId", (q) => q.eq("taskId", args.taskId))
      .collect();
    for (const turn of turns) await ctx.db.delete("clarificationTurns", turn._id);

    const buckets = await ctx.db
      .query("buckets")
      .withIndex("by_taskId", (q) => q.eq("taskId", args.taskId))
      .collect();
    for (const bucket of buckets) {
      const steps = await ctx.db
        .query("microSteps")
        .withIndex("by_bucketId", (q) => q.eq("bucketId", bucket._id))
        .collect();
      for (const step of steps) await ctx.db.delete("microSteps", step._id);
      await ctx.db.delete("buckets", bucket._id);
    }

    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_taskId", (q) => q.eq("taskId", args.taskId))
      .collect();
    for (const session of sessions) await ctx.db.delete("sessions", session._id);

    await ctx.db.delete("tasks", args.taskId);
  },
});

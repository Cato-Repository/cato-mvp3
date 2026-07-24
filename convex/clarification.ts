import { v } from "convex/values";
import { internalQuery, internalMutation, mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

export const getTurnsForTask = query({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (user === null) return [];

    const task = await ctx.db.get("tasks", args.taskId);
    if (task === null || task.userId !== user._id) return [];

    const turns = await ctx.db
      .query("clarificationTurns")
      .withIndex("by_taskId", (q) => q.eq("taskId", args.taskId))
      .collect();
    return turns.sort((a, b) => a.order - b.order);
  },
});

export const submitAnswer = mutation({
  args: { taskId: v.id("tasks"), content: v.string() },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (user === null) throw new Error("Not authenticated");

    const task = await ctx.db.get("tasks", args.taskId);
    if (task === null || task.userId !== user._id) {
      throw new Error("Task not found");
    }

    const existing = await ctx.db
      .query("clarificationTurns")
      .withIndex("by_taskId", (q) => q.eq("taskId", args.taskId))
      .collect();

    await ctx.db.insert("clarificationTurns", {
      taskId: args.taskId,
      role: "user",
      content: args.content,
      order: existing.length,
      createdAt: Date.now(),
    });
  },
});

export const getTurnsForTaskInternal = internalQuery({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    const turns = await ctx.db
      .query("clarificationTurns")
      .withIndex("by_taskId", (q) => q.eq("taskId", args.taskId))
      .collect();
    return turns.sort((a, b) => a.order - b.order);
  },
});

export const appendTurnInternal = internalMutation({
  args: { taskId: v.id("tasks"), role: v.string(), content: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("clarificationTurns")
      .withIndex("by_taskId", (q) => q.eq("taskId", args.taskId))
      .collect();

    await ctx.db.insert("clarificationTurns", {
      taskId: args.taskId,
      role: args.role,
      content: args.content,
      order: existing.length,
      createdAt: Date.now(),
    });
  },
});

export const markClarificationCompleteInternal = internalMutation({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    await ctx.db.patch("tasks", args.taskId, { clarificationDone: true });
  },
});

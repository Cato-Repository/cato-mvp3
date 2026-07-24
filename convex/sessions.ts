import { v } from "convex/values";
import { mutation, query, MutationCtx } from "./_generated/server";
import { getCurrentUser } from "./users";
import type { Id } from "./_generated/dataModel";

async function getOwnedTask(ctx: MutationCtx, taskId: Id<"tasks">) {
  const user = await getCurrentUser(ctx);
  if (user === null) throw new Error("Not authenticated");
  const task = await ctx.db.get("tasks", taskId);
  if (task === null || task.userId !== user._id) {
    throw new Error("Task not found");
  }
  return { user, task };
}

export const startSession = mutation({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    const { user } = await getOwnedTask(ctx, args.taskId);

    const existing = await ctx.db
      .query("sessions")
      .withIndex("by_taskId", (q) => q.eq("taskId", args.taskId))
      .collect();
    const active = existing.find((s) => s.status !== "completed");
    if (active !== undefined) return active._id;

    const buckets = await ctx.db
      .query("buckets")
      .withIndex("by_taskId", (q) => q.eq("taskId", args.taskId))
      .collect();
    const firstBucket = buckets.sort((a, b) => a.order - b.order)[0];
    if (firstBucket === undefined) {
      throw new Error("Task has no breakdown yet");
    }

    const now = Date.now();
    const sessionId = await ctx.db.insert("sessions", {
      userId: user._id,
      taskId: args.taskId,
      status: "active",
      currentBucketId: firstBucket._id,
      bucketStartedAt: now,
      segmentStartedAt: now,
      accumulatedMs: 0,
      createdAt: now,
    });

    await ctx.db.patch("tasks", args.taskId, { status: "in_progress" });
    return sessionId;
  },
});

export const getActiveSessionForTask = query({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (user === null) return null;

    const task = await ctx.db.get("tasks", args.taskId);
    if (task === null || task.userId !== user._id) return null;

    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_taskId", (q) => q.eq("taskId", args.taskId))
      .collect();
    return sessions.find((s) => s.status !== "completed") ?? null;
  },
});

export const pauseSession = mutation({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (user === null) throw new Error("Not authenticated");

    const session = await ctx.db.get("sessions", args.sessionId);
    if (session === null || session.userId !== user._id) {
      throw new Error("Session not found");
    }
    if (session.status !== "active") return;

    const now = Date.now();
    const elapsedInSegment = session.segmentStartedAt ? now - session.segmentStartedAt : 0;
    await ctx.db.patch("sessions", args.sessionId, {
      status: "paused",
      segmentStartedAt: undefined,
      accumulatedMs: session.accumulatedMs + elapsedInSegment,
      streakNotifiedAtMs: undefined,
    });
  },
});

export const resumeSession = mutation({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (user === null) throw new Error("Not authenticated");

    const session = await ctx.db.get("sessions", args.sessionId);
    if (session === null || session.userId !== user._id) {
      throw new Error("Session not found");
    }
    if (session.status !== "paused") return;

    await ctx.db.patch("sessions", args.sessionId, {
      status: "active",
      segmentStartedAt: Date.now(),
    });
  },
});

export const advanceBucket = mutation({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (user === null) throw new Error("Not authenticated");

    const session = await ctx.db.get("sessions", args.sessionId);
    if (session === null || session.userId !== user._id) {
      throw new Error("Session not found");
    }

    const currentBucket = await ctx.db.get("buckets", session.currentBucketId);
    if (currentBucket === null) throw new Error("Bucket not found");

    const now = Date.now();
    await ctx.db.patch("buckets", currentBucket._id, { completedAt: now });

    const allBuckets = await ctx.db
      .query("buckets")
      .withIndex("by_taskId", (q) => q.eq("taskId", session.taskId))
      .collect();
    const nextBucket = allBuckets
      .filter((b) => b.order > currentBucket.order)
      .sort((a, b) => a.order - b.order)[0];

    if (nextBucket === undefined) {
      await ctx.db.patch("sessions", args.sessionId, {
        status: "completed",
        completedAt: now,
      });
      await ctx.db.patch("tasks", session.taskId, { status: "broken_down" });
      return { finished: true };
    }

    await ctx.db.patch("sessions", args.sessionId, {
      currentBucketId: nextBucket._id,
      bucketStartedAt: now,
    });
    return { finished: false };
  },
});

export const endSession = mutation({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (user === null) throw new Error("Not authenticated");

    const session = await ctx.db.get("sessions", args.sessionId);
    if (session === null || session.userId !== user._id) {
      throw new Error("Session not found");
    }

    await ctx.db.patch("sessions", args.sessionId, {
      status: "completed",
      completedAt: Date.now(),
    });
    await ctx.db.patch("tasks", session.taskId, { status: "broken_down" });
  },
});

export const claimFocusStreakNotification = mutation({
  args: { sessionId: v.id("sessions"), segmentStartedAt: v.number() },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (user === null) return false;

    const session = await ctx.db.get("sessions", args.sessionId);
    if (session === null || session.userId !== user._id) return false;
    if (session.segmentStartedAt !== args.segmentStartedAt) return false;
    if (session.streakNotifiedAtMs !== undefined) return false;

    await ctx.db.patch("sessions", args.sessionId, {
      streakNotifiedAtMs: Date.now(),
    });
    return true;
  },
});

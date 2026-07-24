import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    name: v.string(),
    email: v.string(),
    createdAt: v.number(),
  }).index("by_clerkId", ["clerkId"]),

  tasks: defineTable({
    userId: v.id("users"),
    date: v.string(), // "YYYY-MM-DD"
    title: v.string(),
    status: v.string(), // "not_started" | "in_progress" | "broken_down"
    order: v.number(),
    clarificationDone: v.optional(v.boolean()),
    createdAt: v.number(),
  }).index("by_userId_and_date", ["userId", "date"]),

  timetableEntries: defineTable({
    userId: v.id("users"),
    date: v.string(),
    title: v.string(),
    startMinutes: v.number(), // minutes since midnight
    endMinutes: v.number(),
    createdAt: v.number(),
  }).index("by_userId_and_date", ["userId", "date"]),

  clarificationTurns: defineTable({
    taskId: v.id("tasks"),
    role: v.string(), // "assistant" | "user"
    content: v.string(),
    order: v.number(),
    createdAt: v.number(),
  }).index("by_taskId", ["taskId"]),

  buckets: defineTable({
    taskId: v.id("tasks"),
    kind: v.string(), // "5min" | "10min" | "15min" | "break"
    order: v.number(),
    durationMinutes: v.number(),
    completedAt: v.optional(v.number()),
  }).index("by_taskId", ["taskId"]),

  microSteps: defineTable({
    bucketId: v.id("buckets"),
    title: v.string(),
    order: v.number(),
    completed: v.boolean(),
  }).index("by_bucketId", ["bucketId"]),

  sessions: defineTable({
    userId: v.id("users"),
    taskId: v.id("tasks"),
    status: v.string(), // "active" | "paused" | "completed"
    currentBucketId: v.id("buckets"),
    // Drives the visible per-bucket countdown; reset on every advanceBucket.
    bucketStartedAt: v.number(),
    // Drives *sustained*-focus time for the streak notification, independent
    // of bucket transitions. Null while paused.
    segmentStartedAt: v.optional(v.number()),
    accumulatedMs: v.number(),
    // Cleared on pause so a later continuous stretch can notify again.
    streakNotifiedAtMs: v.optional(v.number()),
    createdAt: v.number(),
    completedAt: v.optional(v.number()),
  })
    .index("by_taskId", ["taskId"])
    .index("by_userId", ["userId"]),
});

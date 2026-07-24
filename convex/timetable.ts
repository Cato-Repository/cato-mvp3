import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getCurrentUser } from "./users";

export const createEntry = mutation({
  args: {
    date: v.string(),
    title: v.string(),
    startMinutes: v.number(),
    endMinutes: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (user === null) throw new Error("Not authenticated");
    if (args.endMinutes <= args.startMinutes) {
      throw new Error("End time must be after start time");
    }

    return await ctx.db.insert("timetableEntries", {
      userId: user._id,
      date: args.date,
      title: args.title,
      startMinutes: args.startMinutes,
      endMinutes: args.endMinutes,
      createdAt: Date.now(),
    });
  },
});

export const getEntriesForDate = query({
  args: { date: v.string() },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (user === null) return [];

    const entries = await ctx.db
      .query("timetableEntries")
      .withIndex("by_userId_and_date", (q) =>
        q.eq("userId", user._id).eq("date", args.date)
      )
      .collect();
    return entries.sort((a, b) => a.startMinutes - b.startMinutes);
  },
});

export const updateEntry = mutation({
  args: {
    entryId: v.id("timetableEntries"),
    title: v.optional(v.string()),
    startMinutes: v.optional(v.number()),
    endMinutes: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (user === null) throw new Error("Not authenticated");

    const entry = await ctx.db.get("timetableEntries", args.entryId);
    if (entry === null || entry.userId !== user._id) {
      throw new Error("Timetable entry not found");
    }

    const { entryId, ...patch } = args;
    await ctx.db.patch("timetableEntries", entryId, patch);
  },
});

export const deleteEntry = mutation({
  args: { entryId: v.id("timetableEntries") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (user === null) throw new Error("Not authenticated");

    const entry = await ctx.db.get("timetableEntries", args.entryId);
    if (entry === null || entry.userId !== user._id) {
      throw new Error("Timetable entry not found");
    }
    await ctx.db.delete("timetableEntries", args.entryId);
  },
});

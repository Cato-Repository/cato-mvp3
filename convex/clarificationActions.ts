"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { clarifyNextQuestion } from "../lib/llm/clarify";

export const askNextQuestion = action({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    const task = await ctx.runQuery(internal.tasks.getTaskByIdInternal, {
      taskId: args.taskId,
    });
    if (task === null) throw new Error("Task not found");

    const turns = await ctx.runQuery(internal.clarification.getTurnsForTaskInternal, {
      taskId: args.taskId,
    });

    const result = await clarifyNextQuestion(
      task.title,
      turns.map((t) => ({ role: t.role as "assistant" | "user", content: t.content }))
    );

    if (result.done || result.question === undefined) {
      await ctx.runMutation(internal.clarification.markClarificationCompleteInternal, {
        taskId: args.taskId,
      });
      return { done: true };
    }

    await ctx.runMutation(internal.clarification.appendTurnInternal, {
      taskId: args.taskId,
      role: "assistant",
      content: result.question,
    });
    return { done: false };
  },
});

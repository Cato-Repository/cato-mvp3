"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { TaskCard } from "@/components/tasks/TaskCard";

export function TaskEntryPanel({ date }: { date: string }) {
  const [title, setTitle] = useState("");
  const tasks = useQuery(api.tasks.getTasksForDate, { date });
  const createTask = useMutation(api.tasks.createTask);

  async function handleAdd() {
    const trimmed = title.trim();
    if (trimmed === "") return;
    setTitle("");
    await createTask({ date, title: trimmed });
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <div>
        <h2 className="font-display text-lg font-semibold">Tasks</h2>
        <p className="text-muted-foreground text-sm">
          What do you want to get done today?
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <Textarea
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleAdd();
            }
          }}
          placeholder="e.g. Write the project proposal"
          rows={2}
        />
        <Button onClick={handleAdd} disabled={title.trim() === ""}>
          Add task
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        {tasks?.length === 0 && (
          <p className="text-muted-foreground py-8 text-center text-sm">
            No tasks yet — add your first one above.
          </p>
        )}
        {tasks?.map((task) => <TaskCard key={task._id} task={task} />)}
      </div>
    </div>
  );
}

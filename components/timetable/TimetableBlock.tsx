"use client";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { formatMinutesOfDay } from "@/lib/formatTime";
import type { Id } from "@/convex/_generated/dataModel";

export function CommitmentBlock({
  entryId,
  title,
  startMinutes,
  endMinutes,
  top,
  height,
}: {
  entryId: Id<"timetableEntries">;
  title: string;
  startMinutes: number;
  endMinutes: number;
  top: number;
  height: number;
}) {
  const deleteEntry = useMutation(api.timetable.deleteEntry);

  return (
    <button
      type="button"
      onClick={() => deleteEntry({ entryId })}
      title="Click to remove"
      style={{ top, height }}
      className="bg-primary/85 text-primary-foreground absolute inset-x-1 flex flex-col justify-center overflow-hidden rounded-md px-2 py-1 text-left transition-opacity hover:opacity-80"
    >
      <span className="truncate text-xs font-medium">{title}</span>
      <span className="truncate text-[10px] opacity-80">
        {formatMinutesOfDay(startMinutes)} – {formatMinutesOfDay(endMinutes)}
      </span>
    </button>
  );
}

export function FreeGapBlock({
  top,
  height,
}: {
  top: number;
  height: number;
}) {
  if (height < 2) return null;
  return (
    <div
      style={{ top, height }}
      className="border-muted-foreground/20 bg-accent/20 absolute inset-x-1 rounded-md border border-dashed"
    />
  );
}

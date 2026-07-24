"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { AddCommitmentForm } from "@/components/timetable/AddCommitmentForm";
import { CommitmentBlock, FreeGapBlock } from "@/components/timetable/TimetableBlock";
import { Plus } from "lucide-react";

const RANGE_START = 6 * 60; // 6:00 AM
const RANGE_END = 24 * 60; // midnight
const PIXELS_PER_MINUTE = 0.8;
const HOUR_LABELS = Array.from(
  { length: (RANGE_END - RANGE_START) / 60 + 1 },
  (_, i) => RANGE_START + i * 60
);

export function TimetablePanel({ date }: { date: string }) {
  const entries = useQuery(api.timetable.getEntriesForDate, { date });

  const gaps: { start: number; end: number }[] = [];
  if (entries) {
    let cursor = RANGE_START;
    for (const entry of entries) {
      const start = Math.max(entry.startMinutes, RANGE_START);
      const end = Math.min(entry.endMinutes, RANGE_END);
      if (start > cursor) gaps.push({ start: cursor, end: start });
      cursor = Math.max(cursor, end);
    }
    if (cursor < RANGE_END) gaps.push({ start: cursor, end: RANGE_END });
  }

  const totalHeight = (RANGE_END - RANGE_START) * PIXELS_PER_MINUTE;

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-lg font-semibold">Timetable</h2>
          <p className="text-muted-foreground text-sm">
            Your fixed commitments for today.
          </p>
        </div>
        <AddCommitmentForm
          date={date}
          trigger={
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4" />
              Add
            </Button>
          }
        />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto rounded-lg border">
        <div
          className="relative ml-14"
          style={{ height: totalHeight }}
        >
          {HOUR_LABELS.map((minute) => (
            <div
              key={minute}
              style={{ top: (minute - RANGE_START) * PIXELS_PER_MINUTE }}
              className="border-border/60 absolute inset-x-0 border-t"
            >
              <span className="text-muted-foreground absolute -top-2.5 -left-14 w-12 text-right text-[10px]">
                {new Date(0, 0, 0, 0, minute).toLocaleTimeString([], {
                  hour: "numeric",
                })}
              </span>
            </div>
          ))}

          {gaps.map((gap) => (
            <FreeGapBlock
              key={`gap-${gap.start}`}
              top={(gap.start - RANGE_START) * PIXELS_PER_MINUTE}
              height={(gap.end - gap.start) * PIXELS_PER_MINUTE}
            />
          ))}

          {entries?.map((entry) => (
            <CommitmentBlock
              key={entry._id}
              entryId={entry._id}
              title={entry.title}
              startMinutes={entry.startMinutes}
              endMinutes={entry.endMinutes}
              top={(entry.startMinutes - RANGE_START) * PIXELS_PER_MINUTE}
              height={(entry.endMinutes - entry.startMinutes) * PIXELS_PER_MINUTE}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

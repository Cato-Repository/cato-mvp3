"use client";

import { UserButton } from "@clerk/nextjs";
import { TaskEntryPanel } from "@/components/tasks/TaskEntryPanel";
import { TimetablePanel } from "@/components/timetable/TimetablePanel";
import { todayDateString } from "@/lib/formatTime";

export default function PlanPage() {
  const date = todayDateString();

  return (
    <div className="flex h-screen flex-col">
      <header className="flex items-center justify-between border-b px-6 py-4">
        <span className="font-display text-lg font-semibold">Cato</span>
        <UserButton />
      </header>
      <main className="grid min-h-0 flex-1 grid-cols-1 gap-6 overflow-hidden p-6 md:grid-cols-2">
        <section className="min-h-0 overflow-y-auto">
          <TaskEntryPanel date={date} />
        </section>
        <section className="min-h-0">
          <TimetablePanel date={date} />
        </section>
      </main>
    </div>
  );
}

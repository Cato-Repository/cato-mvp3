"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Doc } from "@/convex/_generated/dataModel";

const STATUS_LABEL: Record<string, string> = {
  not_started: "not started",
  in_progress: "in progress",
  broken_down: "broken down",
};

const STATUS_VARIANT: Record<string, "outline" | "secondary" | "default"> = {
  not_started: "outline",
  in_progress: "secondary",
  broken_down: "default",
};

export function TaskCard({ task }: { task: Doc<"tasks"> }) {
  return (
    <Link href={`/plan/${task._id}`}>
      <Card className="flex-row items-center justify-between gap-3 px-4 transition-colors hover:bg-muted/50">
        <span className="text-sm font-medium">{task.title}</span>
        <Badge variant={STATUS_VARIANT[task.status] ?? "outline"}>
          {STATUS_LABEL[task.status] ?? task.status}
        </Badge>
      </Card>
    </Link>
  );
}

"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
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

export function TaskCard({
  task,
  expanded,
  onToggle,
}: {
  task: Doc<"tasks">;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <button type="button" onClick={onToggle} className="w-full text-left">
      <Card className="flex-row items-center justify-between gap-3 px-4 transition-colors hover:bg-muted/50">
        <span className="text-sm font-medium">{task.title}</span>
        <div className="flex items-center gap-2">
          <Badge variant={STATUS_VARIANT[task.status] ?? "outline"}>
            {STATUS_LABEL[task.status] ?? task.status}
          </Badge>
          <ChevronDown
            className={cn(
              "text-muted-foreground h-4 w-4 transition-transform",
              expanded && "rotate-180"
            )}
          />
        </div>
      </Card>
    </button>
  );
}

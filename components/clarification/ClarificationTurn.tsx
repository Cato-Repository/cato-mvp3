import { cn } from "@/lib/utils";

export function ClarificationTurn({
  role,
  content,
}: {
  role: string;
  content: string;
}) {
  const isAssistant = role === "assistant";
  return (
    <div className={cn("flex", isAssistant ? "justify-start" : "justify-end")}>
      <div
        className={cn(
          "max-w-sm rounded-xl px-4 py-2 text-sm",
          isAssistant
            ? "bg-muted text-foreground"
            : "bg-primary text-primary-foreground"
        )}
      >
        {content}
      </div>
    </div>
  );
}

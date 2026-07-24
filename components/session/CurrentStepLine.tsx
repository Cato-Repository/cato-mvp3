export function CurrentStepLine({ text }: { text: string | null }) {
  if (text === null) return null;
  return <p className="text-foreground/80 max-w-xs text-center text-sm">{text}</p>;
}

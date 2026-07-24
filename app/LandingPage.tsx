import Link from "next/link";
import {
  ArrowRight,
  CalendarClock,
  MessageCircleQuestion,
  PictureInPicture2,
  Sparkles,
  Timer as TimerIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const FEATURES = [
  {
    icon: MessageCircleQuestion,
    title: "A quick check-in first",
    description:
      "Before anything gets broken down, Cato asks a question or two — just enough to understand what you actually mean by the task.",
  },
  {
    icon: Sparkles,
    title: "Broken into small, timed steps",
    description:
      "Every task becomes a short sequence of micro-steps grouped into 5, 10, and 15 minute stretches, followed by a break — never an overwhelming wall of to-dos.",
  },
  {
    icon: CalendarClock,
    title: "Built around your day",
    description:
      "Lay your fixed commitments alongside your tasks so Cato understands the gaps you actually have to work with.",
  },
  {
    icon: TimerIcon,
    title: "One step at a time",
    description:
      "A single, calm timer shows only the step in front of you — nothing else competing for your attention.",
  },
  {
    icon: PictureInPicture2,
    title: "Stays with you",
    description:
      "Pop the timer out into a small floating window that follows you across tabs and apps, so switching away doesn't mean losing track.",
  },
];

export function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between p-6">
        <span className="font-display text-lg font-semibold">Cato</span>
        <Button asChild variant="ghost" size="sm">
          <Link href="/sign-in">Sign In</Link>
        </Button>
      </header>

      <main className="flex flex-1 flex-col">
        <section className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-24 text-center">
          <h1 className="font-display max-w-2xl text-4xl leading-tight font-semibold text-balance sm:text-5xl">
            A quiet place to get one thing done.
          </h1>
          <p className="text-muted-foreground max-w-xl text-lg text-balance">
            Cato turns a vague task into a short, timed sequence of small
            steps — and keeps a calm timer with you while you work through
            them.
          </p>
          <Button asChild size="lg" className="mt-2">
            <Link href="/sign-up">
              Get started
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </section>

        <section className="border-border bg-muted/40 border-t px-6 py-24">
          <div className="mx-auto flex w-full max-w-5xl flex-col gap-12">
            <h2 className="font-display text-center text-2xl font-semibold">
              How it works
            </h2>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map(({ icon: Icon, title, description }) => (
                <div key={title} className="flex flex-col gap-3">
                  <Icon className="text-primary h-6 w-6" />
                  <h3 className="font-medium">{title}</h3>
                  <p className="text-muted-foreground text-sm">
                    {description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="flex flex-col items-center gap-4 px-6 py-24 text-center">
          <h2 className="font-display text-2xl font-semibold">
            Stop staring at the list. Start on the first step.
          </h2>
          <Button asChild size="lg">
            <Link href="/sign-up">
              Sign up to get started
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </section>
      </main>
    </div>
  );
}

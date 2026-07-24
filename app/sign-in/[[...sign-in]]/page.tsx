import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="from-background to-muted/40 flex min-h-screen flex-col items-center justify-center gap-6 bg-gradient-to-b px-4">
      <div className="text-center">
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          Cato
        </h1>
        <p className="text-muted-foreground text-sm">
          A quiet place to get one thing done.
        </p>
      </div>
      <SignIn />
    </div>
  );
}

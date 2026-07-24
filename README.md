# Cato — MVP 3

A quiet place to plan your day, break a task into small timed steps with a
short LLM clarification round first, and work through them with a
persistent floating timer. See `../MVP3-PLAN.md` (sibling `Cato` folder)
for the full product/design spec this build implements.

Stack: Next.js 16 (App Router) + Convex + Clerk + Tailwind v4 / shadcn
(`radix-nova` style). Continuous with [Cato MVP 2](../Cato%20-%20MVP%202)'s
conventions but its own codebase, schema, and palette.

## Status

The codebase is fully scaffolded — schema, Convex functions, all pages and
components for F1–F10 — but **not yet runnable**, for two reasons:

1. `convex/_generated/*` doesn't exist yet. It's produced by Convex's own
   codegen against a linked deployment, which requires an interactive
   login (`npx convex dev`) that wasn't run as part of this scaffold.
   Until that's run once, `tsc`/`next build` will show `Cannot find
   module './_generated/...'` errors — this is expected, not a bug.
2. No Clerk or Convex credentials are configured yet.

## Getting it running

1. **Install dependencies** (already done if you just ran the scaffold):
   ```bash
   npm install
   ```
2. **Link Convex** — creates/links a deployment and generates
   `convex/_generated/`:
   ```bash
   npx convex dev
   ```
   Leave this running in its own terminal; it watches `convex/*.ts` and
   pushes changes live. It also writes `CONVEX_DEPLOYMENT` and
   `NEXT_PUBLIC_CONVEX_URL` into `.env.local` for you.
3. **Create a Clerk application** (clerk.com) and copy `.env.local.example`
   to `.env.local`, filling in:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` from the
     Clerk dashboard's API Keys page.
   - Under Clerk Dashboard → JWT Templates, add a **Convex** template, then
     set the issuer domain as a *Convex* env var (not `.env.local` —
     `convex/auth.config.ts` reads it from the Convex deployment's own
     environment):
     ```bash
     npx convex env set CLERK_JWT_ISSUER_DOMAIN <your-issuer-domain>
     ```
4. **Run the app**:
   ```bash
   npm run dev
   ```
   Visit `http://localhost:3000`.

## LLM calls (Vertex AI / Gemini)

`lib/llm/clarify.ts` and `lib/llm/breakdown.ts` call Vertex AI's
`gemini-2.5-flash` via `generateObject` (`lib/llm/vertex.ts` holds the
shared client), mirroring [Cato MVP 2](../Cato%20-%20MVP%202/lib/llm/decompose-task.ts)'s
pattern. This project reuses MVP2's `cato-webapp` GCP project and
`cato-vertex-caller` service account. These four vars must be set as
**Convex** deployment env vars (not `.env.local`/Vercel — Convex actions
run in Convex's own Node runtime):
```bash
npx convex env set GOOGLE_VERTEX_PROJECT cato-webapp
npx convex env set GOOGLE_VERTEX_LOCATION <same region MVP2 uses>
npx convex env set GOOGLE_CLIENT_EMAIL cato-vertex-caller@cato-webapp.iam.gserviceaccount.com
npx convex env set GOOGLE_PRIVATE_KEY "<service account private key>"
```
(Or set them via the Convex dashboard's Environment Variables page instead
of the CLI — same place `CLERK_JWT_ISSUER_DOMAIN` was set.) Without these,
the clarification and breakdown actions will fail at runtime with a Google
auth error — there's no stub fallback anymore.

## Document Picture-in-Picture

Chromium-based browsers only as of this writing (Safari unsupported,
Firefox added support in v151). `lib/pip.ts` feature-detects and the app
falls back to an inline timer automatically — no configuration needed.

## Known follow-ups

- Rotate/verify any Vertex service-account key before it's ever pasted into
  chat or committed, same as flagged for MVP 2.
- Open product questions from the MVP3 plan (fixed vs. LLM-varied bucket
  lengths, what happens after the break, whether the timetable actively
  constrains scheduling, streak-notification repeat cadence, analytics)
  are still unresolved — see `../MVP3-PLAN.md` §7.

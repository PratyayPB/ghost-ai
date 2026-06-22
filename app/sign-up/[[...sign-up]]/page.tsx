import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto grid min-h-screen max-w-6xl grid-cols-1 gap-6 px-4 py-10 md:grid-cols-[1.2fr_1.8fr]">
        <aside className="hidden flex-col justify-center gap-6 rounded-3xl border border-border bg-card p-10 text-left shadow-sm md:flex">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">
              Ghost AI
            </p>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight">
              Create your account
            </h1>
          </div>
          <div className="space-y-4 text-sm text-muted-foreground">
            <p>Start with a secure Clerk-powered account.</p>
            <p>Save sessions across devices with built-in user management.</p>
            <p>Jump straight into the editor after sign up.</p>
          </div>
        </aside>

        <div className="flex items-center justify-center">
          <SignUp />
        </div>
      </div>
    </div>
  );
}

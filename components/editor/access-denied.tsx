import { Lock } from "lucide-react";
import Link from "next/link";

export default function AccessDenied() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
      <div className="mx-auto max-w-md px-6 text-center space-y-6">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-destructive/10">
          <Lock className="size-7 text-destructive" />
        </div>

        <h1 className="text-2xl font-semibold tracking-tight">
          Access Denied
        </h1>

        <p className="text-muted-foreground">
          You don&apos;t have permission to view this project, or it may no
          longer exist.
        </p>

        <Link
          href="/editor"
          className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Back to Projects
        </Link>
      </div>
    </div>
  );
}

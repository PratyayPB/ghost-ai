"use client";

import * as React from "react";
import { Share2, Check, Loader2, Copy, ShieldAlert, X, UserPlus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  isOwner: boolean;
}

interface EnrichedCollaborator {
  id: string;
  email: string;
  createdAt: string;
  name: string | null;
  imageUrl: string | null;
}

export default function ShareDialog({
  open,
  onOpenChange,
  projectId,
  isOwner,
}: ShareDialogProps) {
  const [collaborators, setCollaborators] = React.useState<EnrichedCollaborator[]>([]);
  const [inviteEmail, setInviteEmail] = React.useState("");
  const [copied, setCopied] = React.useState(false);
  const [fetching, setFetching] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [removingId, setRemovingId] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const shareUrl = React.useMemo(() => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/editor/${projectId}`;
  }, [projectId]);

  const fetchCollaborators = async () => {
    setFetching(true);
    setError(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/collaborators`);
      if (!res.ok) throw new Error("Failed to load collaborators");
      const data = await res.json();
      setCollaborators(data);
    } catch (err: any) {
      console.error(err);
      setError("Could not load collaborators. Please try again.");
    } finally {
      setFetching(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/projects/${projectId}/collaborators`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to invite collaborator");
      }

      setCollaborators((prev) => [...prev, data]);
      setInviteEmail("");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async (email: string, id: string) => {
    if (removingId || !isOwner) return;

    setRemovingId(id);
    setError(null);

    try {
      const res = await fetch(`/api/projects/${projectId}/collaborators`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to remove collaborator");
      }

      setCollaborators((prev) => prev.filter((c) => c.id !== id));
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to remove collaborator.");
    } finally {
      setRemovingId(null);
    }
  };

  React.useEffect(() => {
    if (open && projectId) {
      fetchCollaborators();
    } else {
      setCollaborators([]);
      setInviteEmail("");
      setError(null);
    }
  }, [open, projectId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border text-foreground shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2.5 text-xl font-bold tracking-tight text-foreground">
            <Share2 className="size-6 text-primary" />
            Share Project
          </DialogTitle>
          <DialogDescription className="text-sm text-foreground/85 mt-1.5">
            Invite others to collaborate in real-time or share the project workspace.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Copy Link Section */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-foreground uppercase tracking-wider">
              Project Link
            </label>
            <div className="flex gap-2">
              <Input
                readOnly
                value={shareUrl}
                className="flex-1 bg-muted/30 border-border text-sm font-mono h-10 focus-visible:ring-0 focus-visible:border-border"
              />
              <Button
                variant={copied ? "default" : "outline"}
                size="default"
                className="h-10 shrink-0 gap-2 transition-all duration-200 text-sm font-semibold"
                onClick={handleCopy}
              >
                {copied ? (
                  <>
                    <Check className="size-4" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="size-4" />
                    <span>Copy</span>
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2.5 rounded-lg bg-destructive/10 border border-destructive/30 p-3 text-sm font-medium text-destructive">
              <ShieldAlert className="size-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Invite Collaborator Section (Owner Only) */}
          {isOwner && (
            <form onSubmit={handleInvite} className="space-y-2">
              <label htmlFor="invite-email" className="text-sm font-bold text-foreground uppercase tracking-wider">
                Invite Collaborator
              </label>
              <div className="flex gap-2">
                <Input
                  id="invite-email"
                  type="email"
                  placeholder="name@example.com"
                  value={inviteEmail}
                  onChange={(e) => {
                    setInviteEmail(e.target.value);
                    if (error) setError(null);
                  }}
                  className="flex-1 bg-muted/20 border-border h-10 text-sm focus-visible:ring-1"
                  required
                />
                <Button
                  type="submit"
                  size="default"
                  disabled={submitting || !inviteEmail.trim()}
                  className="h-10 shrink-0 gap-2 font-semibold text-sm bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {submitting ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <UserPlus className="size-4" />
                  )}
                  <span>Invite</span>
                </Button>
              </div>
            </form>
          )}

          {/* Collaborator List Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-foreground uppercase tracking-wider">
                Collaborators ({collaborators.length})
              </label>
              {fetching && <Loader2 className="size-4 animate-spin text-foreground/80" />}
            </div>

            <div className="max-h-[220px] overflow-y-auto rounded-lg border border-border bg-zinc-950/30 p-1.5 space-y-1.5 scrollbar-thin">
              {fetching && collaborators.length === 0 ? (
                <div className="py-8 text-center text-sm text-foreground/70 font-medium">
                  Loading collaborators...
                </div>
              ) : collaborators.length === 0 ? (
                <div className="py-8 text-center text-sm text-foreground/70 font-medium">
                  No collaborators added yet.
                </div>
              ) : (
                collaborators.map((c) => {
                  const initial = c.name ? c.name[0] : c.email[0];
                  return (
                    <div
                      key={c.id}
                      className="flex items-center justify-between p-2 rounded-md hover:bg-muted/40 transition-colors group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Avatar */}
                        {c.imageUrl ? (
                          <img
                            src={c.imageUrl}
                            alt={c.name || c.email}
                            className="size-10 rounded-full border border-border object-cover"
                          />
                        ) : (
                          <div className="size-10 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 text-white font-bold flex items-center justify-center text-sm uppercase shadow-sm">
                            {initial}
                          </div>
                        )}
                        <div className="min-w-0 leading-tight">
                          {c.name ? (
                            <>
                              <p className="text-sm font-semibold text-foreground truncate max-w-[180px]">
                                {c.name}
                              </p>
                              <p className="text-xs text-foreground/75 truncate max-w-[180px]">
                                {c.email}
                              </p>
                            </>
                          ) : (
                            <p className="text-sm font-medium text-foreground truncate max-w-[200px]">
                              {c.email}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Remove Button (Owner only, hides self) */}
                      {isOwner && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 opacity-0 group-hover:opacity-100 hover:bg-destructive/15 hover:text-destructive focus:opacity-100 transition-opacity"
                          disabled={removingId === c.id}
                          onClick={() => handleRemove(c.email, c.id)}
                          aria-label={`Remove ${c.name || c.email}`}
                        >
                          {removingId === c.id ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            <X className="size-4" />
                          )}
                        </Button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Read-Only Notice (For collaborators) */}
        {!isOwner && (
          <div className="mt-1 flex items-start gap-2.5 rounded-lg bg-muted/60 border border-border p-3.5 text-sm text-foreground/90 leading-relaxed">
            <ShieldAlert className="size-5 shrink-0 text-foreground/90 mt-0.5" />
            <span>
              You have collaborator access. Only the project owner can add or remove team members.
            </span>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

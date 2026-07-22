"use client";

import * as React from "react";
import { Loader2, Download, AlertCircle, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SpecPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  specId: string | null;
  projectId: string;
  createdAt: string | null;
}

export default function SpecPreviewModal({
  isOpen,
  onClose,
  specId,
  projectId,
  createdAt,
}: SpecPreviewModalProps) {
  const [content, setContent] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const formattedDate = React.useMemo(() => {
    if (!createdAt) return "";
    try {
      return new Date(createdAt).toLocaleString([], {
        dateStyle: "medium",
        timeStyle: "short",
      });
    } catch {
      return "";
    }
  }, [createdAt]);

  const filename = specId ? `specification-${specId.substring(0, 8)}.md` : "specification.md";

  const fetchSpecContent = React.useCallback(async () => {
    if (!specId || !projectId) return;

    setIsLoading(true);
    setError(null);
    setContent(null);

    console.log(`[SPEC_PREVIEW] Fetching content for spec ${specId} in project ${projectId}`);
    try {
      const response = await fetch(
        `/api/projects/${projectId}/specs/${specId}/download`
      );

      if (!response.ok) {
        throw new Error(`Failed to load preview: ${response.statusText}`);
      }

      const text = await response.text();
      console.log(`[SPEC_PREVIEW] ✅ Loaded specification content (${text.length} chars)`);
      setContent(text);
    } catch (err: any) {
      console.error("[SPEC_PREVIEW] ❌ Error loading spec content:", err);
      setError(err.message || "Failed to load specification preview.");
    } finally {
      setIsLoading(false);
    }
  }, [specId, projectId]);

  React.useEffect(() => {
    if (isOpen && specId) {
      fetchSpecContent();
    }
  }, [isOpen, specId, fetchSpecContent]);

  const handleDownload = () => {
    if (!specId || !projectId) return;
    const link = document.createElement("a");
    link.href = `/api/projects/${projectId}/specs/${specId}/download`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-3xl w-full max-h-[85vh] h-[85vh] flex flex-col p-0 overflow-hidden bg-zinc-900 border border-zinc-800 text-zinc-100">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-zinc-800">
          <DialogTitle className="text-lg font-medium text-white flex items-center justify-between">
            <span>{filename}</span>
          </DialogTitle>
          {formattedDate && (
            <DialogDescription className="text-xs text-zinc-400">
              Generated on {formattedDate}
            </DialogDescription>
          )}
        </DialogHeader>

        {/* Content body */}
        <div className="flex-1 min-h-0 bg-zinc-950 p-6 relative">
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-zinc-950/80 z-10">
              <Loader2 className="size-8 animate-spin text-[#62C073]" />
              <p className="text-xs text-zinc-400">Loading specification content...</p>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8 text-center bg-zinc-950/80 z-10">
              <AlertCircle className="size-10 text-red-500" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-white">Error Loading Preview</p>
                <p className="text-xs text-zinc-400 max-w-sm">{error}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="border-zinc-800 hover:bg-zinc-900 hover:text-white"
                onClick={fetchSpecContent}
              >
                Retry
              </Button>
            </div>
          )}

          <ScrollArea className="h-full w-full rounded-md border border-zinc-850">
            {content !== null ? (
              <pre className="p-4 font-mono text-[11px] leading-relaxed text-zinc-300 whitespace-pre-wrap select-text">
                {content}
              </pre>
            ) : (
              !isLoading &&
              !error && (
                <div className="flex h-full items-center justify-center text-zinc-500 text-xs">
                  No content available.
                </div>
              )
            )}
          </ScrollArea>
        </div>

        <DialogFooter className="px-6 py-4 border-t border-zinc-800 bg-zinc-900/50 flex flex-row items-center justify-end gap-2 shrink-0">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-zinc-800 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs h-9"
          >
            Close
          </Button>
          <Button
            onClick={handleDownload}
            disabled={isLoading || !!error || !content}
            className="bg-[#62C073] hover:bg-[#62C073]/90 text-black text-xs font-medium gap-1.5 h-9"
          >
            <Download className="size-3.5" />
            Download Spec
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

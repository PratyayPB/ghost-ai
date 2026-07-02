"use client";

import * as React from "react";
import { FileText, Download, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import SpecPreviewModal from "./spec-preview-modal";

interface SpecItem {
  id: string;
  projectId: string;
  filePath: string;
  createdAt: string;
}

interface SpecListProps {
  projectId: string;
}

export default function SpecList({ projectId }: SpecListProps) {
  const [specs, setSpecs] = React.useState<SpecItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Preview modal state
  const [selectedSpecId, setSelectedSpecId] = React.useState<string | null>(null);
  const [selectedSpecCreated, setSelectedSpecCreated] = React.useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = React.useState(false);

  const fetchSpecs = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/projects/${projectId}/specs`);
      if (!response.ok) {
        throw new Error(`Failed to fetch specs: ${response.statusText}`);
      }
      const data = await response.json();
      setSpecs(data);
    } catch (err: any) {
      console.error("Error loading specs:", err);
      setError(err.message || "Failed to load specifications.");
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  React.useEffect(() => {
    fetchSpecs();
  }, [fetchSpecs]);

  const handleOpenPreview = (spec: SpecItem) => {
    setSelectedSpecId(spec.id);
    setSelectedSpecCreated(spec.createdAt);
    setIsPreviewOpen(true);
  };

  const handleDownload = (e: React.MouseEvent, spec: SpecItem) => {
    e.stopPropagation(); // prevent opening preview modal
    const filename = `specification-${spec.id.substring(0, 8)}.md`;
    const link = document.createElement("a");
    link.href = `/api/projects/${projectId}/specs/${spec.id}/download`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatItemTime = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleString([], {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  return (
    <div className="flex flex-col h-full bg-transparent">
      {/* List Header Actions */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card/10">
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
          Generated Specifications ({specs.length})
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="size-6 text-muted-foreground hover:text-foreground hover:bg-muted"
          onClick={fetchSpecs}
          disabled={isLoading}
          aria-label="Refresh specifications"
        >
          <RefreshCw className={`size-3 ${isLoading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {/* Main Area */}
      <div className="flex-1 min-h-0 relative">
        {isLoading && specs.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <Loader2 className="size-6 animate-spin text-[#62C073]" />
            <p className="text-[11px] text-muted-foreground">Loading specs list...</p>
          </div>
        )}

        {error && specs.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center gap-2">
            <AlertCircle className="size-8 text-red-500/80" />
            <p className="text-xs font-medium">Failed to load specs</p>
            <p className="text-[11px] text-muted-foreground max-w-[200px] leading-relaxed mb-1">
              {error}
            </p>
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs px-3 border-border hover:bg-muted"
              onClick={fetchSpecs}
            >
              Retry
            </Button>
          </div>
        )}

        {!isLoading && !error && specs.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
            <div className="size-10 rounded-full bg-muted flex items-center justify-center mb-3">
              <FileText className="size-5 text-muted-foreground/40" />
            </div>
            <p className="text-xs font-medium mb-1">No Specifications Yet</p>
            <p className="text-[10px] text-muted-foreground/60 leading-relaxed max-w-[200px]">
              Use the AI chat to request canvas specifications. Once generated, they will appear here.
            </p>
          </div>
        )}

        {/* Scrollable list */}
        <ScrollArea className="h-full w-full">
          <div className="p-2 space-y-1.5">
            {specs.map((spec) => (
              <div
                key={spec.id}
                onClick={() => handleOpenPreview(spec)}
                className="group flex items-center justify-between p-2.5 rounded-lg border border-border bg-card/30 hover:bg-[#62C073]/5 hover:border-[#62C073]/30 transition-all duration-150 cursor-pointer select-none"
              >
                <div className="flex items-start gap-2.5 min-w-0 flex-1">
                  <div className="size-8 rounded bg-muted flex items-center justify-center shrink-0 group-hover:bg-[#62C073]/10 transition-colors">
                    <FileText className="size-4 text-muted-foreground group-hover:text-[#62C073] transition-colors" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium truncate text-foreground group-hover:text-white transition-colors">
                      specification-{spec.id.substring(0, 8)}.md
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {formatItemTime(spec.createdAt)}
                    </p>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 opacity-0 group-hover:opacity-100 focus:opacity-100 hover:bg-muted text-muted-foreground hover:text-[#62C073] transition-opacity shrink-0 ml-2"
                  onClick={(e) => handleDownload(e, spec)}
                  aria-label="Download specification"
                >
                  <Download className="size-3.5" />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Shared Preview Modal */}
      <SpecPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        specId={selectedSpecId}
        projectId={projectId}
        createdAt={selectedSpecCreated}
      />
    </div>
  );
}

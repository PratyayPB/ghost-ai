"use client";

import * as React from "react";
import { FileText, Download, Loader2, AlertCircle, RefreshCw, Trash2 } from "lucide-react";
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
  onGenerateSpec?: () => void;
  isGenerating?: boolean;
  refreshKey?: number;
}

export default function SpecList({ projectId, onGenerateSpec, isGenerating, refreshKey }: SpecListProps) {
  const [specs, setSpecs] = React.useState<SpecItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  
  // Deletion state
  const [deletingSpecId, setDeletingSpecId] = React.useState<string | null>(null);
  const [deleteError, setDeleteError] = React.useState<string | null>(null);

  // Preview modal state
  const [selectedSpecId, setSelectedSpecId] = React.useState<string | null>(null);
  const [selectedSpecCreated, setSelectedSpecCreated] = React.useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = React.useState(false);

  const fetchSpecs = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    console.log(`[SPEC_LIST] Fetching specifications for project ${projectId}`);
    try {
      const response = await fetch(`/api/projects/${projectId}/specs`);
      if (!response.ok) {
        throw new Error(`Failed to fetch specs: ${response.statusText}`);
      }
      const data = await response.json();
      console.log(`[SPEC_LIST] ✅ Fetched ${data.length} specifications for project ${projectId}`);
      setSpecs(data);
    } catch (err: any) {
      console.error("[SPEC_LIST] ❌ Error loading specs:", err);
      setError(err.message || "Failed to load specifications.");
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  React.useEffect(() => {
    fetchSpecs();
  }, [fetchSpecs, refreshKey]);

  const handleOpenPreview = (spec: SpecItem) => {
    console.log(`[SPEC_LIST] Opening preview modal for spec: ${spec.id}`);
    setSelectedSpecId(spec.id);
    setSelectedSpecCreated(spec.createdAt);
    setIsPreviewOpen(true);
  };

  const handleDownload = (e: React.MouseEvent, spec: SpecItem) => {
    e.stopPropagation(); // prevent opening preview modal
    const filename = `specification-${spec.id.substring(0, 8)}.md`;
    console.log(`[SPEC_LIST] Triggering download for spec: ${spec.id}`);
    const link = document.createElement("a");
    link.href = `/api/projects/${projectId}/specs/${spec.id}/download`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = async (e: React.MouseEvent, spec: SpecItem) => {
    e.stopPropagation();
    if (deletingSpecId) return;

    console.log(`[SPEC_LIST] Requesting deletion of spec: ${spec.id}`);
    setDeletingSpecId(spec.id);
    setDeleteError(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/specs/${spec.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        throw new Error("Failed to delete spec");
      }
      console.log(`[SPEC_LIST] ✅ Successfully deleted spec: ${spec.id}`);
      setSpecs((prev) => prev.filter((s) => s.id !== spec.id));
    } catch (err: any) {
      console.error(`[SPEC_LIST] ❌ Error deleting spec ${spec.id}:`, err);
      setDeleteError(`Failed to delete ${spec.id.substring(0, 8)}`);
      setTimeout(() => setDeleteError(null), 3000);
    } finally {
      setDeletingSpecId(null);
    }
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
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-card/10 relative">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Generated Specifications ({specs.length})
        </span>
        <div className="flex items-center gap-2">
          {onGenerateSpec && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs bg-[#62C073]/10 hover:bg-[#62C073]/20 text-[#62C073] border-[#62C073]/30"
              onClick={onGenerateSpec}
              disabled={isGenerating || isLoading}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="size-3.5 mr-1.5 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate Spec"
              )}
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-muted-foreground hover:text-foreground hover:bg-muted"
            onClick={fetchSpecs}
            disabled={isLoading}
            aria-label="Refresh specifications"
          >
            <RefreshCw className={`size-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>
        
        {deleteError && (
          <div className="absolute -bottom-8 left-0 right-0 z-10 flex justify-center animate-in fade-in slide-in-from-top-2">
            <div className="bg-red-500/90 text-white text-[11px] font-medium px-3 py-1 rounded shadow-sm border border-red-600">
              {deleteError}
            </div>
          </div>
        )}
      </div>

      {/* Main Area */}
      <div className="flex-1 min-h-0 relative">
        {isLoading && specs.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <Loader2 className="size-8 animate-spin text-[#62C073]" />
            <p className="text-xs text-muted-foreground">Loading specs list...</p>
          </div>
        )}

        {error && specs.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center gap-3">
            <AlertCircle className="size-10 text-red-500/80" />
            <p className="text-sm font-semibold">Failed to load specs</p>
            <p className="text-xs text-muted-foreground max-w-[250px] leading-relaxed mb-1.5">
              {error}
            </p>
            <Button
              variant="outline"
              size="sm"
              className="h-9 text-xs px-4 border-border hover:bg-muted"
              onClick={fetchSpecs}
            >
              Retry
            </Button>
          </div>
        )}

        {!isLoading && !error && specs.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
            <div className="size-12 rounded-full bg-muted flex items-center justify-center mb-3">
              <FileText className="size-6 text-muted-foreground/40" />
            </div>
            <p className="text-sm font-semibold mb-1.5">No Specifications Yet</p>
            <p className="text-xs text-muted-foreground/60 leading-relaxed max-w-[250px]">
              Use the AI chat to request canvas specifications. Once generated, they will appear here.
            </p>
          </div>
        )}

        {/* Scrollable list */}
        <ScrollArea className="h-full w-full">
          <div className="p-3 space-y-2.5">
            {specs.map((spec) => (
              <div
                key={spec.id}
                onClick={() => handleOpenPreview(spec)}
                className="group flex items-center justify-between p-3.5 rounded-lg border border-border bg-card/30 hover:bg-[#62C073]/5 hover:border-[#62C073]/30 transition-all duration-150 cursor-pointer select-none"
              >
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  <div className="size-10 rounded bg-muted flex items-center justify-center shrink-0 group-hover:bg-[#62C073]/10 transition-colors">
                    <FileText className="size-5 text-muted-foreground group-hover:text-[#62C073] transition-colors" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate text-foreground group-hover:text-white transition-colors">
                      specification-{spec.id.substring(0, 8)}.md
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatItemTime(spec.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-9 opacity-0 group-hover:opacity-100 focus:opacity-100 hover:bg-muted text-muted-foreground hover:text-[#62C073] transition-opacity shrink-0"
                    onClick={(e) => handleDownload(e, spec)}
                    aria-label="Download specification"
                  >
                    <Download className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-9 opacity-0 group-hover:opacity-100 focus:opacity-100 hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-opacity shrink-0 ml-1"
                    onClick={(e) => handleDelete(e, spec)}
                    disabled={deletingSpecId === spec.id}
                    aria-label="Delete specification"
                  >
                    {deletingSpecId === spec.id ? (
                      <Loader2 className="size-4 animate-spin text-red-500" />
                    ) : (
                      <Trash2 className="size-4" />
                    )}
                  </Button>
                </div>
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

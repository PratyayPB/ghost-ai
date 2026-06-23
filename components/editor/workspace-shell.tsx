"use client";

import * as React from "react";
import { Share2, MessageSquare, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import EditorNavbar from "@/components/editor/editor-navbar";
import ProjectSidebar from "@/components/editor/project-sidebar";
import ProjectDialogs from "@/components/editor/project-dialogs";
import ShareDialog from "@/components/editor/share-dialog";
import { useProjectActions, type Project } from "@/lib/hooks/use-project-actions";
import { cn } from "@/lib/utils";

interface WorkspaceShellProps {
  /** The current project being viewed */
  currentProject: Project;
  /** All owned projects for sidebar */
  owned: Project[];
  /** All shared projects for sidebar */
  shared: Project[];
}

export default function WorkspaceShell({
  currentProject,
  owned,
  shared,
}: WorkspaceShellProps) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [aiSidebarOpen, setAiSidebarOpen] = React.useState(false);
  const [shareOpen, setShareOpen] = React.useState(false);

  const {
    projects,
    activeDialog,
    selectedProject,
    formName,
    formSlug,
    loading,
    openCreateDialog,
    openRenameDialog,
    openDeleteDialog,
    closeDialog,
    handleNameChange,
    handleCreateProject,
    handleRenameProject,
    handleDeleteProject,
  } = useProjectActions({ owned, shared });

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background text-foreground">
      {/* ---- Navbar ---- */}
      <header className="relative z-40 flex h-14 shrink-0 items-center border-b border-border bg-background px-4">
        {/* Left: sidebar toggle + project name */}
        <div className="flex items-center gap-3">
          <EditorNavbar
            isSidebarOpen={sidebarOpen}
            onToggleSidebar={() => setSidebarOpen((v) => !v)}
            className="!static !h-auto !border-0 !p-0 !bg-transparent"
          />
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-sm font-semibold truncate max-w-[200px]">
              {currentProject.name}
            </span>
          </div>
        </div>

        {/* Center: project name on mobile */}
        <div className="flex-1 flex items-center justify-center sm:hidden">
          <span className="text-sm font-semibold truncate max-w-[160px]">
            {currentProject.name}
          </span>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-1 ml-auto">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-muted-foreground"
            onClick={() => setShareOpen(true)}
            aria-label="Share project"
          >
            <Share2 className="size-4" />
            <span className="hidden sm:inline text-xs">Share</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "text-muted-foreground",
              aiSidebarOpen && "bg-muted text-foreground",
            )}
            onClick={() => setAiSidebarOpen((v) => !v)}
            aria-label={aiSidebarOpen ? "Close AI chat" : "Open AI chat"}
          >
            <MessageSquare className="size-4" />
          </Button>
        </div>
      </header>

      {/* ---- Body ---- */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile backdrop scrim */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs transition-opacity md:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Left sidebar */}
        <ProjectSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          projects={projects}
          openCreateDialog={openCreateDialog}
          openRenameDialog={openRenameDialog}
          openDeleteDialog={openDeleteDialog}
          selectedProject={currentProject}
          onSelectProject={undefined}
        />

        {/* Canvas placeholder */}
        <main className="flex-1 flex items-center justify-center bg-zinc-950/50">
          <div className="text-center space-y-4">
            <div className="mx-auto flex size-16 items-center justify-center rounded-xl bg-muted/20 border border-border/50">
              <Layers className="size-7 text-muted-foreground/60" />
            </div>
            <div className="space-y-1.5">
              <p className="text-sm font-medium text-muted-foreground">
                Canvas
              </p>
              <p className="text-xs text-muted-foreground/60 max-w-[240px]">
                The architecture canvas will appear here. Coming soon.
              </p>
            </div>
          </div>
        </main>

        {/* Right sidebar placeholder — AI Chat */}
        {aiSidebarOpen && (
          <aside className="hidden md:flex w-80 flex-col border-l border-border bg-card">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <h3 className="text-sm font-medium">AI Chat</h3>
              <Button
                variant="ghost"
                size="icon"
                className="size-7"
                onClick={() => setAiSidebarOpen(false)}
                aria-label="Close AI chat"
              >
                <MessageSquare className="size-3.5" />
              </Button>
            </div>
            <div className="flex-1 flex items-center justify-center p-4">
              <p className="text-xs text-muted-foreground/60 text-center">
                AI assistant coming soon.
              </p>
            </div>
          </aside>
        )}
      </div>

      {/* Dialogs */}
      <ProjectDialogs
        activeDialog={activeDialog}
        selectedProject={selectedProject}
        formName={formName}
        formSlug={formSlug}
        loading={loading}
        closeDialog={closeDialog}
        handleNameChange={handleNameChange}
        handleCreateProject={handleCreateProject}
        handleRenameProject={handleRenameProject}
        handleDeleteProject={handleDeleteProject}
      />

      <ShareDialog
        open={shareOpen}
        onOpenChange={setShareOpen}
        projectId={currentProject.id}
        isOwner={currentProject.isOwned}
      />
    </div>
  );
}

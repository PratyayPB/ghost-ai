"use client";

import * as React from "react";
import { Share2, MessageSquare, Layers, Ghost } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import EditorNavbar from "@/components/editor/editor-navbar";
import ProjectSidebar from "@/components/editor/project-sidebar";
import ProjectDialogs from "@/components/editor/project-dialogs";
import ShareDialog from "@/components/editor/share-dialog";
import CollaborativeCanvas from "./collaborative-canvas";
import AiChatSidebar from "./ai-chat-sidebar";
import { ReactFlowProvider } from "@xyflow/react";
import {
  useProjectActions,
  type Project,
} from "@/lib/hooks/use-project-actions";
import { cn } from "@/lib/utils";
import { UserButton } from "@clerk/nextjs";
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
      <EditorNavbar
        isSidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen((v) => !v)}
        projectName={currentProject.name}
        leftContent={
          <Link
            href="/editor"
            className="flex items-center gap-2 font-bold text-lg hover:opacity-80 transition-opacity ml-2"
          >
            <Ghost className="size-5 text-primary" />
            <span>Ghost-ai</span>
          </Link>
        }
      >
        <UserButton />
        <Button
          variant="ghost"
          size="lg"
          className="gap-1.5 text-muted-foreground"
          onClick={() => setShareOpen(true)}
          aria-label="Share project"
        >
          <Share2 className="size-4" />
          <span className="hidden sm:inline text-xs">Share</span>
        </Button>
        <Button
          variant="ghost"
          size="icon-lg"
          className={cn(
            "text-muted-foreground",
            aiSidebarOpen && "bg-muted text-foreground",
          )}
          onClick={() => setAiSidebarOpen((v) => !v)}
          aria-label={aiSidebarOpen ? "Close AI chat" : "Open AI chat"}
        >
          <MessageSquare className="size-4" />
        </Button>
      </EditorNavbar>

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

        {/* Collaborative Canvas */}
        <ReactFlowProvider>
          <main className="flex-1 overflow-hidden relative bg-zinc-950/50">
            <CollaborativeCanvas projectId={currentProject.id} />
          </main>

          {/* Right sidebar — AI Chat */}
          {aiSidebarOpen && (
            <AiChatSidebar onClose={() => setAiSidebarOpen(false)} />
          )}
        </ReactFlowProvider>
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

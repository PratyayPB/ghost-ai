"use client";

import * as React from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import EditorNavbar from "@/components/editor/editor-navbar";
import ProjectSidebar from "@/components/editor/project-sidebar";
import ProjectDialogs from "@/components/editor/project-dialogs";
import { useProjectDialogs, Project } from "@/lib/hooks/use-project-dialogs";

export default function EditorPage() {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const [openedProject, setOpenedProject] = React.useState<Project | null>(null);

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
  } = useProjectDialogs();

  // Sync opened project with renamed or deleted projects in list
  React.useEffect(() => {
    if (openedProject) {
      const updated = projects.find((p) => p.id === openedProject.id);
      if (!updated) {
        setOpenedProject(null);
      } else if (updated.name !== openedProject.name || updated.slug !== openedProject.slug) {
        setOpenedProject(updated);
      }
    }
  }, [projects, openedProject]);

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-x-hidden">
      <EditorNavbar
        isSidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen((value) => !value)}
      />
      
      {/* Mobile backdrop scrim */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs transition-opacity md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <ProjectSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        projects={projects}
        openCreateDialog={openCreateDialog}
        openRenameDialog={openRenameDialog}
        openDeleteDialog={openDeleteDialog}
        selectedProject={openedProject}
        onSelectProject={setOpenedProject}
      />

      <main className="pt-14 flex items-center justify-center min-h-screen">
        <div className="mx-auto max-w-2xl px-4 py-16 text-center flex flex-col items-center justify-center w-full">
          {!openedProject ? (
            <div className="space-y-6 flex flex-col items-center">
              <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                Create a project or open an existing one
              </h1>
              <p className="max-w-md text-lg text-muted-foreground">
                Start a new architecture workspace, or choose a project from the sidebar.
              </p>
              <Button size="lg" onClick={openCreateDialog} className="mt-4">
                <Plus className="size-5 mr-2" /> New Project
              </Button>
            </div>
          ) : (
            <div className="space-y-6 flex flex-col items-center">
              <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                Active Project
              </span>
              <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                {openedProject.name}
              </h1>
              <p className="max-w-md text-lg text-muted-foreground font-mono text-sm">
                Slug: {openedProject.slug} • {openedProject.isOwned ? "Owned by you" : "Shared with you"}
              </p>
              <div className="flex flex-wrap justify-center gap-3 mt-4">
                {openedProject.isOwned && (
                  <>
                    <Button variant="outline" onClick={() => openRenameDialog(openedProject)}>
                      <Pencil className="size-4 mr-2" /> Rename
                    </Button>
                    <Button variant="destructive" onClick={() => openDeleteDialog(openedProject)}>
                      <Trash2 className="size-4 mr-2" /> Delete
                    </Button>
                  </>
                )}
                <Button variant="secondary" onClick={() => setOpenedProject(null)}>
                  Close Project
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>

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
    </div>
  );
}

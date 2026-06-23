"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Project, DialogType } from "@/lib/hooks/use-project-actions";

interface ProjectDialogsProps {
  activeDialog: DialogType;
  selectedProject: Project | null;
  formName: string;
  formSlug: string;
  loading: boolean;
  closeDialog: () => void;
  handleNameChange: (name: string) => void;
  handleCreateProject: (e: React.FormEvent) => void;
  handleRenameProject: (e: React.FormEvent) => void;
  handleDeleteProject: () => void;
}

export default function ProjectDialogs({
  activeDialog,
  selectedProject,
  formName,
  formSlug,
  loading,
  closeDialog,
  handleNameChange,
  handleCreateProject,
  handleRenameProject,
  handleDeleteProject,
}: ProjectDialogsProps) {
  return (
    <>
      {/* Create Project Dialog */}
      <Dialog open={activeDialog === "create"} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Project</DialogTitle>
            <DialogDescription>
              Start a new architecture workspace.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateProject} className="space-y-4 py-2">
            <div className="space-y-2">
              <label htmlFor="create-project-name" className="text-xs font-medium text-muted-foreground">
                Project Name
              </label>
              <Input
                id="create-project-name"
                placeholder="My Awesome Project"
                value={formName}
                onChange={(e) => handleNameChange(e.target.value)}
                disabled={loading}
                required
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="create-project-slug" className="text-xs font-medium text-muted-foreground">
                Live Slug Preview
              </label>
              <Input
                id="create-project-slug"
                value={formSlug}
                readOnly
                placeholder="project-slug-preview"
                className="bg-muted/30 text-muted-foreground select-none cursor-default font-mono text-xs h-9"
              />
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={closeDialog} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading || !formName.trim()}>
                {loading ? "Creating..." : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Rename Project Dialog */}
      <Dialog open={activeDialog === "rename"} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rename Project</DialogTitle>
            <DialogDescription>
              Enter a new name for the project. Current: <span className="font-semibold text-foreground">{selectedProject?.name}</span>
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleRenameProject} className="space-y-4 py-2">
            <div className="space-y-2">
              <label htmlFor="rename-project-name" className="text-xs font-medium text-muted-foreground">
                Project Name
              </label>
              <Input
                id="rename-project-name"
                placeholder="Rename Project"
                value={formName}
                onChange={(e) => handleNameChange(e.target.value)}
                disabled={loading}
                required
                autoFocus
              />
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={closeDialog} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading || !formName.trim() || formName.trim() === selectedProject?.name}>
                {loading ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Project Dialog */}
      <Dialog open={activeDialog === "delete"} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Project</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <span className="font-semibold text-foreground">"{selectedProject?.name}"</span>? This action is permanent and cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={closeDialog} disabled={loading}>
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={handleDeleteProject} disabled={loading}>
              {loading ? "Deleting..." : "Delete Project"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

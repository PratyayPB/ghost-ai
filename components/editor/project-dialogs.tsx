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
import { AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { Project, DialogType } from "@/lib/hooks/use-project-actions";

interface ProjectDialogsProps {
  activeDialog: DialogType;
  selectedProject: Project | null;
  formName: string;
  formSlug: string;
  formError: string | null;
  loading: boolean;
  closeDialog: () => void;
  handleNameChange: (name: string) => void;
  handleCreateProject: (e: React.FormEvent) => void;
  handleRenameProject: (e: React.FormEvent) => void;
  handleDeleteProject: () => void;
}

const MAX_NAME_LENGTH = 50;

function NameInput({
  id,
  value,
  onChange,
  disabled,
  placeholder = "e.g. E-Commerce Backend",
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  disabled: boolean;
  placeholder?: string;
}) {
  const remaining = MAX_NAME_LENGTH - value.length;
  const isOverLimit = remaining < 0;
  const isNearLimit = remaining <= 10 && remaining >= 0;

  return (
    <div className="space-y-1.5">
      <div className="relative">
        <Input
          id={id}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value.slice(0, MAX_NAME_LENGTH))}
          disabled={disabled}
          required
          autoFocus
          maxLength={MAX_NAME_LENGTH}
          className={cn(
            "pr-14",
            isOverLimit && "border-red-500 focus-visible:ring-red-500"
          )}
        />
        <span
          className={cn(
            "absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-mono tabular-nums pointer-events-none",
            isNearLimit ? "text-amber-500" : "text-muted-foreground/50",
            isOverLimit && "text-red-500"
          )}
        >
          {value.length}/{MAX_NAME_LENGTH}
        </span>
      </div>
      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground/60">
        <Info className="size-3 shrink-0" />
        Each project name must be unique. Letters, numbers, spaces and hyphens are recommended.
      </p>
    </div>
  );
}

export default function ProjectDialogs({
  activeDialog,
  selectedProject,
  formName,
  formSlug,
  formError,
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
            {/* Error banner */}
            {formError && (
              <div className="flex items-start gap-2.5 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-sm text-red-400">
                <AlertCircle className="size-4 mt-0.5 shrink-0" />
                <span>{formError}</span>
              </div>
            )}
            <div className="space-y-1.5">
              <label htmlFor="create-project-name" className="text-xs font-medium text-muted-foreground">
                Project Name
              </label>
              <NameInput
                id="create-project-name"
                value={formName}
                onChange={handleNameChange}
                disabled={loading}
              />
            </div>
            <div className="space-y-1.5">
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
            {/* Error banner */}
            {formError && (
              <div className="flex items-start gap-2.5 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-sm text-red-400">
                <AlertCircle className="size-4 mt-0.5 shrink-0" />
                <span>{formError}</span>
              </div>
            )}
            <div className="space-y-1.5">
              <label htmlFor="rename-project-name" className="text-xs font-medium text-muted-foreground">
                Project Name
              </label>
              <NameInput
                id="rename-project-name"
                value={formName}
                onChange={handleNameChange}
                disabled={loading}
                placeholder="Rename Project"
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

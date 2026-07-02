"use client";

import * as React from "react";
import { Plus, PanelLeftClose, Pencil, Trash2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Project } from "@/lib/hooks/use-project-actions";

type ProjectSidebarProps = {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  openCreateDialog: () => void;
  openRenameDialog: (project: Project) => void;
  openDeleteDialog: (project: Project) => void;
  selectedProject: Project | null;
  onSelectProject?: (project: Project | null) => void;
};

export default function ProjectSidebar({
  isOpen,
  onClose,
  projects,
  openCreateDialog,
  openRenameDialog,
  openDeleteDialog,
  selectedProject,
  onSelectProject,
}: ProjectSidebarProps) {
  const ownedProjects = projects.filter((p) => p.isOwned);
  const sharedProjects = projects.filter((p) => !p.isOwned);

  return (
    <aside
      aria-hidden={!isOpen}
      className={cn(
        "fixed inset-y-0 left-0 z-50 w-80 max-w-full transform transition-transform duration-300",
        isOpen ? "translate-x-0" : "-translate-x-full",
      )}
    >
      <div className="flex h-full flex-col bg-card border-r border-border shadow-lg">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h3 className="text-base font-semibold text-foreground">Projects</h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close projects"
          >
            <PanelLeftClose className="size-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <Tabs defaultValue="my-projects" className="flex flex-col h-full">
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="my-projects" className="text-base font-medium text-foreground">My Projects</TabsTrigger>
              <TabsTrigger value="shared" className="text-base font-medium text-foreground">Shared</TabsTrigger>
            </TabsList>

            <div className="mt-3 flex-1">
              <TabsContent value="my-projects">
                {ownedProjects.length === 0 ? (
                  <div className="flex h-40 flex-col items-center justify-center rounded-lg border border-dashed border-border p-4 text-center">
                    <p className="text-base font-medium text-foreground">
                      No projects yet
                    </p>
                    <Button variant="link" size="sm" onClick={openCreateDialog} className="mt-1 text-base font-medium text-foreground">
                      Create your first project
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {ownedProjects.map((project) => {
                      const isSelected = selectedProject?.id === project.id;
                      return (
                        <div
                          key={project.id}
                          className={cn(
                            "group flex items-center justify-between rounded-lg px-3 py-2 text-base font-medium transition-colors cursor-pointer",
                            isSelected
                              ? "bg-primary text-primary-foreground"
                              : "hover:bg-muted text-foreground"
                          )}
                          onClick={() => onSelectProject?.(isSelected ? null : project)}
                        >
                          <span className="truncate font-medium">{project.name}</span>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="icon"
                              className={cn(
                                "size-7",
                                isSelected 
                                  ? "text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground" 
                                  : "text-muted-foreground hover:text-foreground"
                              )}
                              onClick={(e) => {
                                e.stopPropagation();
                                openRenameDialog(project);
                              }}
                              aria-label={`Rename ${project.name}`}
                            >
                              <Pencil className="size-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className={cn(
                                "size-7",
                                isSelected 
                                  ? "text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground" 
                                  : "text-destructive hover:bg-destructive/10 hover:text-destructive"
                              )}
                              onClick={(e) => {
                                e.stopPropagation();
                                openDeleteDialog(project);
                              }}
                              aria-label={`Delete ${project.name}`}
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="shared">
                {sharedProjects.length === 0 ? (
                  <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-border p-4 text-center">
                    <p className="text-base font-medium text-foreground">
                      No shared projects
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {sharedProjects.map((project) => {
                      const isSelected = selectedProject?.id === project.id;
                      return (
                        <div
                          key={project.id}
                          className={cn(
                            "group flex items-center justify-between rounded-lg px-3 py-2 text-base font-medium transition-colors cursor-pointer",
                            isSelected
                              ? "bg-primary text-primary-foreground"
                              : "hover:bg-muted text-foreground"
                          )}
                          onClick={() => onSelectProject?.(isSelected ? null : project)}
                        >
                          <span className="truncate font-medium">{project.name}</span>
                          {/* Actions hidden for shared projects */}
                        </div>
                      );
                    })}
                  </div>
                )}
              </TabsContent>
            </div>
          </Tabs>
        </div>

        <div className="p-4 border-t border-border">
          <Button className="w-full text-base font-semibold" variant="default" onClick={openCreateDialog}>
            <Plus className="size-5 mr-2" /> New Project
          </Button>
        </div>
      </div>
    </aside>
  );
}

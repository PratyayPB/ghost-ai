"use client";

import * as React from "react";
import { Plus, PanelLeftClose } from "lucide-react";

import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

type ProjectSidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function ProjectSidebar({
  isOpen,
  onClose,
}: ProjectSidebarProps) {
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
          <h3 className="text-sm font-medium">Projects</h3>
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
            <TabsList>
              <TabsTrigger value="my-projects">My Projects</TabsTrigger>
              <TabsTrigger value="shared">Shared</TabsTrigger>
            </TabsList>

            <div className="mt-3">
              <TabsContent value="my-projects">
                <div className="flex h-40 items-center justify-center rounded-md border border-dashed border-border">
                  <p className="text-sm text-muted-foreground">
                    No projects yet
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="shared">
                <div className="flex h-40 items-center justify-center rounded-md border border-dashed border-border">
                  <p className="text-sm text-muted-foreground">
                    No shared projects
                  </p>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        <div className="p-4">
          <Button className="w-full" variant="default">
            <Plus className="size-4 mr-2" /> New Project
          </Button>
        </div>
      </div>
    </aside>
  );
}

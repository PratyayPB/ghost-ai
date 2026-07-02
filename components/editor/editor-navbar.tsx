"use client";

import * as React from "react";
import {
  PanelLeftOpen,
  PanelLeftClose,
  LayoutTemplate,
  Cloud,
  CloudUpload,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import type { SaveStatus } from "@/hooks/use-canvas-autosave";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type EditorNavbarProps = {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  className?: string;
  projectName?: string;
  leftContent?: React.ReactNode;
  children?: React.ReactNode;
};

export default function EditorNavbar({
  isSidebarOpen,
  onToggleSidebar,
  className,
  projectName,
  leftContent,
  children,
}: EditorNavbarProps) {
  const [saveStatus, setSaveStatus] = React.useState<SaveStatus>("idle");

  React.useEffect(() => {
    const handleSaveStatus = (e: Event) => {
      const customEvent = e as CustomEvent<SaveStatus>;
      setSaveStatus(customEvent.detail);
    };

    document.addEventListener("canvas-save-status", handleSaveStatus);
    return () => {
      document.removeEventListener("canvas-save-status", handleSaveStatus);
    };
  }, []);

  return (
    <header
      className={cn(
        "relative z-40 h-14 flex items-center justify-between px-4 border-b bg-background border-border w-full shrink-0",
        className,
      )}
    >
      <div className="flex items-center min-w-[200px] gap-2">
        <Button
          variant="ghost"
          size="icon"
          aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
          onClick={onToggleSidebar}
        >
          {isSidebarOpen ? (
            <PanelLeftClose className="size-5" />
          ) : (
            <PanelLeftOpen className="size-5" />
          )}
        </Button>
        {leftContent}
      </div>

      <div className="flex-1 flex items-center justify-center">
        <Button
          variant="ghost"
          size="default"
          className="gap-2 text-base font-medium text-foreground"
          onClick={() =>
            document.dispatchEvent(new CustomEvent("open-templates-modal"))
          }
        >
          <LayoutTemplate className="size-5" />
          <span className="hidden sm:inline">Templates</span>
        </Button>

        <div className="ml-4 flex items-center gap-1.5 text-sm font-medium text-foreground border-l border-border pl-4">
          {saveStatus === "saving" && (
            <>
              <CloudUpload className="size-4 animate-pulse text-blue-500" />
              <span className="hidden sm:inline">Saving...</span>
            </>
          )}
          {saveStatus === "saved" && (
            <>
              <CheckCircle2 className="size-4 text-green-500" />
              <span className="hidden sm:inline">Saved</span>
            </>
          )}
          {saveStatus === "error" && (
            <>
              <AlertCircle className="size-4 text-destructive" />
              <span className="hidden sm:inline text-destructive">
                Save Failed
              </span>
            </>
          )}
          {saveStatus === "idle" && (
            <>
              <Cloud className="size-4 text-foreground/80" />
              <span className="hidden sm:inline text-foreground/80">
                Saved to Cloud
              </span>
            </>
          )}
        </div>

        <div className="ml-4 flex items-center gap-2 border-l border-border pl-4">
          {/* <UserButton /> */}
          {projectName && (
            <span className="text-sm font-semibold truncate max-w-[200px]">
              {projectName}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center min-w-[200px] justify-end gap-2">
        {children}
      </div>
    </header>
  );
}

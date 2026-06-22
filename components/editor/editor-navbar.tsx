"use client";

import * as React from "react";
import { PanelLeftOpen, PanelLeftClose } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type EditorNavbarProps = {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  className?: string;
};

export default function EditorNavbar({
  isSidebarOpen,
  onToggleSidebar,
  className,
}: EditorNavbarProps) {
  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-40 h-14 flex items-center px-4 border-b bg-background border-border",
        className,
      )}
    >
      <div className="flex items-center gap-2">
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
      </div>

      <div className="flex-1 flex items-center justify-center">
        {/* Center section — reserved for title or controls in future */}
      </div>

      <div className="flex items-center gap-2">
        {/* Right section — intentionally left empty for now */}
      </div>
    </header>
  );
}

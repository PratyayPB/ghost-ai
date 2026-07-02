import { useEffect } from "react";
import { useReactFlow } from "@xyflow/react";

export function useKeyboardShortcuts(
  undo: () => void,
  redo: () => void,
  canUndo: boolean,
  canRedo: boolean
) {
  const { zoomIn, zoomOut } = useReactFlow();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input, textarea, or contenteditable
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      if (e.key === "=" || e.key === "+") {
        if (!cmdOrCtrl) {
          zoomIn({ duration: 200 });
        } else {
          e.preventDefault();
          zoomIn({ duration: 200 });
        }
      } else if (e.key === "-") {
        if (!cmdOrCtrl) {
          zoomOut({ duration: 200 });
        } else {
          e.preventDefault();
          zoomOut({ duration: 200 });
        }
      } else if (cmdOrCtrl && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) {
          if (canRedo) redo();
        } else {
          if (canUndo) undo();
        }
      } else if (cmdOrCtrl && e.key.toLowerCase() === "y") {
        e.preventDefault();
        if (canRedo) redo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [zoomIn, zoomOut, undo, redo, canUndo, canRedo]);
}

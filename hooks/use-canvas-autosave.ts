import { useState, useEffect, useRef } from "react";
import { type Node, type Edge } from "@xyflow/react";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

export function useCanvasAutosave(projectId: string, nodes: Node[], edges: Edge[]) {
  const [status, setStatus] = useState<SaveStatus>("idle");
  const isFirstRender = useRef(true);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const saveCanvas = async () => {
      setStatus("saving");
      console.log("Canvas JSON data on autosave:", JSON.stringify({ nodes, edges }, null, 2));
      try {
        const response = await fetch(`/api/projects/${projectId}/canvas`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ nodes, edges }),
        });

        if (!response.ok) {
          throw new Error("Failed to save");
        }

        setStatus("saved");
        
        // Return to idle after a few seconds
        setTimeout(() => {
          setStatus((prev) => (prev === "saved" ? "idle" : prev));
        }, 3000);
      } catch (error) {
        console.error("Autosave error:", error);
        setStatus("error");
      }
    };

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Trigger save after 5 seconds of inactivity
    debounceTimerRef.current = setTimeout(() => {
      saveCanvas();
    }, 5000);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [projectId, nodes, edges]);

  return status;
}

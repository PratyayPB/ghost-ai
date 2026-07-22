"use client";

import * as React from "react";
import {
  ReactFlow,
  Background,
  ConnectionMode,
  BackgroundVariant,
  useReactFlow,
  MarkerType,
  type NodeTypes,
  type EdgeTypes,
} from "@xyflow/react";
import { useLiveblocksFlow, Cursors } from "@liveblocks/react-flow";
import {
  useUpdateMyPresence,
  useEventListener,
} from "@liveblocks/react/suspense";
import CustomCursor from "./custom-cursor";
import type { CanvasNodeShape } from "@/types/canvas";
import { DEFAULT_NODE_COLOR, DEFAULT_TEXT_COLOR } from "@/types/canvas";
import CanvasNodeRenderer from "./canvas-node";
import CanvasEdge from "./canvas-edge";
import CanvasControls from "./canvas-controls";
import ShapePanel from "./shape-panel";
import StarterTemplatesModal from "./starter-templates-modal";
import type { CanvasTemplate } from "./starter-templates";
import PresenceAvatars from "./presence-avatars";
import AiStatusFeed from "./ai-status-feed";
import { useCanvasAutosave } from "@/hooks/use-canvas-autosave";

import "@xyflow/react/dist/style.css";
import "@liveblocks/react-ui/styles.css";
import "@liveblocks/react-flow/styles.css";

/** Register the custom node type so React Flow uses our renderer. */
const nodeTypes: NodeTypes = {
  canvasNode: CanvasNodeRenderer,
};

/** Register the custom edge type. */
const edgeTypes: EdgeTypes = {
  canvasEdge: CanvasEdge,
};

/** Global counter for generating unique node IDs within this session. */
let nodeIdCounter = 0;

function generateNodeId(shape: CanvasNodeShape): string {
  nodeIdCounter += 1;
  return `${shape}-${Date.now()}-${nodeIdCounter}`;
}

interface CollaborativeCanvasProps {
  projectId: string;
}

export default function CollaborativeCanvas({
  projectId,
}: CollaborativeCanvasProps) {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, onDelete } =
    useLiveblocksFlow({
      suspense: true,
      nodes: {
        initial: [],
      },
      edges: {
        initial: [],
      },
    });

  const {
    screenToFlowPosition,
    addNodes,
    addEdges,
    setNodes,
    setEdges,
    getNodes,
    getEdges,
    fitView,
  } = useReactFlow();

  const updateMyPresence = useUpdateMyPresence();

  useEventListener(({ event }) => {
    if (event.type === "ai-add-node") {
      // Deduplicate: only add if not already present in the flow
      const currentNodes = getNodes();
      if (!currentNodes.some(n => n.id === event.payload.id)) {
        addNodes(event.payload);
        console.log(`[CANVAS] ✅ Added AI node: ${event.payload.id}`);
      }
    } else if (event.type === "ai-add-edge") {
      const currentEdges = getEdges();
      if (!currentEdges.some(e => e.id === event.payload.id)) {
        addEdges(event.payload);
        console.log(`[CANVAS] ✅ Added AI edge: ${event.payload.id}`);
      }
    }
  });

  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = React.useState(false);
  const isInitialLoadDone = React.useRef(false);

  const saveStatus = useCanvasAutosave(projectId, nodes, edges);

  React.useEffect(() => {
    document.dispatchEvent(
      new CustomEvent("canvas-save-status", { detail: saveStatus }),
    );
  }, [saveStatus]);

  React.useEffect(() => {
    if (isInitialLoadDone.current) return;

    // We only attempt to load from blob if the room is completely empty
    // and we haven't loaded yet. Since suspense is used, nodes/edges might be empty
    // simply because it's a new room. We wait a small tick to see if it's truly empty.
    const loadFromBlob = async () => {
      try {
        console.log(`[CANVAS] Loading initial canvas state from blob for project ${projectId}...`);
        const response = await fetch(`/api/projects/${projectId}/canvas`);
        if (response.ok) {
          const data = await response.json();
          // if nodes and edges are still empty in Liveblocks, and blob has data, set it
          if (
            nodes.length === 0 &&
            edges.length === 0 &&
            data.nodes?.length > 0
          ) {
            console.log(`[CANVAS] ✅ Loaded initial canvas state from blob — ${data.nodes.length} nodes, ${data.edges?.length ?? 0} edges`);
            setNodes(data.nodes);
            setEdges(data.edges);
            setTimeout(() => {
              fitView({ duration: 800 });
            }, 100);
          }
        }
      } catch (err) {
        console.error("[CANVAS] ❌ Failed to load initial canvas state:", err);
      } finally {
        isInitialLoadDone.current = true;
      }
    };

    // Give Liveblocks a tiny moment to populate state if it has it
    const timer = setTimeout(() => {
      if (nodes.length === 0 && edges.length === 0) {
        loadFromBlob();
      } else {
        isInitialLoadDone.current = true;
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [projectId, nodes.length, edges.length, setNodes, setEdges, fitView]);

  React.useEffect(() => {
    const handler = () => setIsTemplatesModalOpen(true);
    document.addEventListener("open-templates-modal", handler);
    return () => document.removeEventListener("open-templates-modal", handler);
  }, []);

  const handleImportTemplate = React.useCallback(
    (template: CanvasTemplate) => {
      // Use React Flow's state setters which will sync to Liveblocks via onNodesChange
      setNodes(template.nodes);
      setEdges(template.edges);

      setTimeout(() => {
        fitView({ duration: 800 });
      }, 100);
    },
    [setNodes, setEdges, fitView],
  );

  const handleConnect = React.useCallback(
    (connection: any) => {
      onConnect({
        ...connection,
        type: "canvasEdge",
        data: { label: "", arrowDirection: "target" },
      });
    },
    [onConnect],
  );

  const handleDragOver = React.useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
    },
    [],
  );

  const handlePointerMove = React.useCallback(
    (e: React.PointerEvent) => {
      // Ensure coordinates are integers to avoid unnecessary re-renders
      updateMyPresence({
        cursor: {
          x: Math.round(e.clientX),
          y: Math.round(e.clientY),
        },
      });
    },
    [updateMyPresence],
  );

  const handlePointerLeave = React.useCallback(() => {
    updateMyPresence({ cursor: null });
  }, [updateMyPresence]);

  const handleDrop = React.useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();

      const raw = e.dataTransfer.getData("application/ghost-shape");
      if (!raw) return;

      let payload: { shape: CanvasNodeShape; width: number; height: number };
      try {
        payload = JSON.parse(raw);
      } catch {
        return;
      }

      // Convert the browser screen position to React Flow canvas coordinates
      const position = screenToFlowPosition({
        x: e.clientX,
        y: e.clientY,
      });

      addNodes({
        id: generateNodeId(payload.shape),
        type: "canvasNode",
        position,
        data: {
          label: "",
          color: DEFAULT_NODE_COLOR,
          textColor: DEFAULT_TEXT_COLOR,
          shape: payload.shape,
        },
        style: {
          width: payload.width,
          height: payload.height,
        },
      });
    },
    [screenToFlowPosition, addNodes],
  );

  return (
    <div
      className="w-full h-full relative outline-none select-none"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={handleConnect}
        onDelete={onDelete}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={{
          type: "canvasEdge",
          markerStart: {
            type: MarkerType.ArrowClosed,
            color: "var(--muted-foreground)",
            orient: "auto-start-reverse",
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: "var(--muted-foreground)",
          },
        }}
        connectionMode={ConnectionMode.Loose}
        fitView
        className="bg-zinc-950/20"
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={16}
          size={1}
          className="text-muted-foreground/15"
        />
        <Cursors components={{ Cursor: CustomCursor }} />
      </ReactFlow>

      {/* Zoom and History Controls */}
      <CanvasControls />

      {/* Bottom floating shape toolbar */}
      <ShapePanel />

      <PresenceAvatars />

      <StarterTemplatesModal
        isOpen={isTemplatesModalOpen}
        onClose={() => setIsTemplatesModalOpen(false)}
        onImport={handleImportTemplate}
      />

      <AiStatusFeed />
    </div>
  );
}

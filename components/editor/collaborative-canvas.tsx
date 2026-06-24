"use client";

import * as React from "react";
import {
  ReactFlow,
  MiniMap,
  Background,
  ConnectionMode,
  BackgroundVariant,
  useReactFlow,
  type NodeTypes,
} from "@xyflow/react";
import { useLiveblocksFlow, Cursors } from "@liveblocks/react-flow";
import type { CanvasNodeShape } from "@/types/canvas";
import { DEFAULT_NODE_COLOR } from "@/types/canvas";
import CanvasNodeRenderer from "./canvas-node";
import ShapePanel from "./shape-panel";

import "@xyflow/react/dist/style.css";
import "@liveblocks/react-ui/styles.css";
import "@liveblocks/react-flow/styles.css";

/** Register the custom node type so React Flow uses our renderer. */
const nodeTypes: NodeTypes = {
  canvasNode: CanvasNodeRenderer,
};

/** Global counter for generating unique node IDs within this session. */
let nodeIdCounter = 0;

function generateNodeId(shape: CanvasNodeShape): string {
  nodeIdCounter += 1;
  return `${shape}-${Date.now()}-${nodeIdCounter}`;
}

export default function CollaborativeCanvas() {
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

  const { screenToFlowPosition, addNodes } = useReactFlow();

  const handleDragOver = React.useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
    },
    []
  );

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
          shape: payload.shape,
        },
        style: {
          width: payload.width,
          height: payload.height,
        },
      });
    },
    [screenToFlowPosition, addNodes]
  );

  return (
    <div className="w-full h-full relative outline-none select-none">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDelete={onDelete}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView
        className="bg-zinc-950/20"
      >
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} className="text-muted-foreground/15" />
        <MiniMap
          zoomable
          pannable
          className="!bg-background/90 !border-border/60 !rounded-lg"
          maskColor="rgba(0, 0, 0, 0.2)"
        />
        <Cursors />
      </ReactFlow>

      {/* Bottom floating shape toolbar */}
      <ShapePanel />
    </div>
  );
}

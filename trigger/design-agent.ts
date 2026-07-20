import { task, metadata } from "@trigger.dev/sdk";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateObject } from "ai";
import { Liveblocks } from "@liveblocks/node";
import { z } from "zod";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_AI_API_KEY,
});

export const designAgent = task({
  id: "design-agent",
  run: async (payload: { prompt: string; roomId: string }) => {
    const liveblocks = new Liveblocks({
      secret: process.env.LIVEBLOCKS_SECRET_KEY!,
    });

    // Helper to safely broadcast events
    const safeBroadcastEvent = async (event: any) => {
      try {
        await liveblocks.broadcastEvent(payload.roomId, event);
      } catch (err) {
        console.warn("Liveblocks broadcast failed:", err);
      }
    };

    // Helper to broadcast status
    const broadcastStatus = async (message: string) => {
      await safeBroadcastEvent({
        type: "ai-status",
        message,
      });
    };

    // Helper to inject agent presence via Liveblocks REST API
    const updatePresence = async (
      thinking: boolean,
      x: number = 0,
      y: number = 0,
    ) => {
      await fetch(
        `https://api.liveblocks.io/v2/rooms/${payload.roomId}/presence`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.LIVEBLOCKS_SECRET_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: "ghost-ai",
            userInfo: {
              name: "Ghost AI",
              avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=ghost",
              color: "#8B5CF6", // Violet
            },
            presence: {
              cursor: { x, y },
              thinking,
            },
            timeout: 30000, // Expire automatically after 30 seconds
          }),
        },
      ).catch((err) => console.error("Failed to update AI presence:", err));
    };

    try {
      metadata.set("status", "interpreting");
      await broadcastStatus("Interpreting requirements...");
      await updatePresence(true, 50, 50);

      // Define strict output schema for nodes and edges
      const schema = z.object({
        summary: z.string().describe("A brief explanation of what was designed and why, formatted as a short message to the user."),
        nodes: z.array(
          z.object({
            id: z.string().describe("Unique identifier for the node"),
            label: z.string().describe("Descriptive label for the node"),
            shape: z
              .enum([
                "rectangle",
                "circle",
                "diamond",
                "pill",
                "cylinder",
                "hexagon",
              ])
              .describe("The shape of the node"),
            x: z.number().describe("X coordinate on the canvas"),
            y: z.number().describe("Y coordinate on the canvas"),
            width: z
              .number()
              .describe("Width in pixels (e.g. 180 for rect, 100 for circle)"),
            height: z
              .number()
              .describe("Height in pixels (e.g. 80 for rect, 100 for circle)"),
          }),
        ),
        edges: z.array(
          z.object({
            id: z.string().describe("Unique identifier for the edge"),
            source: z.string().describe("ID of the source node"),
            target: z.string().describe("ID of the target node"),
            label: z
              .string()
              .optional()
              .describe("Optional label describing the connection"),
          }),
        ),
      });

      const { object } = await generateObject({
        model: google("gemini-3.5-flash"),
        schema,
        prompt: `You are an expert software architect. The user requested: "${payload.prompt}". 
        Generate a system architecture diagram composed of nodes and edges.
        Position the nodes logically (e.g. clients on left/top, databases on right/bottom) using absolute coordinates (x, y).
        Keep typical distances between connected nodes to 200-400px.
        Avoid overlapping nodes.
        Standard dimensions: rectangle (180x80), circle (100x100), cylinder (120x100), diamond (140x140).`,
      });

      metadata.set("status", "drawing");
      await broadcastStatus("Drawing components...");

      const NODE_COLOR = "#1F1F1F"; // Neutral
      const TEXT_COLOR = "#EDEDED";

      // Incrementally send nodes to look like real-time drawing
      for (const node of object.nodes) {
        const flowNode = {
          id: node.id,
          type: "canvasNode",
          position: { x: node.x, y: node.y },
          data: {
            label: node.label,
            shape: node.shape,
            color: NODE_COLOR,
            textColor: TEXT_COLOR,
          },
          style: { width: node.width, height: node.height },
        };

        await updatePresence(true, node.x, node.y);

        // Broadcast the node to the leader client
        await safeBroadcastEvent({
          type: "ai-add-node",
          payload: flowNode,
        });

        await new Promise((r) => setTimeout(r, 400));
      }

      metadata.set("status", "connecting");
      await broadcastStatus("Connecting systems...");

      // Incrementally send edges
      for (const edge of object.edges) {
        const flowEdge = {
          id: edge.id,
          source: edge.source,
          target: edge.target,
          type: "canvasEdge",
          data: { label: edge.label || "" },
        };

        // Estimate midpoint for cursor movement
        const sourceNode = object.nodes.find((n) => n.id === edge.source);
        const targetNode = object.nodes.find((n) => n.id === edge.target);
        if (sourceNode && targetNode) {
          await updatePresence(
            true,
            (sourceNode.x + targetNode.x) / 2,
            (sourceNode.y + targetNode.y) / 2,
          );
        }

        await safeBroadcastEvent({
          type: "ai-add-edge",
          payload: flowEdge,
        });

        await new Promise((r) => setTimeout(r, 300));
      }

      metadata.set("status", "finalizing");
      await broadcastStatus("Finalizing...");
      await new Promise((r) => setTimeout(r, 1000));

      // Clear thinking state and notify complete
      metadata.set("nodesGenerated", object.nodes.length);
      metadata.set("edgesGenerated", object.edges.length);
      await safeBroadcastEvent({ type: "ai-complete" });
      await updatePresence(false, 0, 0); // Presence will expire due to TTL anyway

      return {
        success: true,
        summary: object.summary,
        nodesGenerated: object.nodes.length,
        edgesGenerated: object.edges.length,
      };
    } catch (error) {
      console.error(error);
      await safeBroadcastEvent({
        type: "ai-error",
        message: "Generation failed.",
      });
      return { success: false, error: String(error) };
    }
  },
});

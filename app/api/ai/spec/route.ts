import { NextResponse } from "next/server";
import { getIdentity, checkProjectAccess } from "@/lib/project-access";
import { tasks } from "@trigger.dev/sdk/v3";
import type { generateSpec } from "@/trigger/generate-spec";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const identity = await getIdentity();
    if (!identity) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { roomId, chatHistory, nodes, edges } = await req.json();

    if (!roomId) {
      return new NextResponse("Missing roomId", { status: 400 });
    }

    // Verify project access using roomId as the projectId
    const project = await checkProjectAccess(roomId, identity.userId, identity.email);
    if (!project) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Trigger the background task
    const handle = await tasks.trigger<typeof generateSpec>("generate-spec", {
      projectId: roomId,
      roomId,
      chatHistory: chatHistory || [],
      nodes: nodes || [],
      edges: edges || [],
    });

    // Record the run in Prisma
    await prisma.taskRun.create({
      data: {
        runId: handle.id,
        projectId: roomId,
        userId: identity.userId,
      },
    });

    return NextResponse.json({ runId: handle.id });
  } catch (error) {
    console.error("[SPEC_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

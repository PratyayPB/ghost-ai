import { NextResponse } from "next/server";
import { getIdentity, checkProjectAccess } from "@/lib/project-access";
import { tasks } from "@trigger.dev/sdk/v3";
import { designAgent } from "@/trigger/design-agent";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const identity = await getIdentity();
    if (!identity) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { prompt, roomId, projectId } = await req.json();

    if (!prompt || !roomId || !projectId) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Verify project access
    const project = await checkProjectAccess(projectId, identity.userId, identity.email);
    if (!project) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Trigger the background task
    const handle = await tasks.trigger<typeof designAgent>("design-agent", {
      prompt,
      roomId,
    });

    // Record the run in Prisma
    await prisma.taskRun.create({
      data: {
        runId: handle.id,
        projectId,
        userId: identity.userId,
      },
    });

    return NextResponse.json({ runId: handle.id });
  } catch (error) {
    console.error("[DESIGN_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

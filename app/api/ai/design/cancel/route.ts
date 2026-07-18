import { NextResponse } from "next/server";
import { getIdentity, checkProjectAccess } from "@/lib/project-access";
import { runs } from "@trigger.dev/sdk/v3";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const identity = await getIdentity();
    if (!identity) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { runId, projectId } = await req.json();

    if (!runId || !projectId) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Verify project access
    const project = await checkProjectAccess(
      projectId,
      identity.userId,
      identity.email,
    );
    if (!project) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Verify the run belongs to this project by checking our DB record
    const runRecord = await prisma.taskRun.findUnique({
      where: { runId },
    });

    if (!runRecord || runRecord.projectId !== projectId) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Cancel the background task
    await runs.cancel(runId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DESIGN_CANCEL_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

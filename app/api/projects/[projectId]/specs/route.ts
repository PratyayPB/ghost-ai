import { NextRequest, NextResponse } from "next/server";
import { getIdentity, checkProjectAccess } from "@/lib/project-access";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const identity = await getIdentity();

    if (!identity) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const project = await checkProjectAccess(
      projectId,
      identity.userId,
      identity.email
    );

    if (!project) {
      return NextResponse.json({ error: "Project not found or access denied" }, { status: 404 });
    }

    // Retrieve list of specs for the project, sorted by newest first
    const specs = await prisma.projectSpec.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(specs);
  } catch (error) {
    console.error("Error listing project specifications:", error);
    return NextResponse.json({ error: "Failed to list specifications" }, { status: 500 });
  }
}

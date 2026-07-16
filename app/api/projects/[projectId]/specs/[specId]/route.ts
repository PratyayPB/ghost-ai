import { NextRequest, NextResponse } from "next/server";
import { del } from "@vercel/blob";
import { getIdentity, checkProjectAccess } from "@/lib/project-access";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; specId: string }> }
) {
  try {
    const { projectId, specId } = await params;
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

    // Verify that the requested spec exists and belongs to the project
    const spec = await prisma.projectSpec.findUnique({
      where: { id: specId },
    });

    if (!spec || spec.projectId !== projectId) {
      return NextResponse.json({ error: "Specification not found" }, { status: 404 });
    }

    // Delete the Markdown file from Vercel Blob
    await del(spec.filePath);

    // Delete the record from Prisma
    await prisma.projectSpec.delete({
      where: { id: specId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting specification:", error);
    return NextResponse.json({ error: "Failed to delete specification" }, { status: 500 });
  }
}

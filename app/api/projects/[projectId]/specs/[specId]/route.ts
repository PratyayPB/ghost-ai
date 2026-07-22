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
    console.log(`[SPEC_DELETE] Request to delete spec ${specId} in project ${projectId}`);
    const identity = await getIdentity();

    if (!identity) {
      console.log(`[SPEC_DELETE] ❌ Unauthorized`);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const project = await checkProjectAccess(
      projectId,
      identity.userId,
      identity.email
    );

    if (!project) {
      console.log(`[SPEC_DELETE] ❌ Project not found or access denied: ${projectId}`);
      return NextResponse.json({ error: "Project not found or access denied" }, { status: 404 });
    }

    // Verify that the requested spec exists and belongs to the project
    const spec = await prisma.projectSpec.findUnique({
      where: { id: specId },
    });

    if (!spec || spec.projectId !== projectId) {
      console.log(`[SPEC_DELETE] ❌ Specification not found or mismatch: specId ${specId}, projectId ${projectId}`);
      return NextResponse.json({ error: "Specification not found" }, { status: 404 });
    }

    // Delete the Markdown file from Vercel Blob
    await del(spec.filePath);
    console.log(`[BLOB] ✅ Deleted spec file from Vercel Blob: ${spec.filePath}`);

    // Delete the record from Prisma
    await prisma.projectSpec.delete({
      where: { id: specId },
    });
    console.log(`[DB:ProjectSpec] ✅ Deleted ProjectSpec record: ${specId}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[SPEC_DELETE] ❌ Error deleting specification:", error);
    return NextResponse.json({ error: "Failed to delete specification" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { get } from "@vercel/blob";
import { getIdentity, checkProjectAccess } from "@/lib/project-access";
import { prisma } from "@/lib/prisma";

export async function GET(
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

    // Fetch the Markdown content from Vercel Blob using get()
    const result = await get(spec.filePath, {
      access: "private",
    });

    if (!result || result.statusCode !== 200) {
      throw new Error("Failed to fetch spec from private store");
    }

    const markdown = await new Response(result.stream).text();

    // Return the markdown content as an attachment to force a browser download
    return new NextResponse(markdown, {
      status: 200,
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Content-Disposition": `attachment; filename="specification-${specId}.md"`,
      },
    });
  } catch (error) {
    console.error("Error downloading specification:", error);
    return NextResponse.json({ error: "Failed to download specification" }, { status: 500 });
  }
}

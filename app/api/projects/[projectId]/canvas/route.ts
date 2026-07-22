import { NextRequest, NextResponse } from "next/server";
import { put, get } from "@vercel/blob";
import { getIdentity, checkProjectAccess } from "@/lib/project-access";
import { prisma } from "@/lib/prisma"; // Adjust import if needed

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> },
) {
  try {
    const { projectId } = await params;
    console.log(`[CANVAS_PUT] Request to save canvas for project ${projectId}`);
    const identity = await getIdentity();

    if (!identity) {
      console.log(`[CANVAS_PUT] ❌ Unauthorized`);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const project = await checkProjectAccess(
      projectId,
      identity.userId,
      identity.email,
    );

    if (!project) {
      console.log(`[CANVAS_PUT] ❌ Not found or access denied for project ${projectId}`);
      return NextResponse.json(
        { error: "Not found or access denied" },
        { status: 404 },
      );
    }

    const body = await request.json();
    const canvasJson = JSON.stringify(body);
    console.log(`[CANVAS_PUT] Saving canvas payload — ${body.nodes?.length ?? 0} nodes, ${body.edges?.length ?? 0} edges`);

    // Upload to Vercel Blob
    const blob = await put(`projects/${projectId}/canvas.json`, canvasJson, {
      access: "private",
      contentType: "application/json",
      addRandomSuffix: false,
      allowOverwrite: true,
    });
    console.log(`[BLOB] ✅ Uploaded canvas state to Vercel Blob: ${blob.url}`);

    // Update project with Blob URL
    await prisma.project.update({
      where: { id: projectId },
      data: { canvasBlobUrl: blob.url },
    });
    console.log(`[DB:Project] ✅ Updated canvasBlobUrl for project ${projectId}`);

    return NextResponse.json({ success: true, url: blob.url });
  } catch (error) {
    console.error("[CANVAS_PUT] ❌ Error saving canvas:", error);
    return NextResponse.json(
      { error: "Failed to save canvas" },
      { status: 500 },
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> },
) {
  try {
    const { projectId } = await params;
    console.log(`[CANVAS_GET] Request to load canvas for project ${projectId}`);
    const identity = await getIdentity();

    if (!identity) {
      console.log(`[CANVAS_GET] ❌ Unauthorized`);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const project = await checkProjectAccess(
      projectId,
      identity.userId,
      identity.email,
    );

    if (!project) {
      console.log(`[CANVAS_GET] ❌ Not found or access denied for project ${projectId}`);
      return NextResponse.json(
        { error: "Not found or access denied" },
        { status: 404 },
      );
    }

    if (!project.canvasBlobUrl) {
      console.log(`[CANVAS_GET] ℹ️ No canvasBlobUrl set for project ${projectId}, returning empty canvas state`);
      return NextResponse.json({ nodes: [], edges: [] });
    }

    // Fetch the JSON from Vercel Blob using get()
    const result = await get(project.canvasBlobUrl, {
      access: "private",
    });

    if (!result || result.statusCode !== 200) {
      console.error(`[BLOB] ❌ Failed to fetch canvas blob: status ${result?.statusCode}`);
      throw new Error("Failed to fetch blob from private store");
    }

    const canvasState = await new Response(result.stream).json();
    console.log(`[CANVAS_GET] ✅ Loaded canvas state — ${canvasState.nodes?.length ?? 0} nodes, ${canvasState.edges?.length ?? 0} edges`);
    return NextResponse.json(canvasState);
  } catch (error) {
    console.error("[CANVAS_GET] ❌ Error loading canvas:", error);
    return NextResponse.json(
      { error: "Failed to load canvas" },
      { status: 500 },
    );
  }
}

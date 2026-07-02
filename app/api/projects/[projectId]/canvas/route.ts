import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { getIdentity, checkProjectAccess } from "@/lib/project-access";
import { prisma } from "@/lib/prisma"; // Adjust import if needed

export async function PUT(
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
      return NextResponse.json({ error: "Not found or access denied" }, { status: 404 });
    }

    const body = await request.json();
    const canvasJson = JSON.stringify(body);

    // Upload to Vercel Blob
    const blob = await put(`projects/${projectId}/canvas.json`, canvasJson, {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: false,
    });

    // Update project with Blob URL
    await prisma.project.update({
      where: { id: projectId },
      data: { canvasBlobUrl: blob.url },
    });

    return NextResponse.json({ success: true, url: blob.url });
  } catch (error) {
    console.error("Error saving canvas:", error);
    return NextResponse.json({ error: "Failed to save canvas" }, { status: 500 });
  }
}

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
      return NextResponse.json({ error: "Not found or access denied" }, { status: 404 });
    }

    if (!project.canvasBlobUrl) {
      return NextResponse.json({ nodes: [], edges: [] });
    }

    // Fetch the JSON from Vercel Blob
    const response = await fetch(project.canvasBlobUrl, {
      next: { revalidate: 0 }, // always get latest
    });
    
    if (!response.ok) {
      throw new Error("Failed to fetch blob");
    }

    const canvasState = await response.json();
    return NextResponse.json(canvasState);
  } catch (error) {
    console.error("Error loading canvas:", error);
    return NextResponse.json({ error: "Failed to load canvas" }, { status: 500 });
  }
}

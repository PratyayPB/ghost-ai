import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { getIdentity, checkProjectAccess } from "@/lib/project-access";
import { liveblocks, getUserColor } from "@/lib/liveblocks";

/**
 * POST /api/liveblocks-auth
 * Authentication endpoint for Liveblocks client-side sessions.
 * Verifies Clerk auth and database project accesses, then issues an ID token.
 */
export async function POST(request: Request) {
  console.log("[LIVEBLOCKS_AUTH] Incoming Liveblocks session authentication request");
  // 1. Authenticate user via Clerk
  const identity = await getIdentity();
  if (!identity) {
    console.log("[LIVEBLOCKS_AUTH] ❌ Unauthorized — no Clerk identity");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Parse room ID (corresponds to project ID)
  let roomId: string;
  try {
    const body = await request.json();
    if (!body.room || typeof body.room !== "string") {
      console.log("[LIVEBLOCKS_AUTH] ❌ Room ID is missing or invalid");
      return NextResponse.json({ error: "Room ID is required" }, { status: 400 });
    }
    roomId = body.room;
  } catch {
    console.log("[LIVEBLOCKS_AUTH] ❌ Invalid JSON request body");
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  // 3. Verify user has project access (owner or collaborator)
  const project = await checkProjectAccess(roomId, identity.userId, identity.email);
  if (!project) {
    console.log(`[LIVEBLOCKS_AUTH] ❌ Forbidden — user ${identity.userId} has no access to room ${roomId}`);
    return NextResponse.json({ error: "Forbidden: Access denied to this project" }, { status: 403 });
  }

  // 4. Ensure the room exists in Liveblocks and grant write accesses
  try {
    const room = await liveblocks.getOrCreateRoom(roomId, {
      defaultAccesses: [], // private room
      usersAccesses: {
        [identity.userId]: ["room:write"],
      },
    });

    // If the room exists but user accesses aren't synchronized, update them
    if (!room.usersAccesses[identity.userId]?.includes("room:write")) {
      await liveblocks.updateRoom(roomId, {
        usersAccesses: {
          [identity.userId]: ["room:write"],
        },
      });
    }
    console.log(`[EXT:Liveblocks] ✅ Room accesses synchronized for room ${roomId}, user ${identity.userId}`);
  } catch (err) {
    console.error("[EXT:Liveblocks] ❌ Error synchronizing Liveblocks room accesses:", err);
  }

  // 5. Fetch full Clerk user profiles to enrich token metadata
  let name = "Guest";
  let avatar = "";
  try {
    const clerkUser = await currentUser();
    if (clerkUser) {
      name =
        [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
        clerkUser.username ||
        clerkUser.primaryEmailAddress?.emailAddress ||
        "Guest";
      avatar = clerkUser.imageUrl || "";
    }
  } catch (err) {
    console.error("[LIVEBLOCKS_AUTH] ⚠️ Error fetching Clerk user profiles:", err);
  }

  // 6. Identify user and generate token response
  try {
    const { status, body } = await liveblocks.identifyUser(
      identity.userId,
      {
        userInfo: {
          name,
          avatar,
          color: getUserColor(identity.userId),
        },
      }
    );

    console.log(`[LIVEBLOCKS_AUTH] ✅ Successfully issued Liveblocks identity token for user ${identity.userId} in room ${roomId}`);
    return new Response(body, {
      status,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (err) {
    console.error("[LIVEBLOCKS_AUTH] ❌ Error generating Liveblocks session token:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

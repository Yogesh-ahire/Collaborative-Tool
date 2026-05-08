import { Liveblocks } from "@liveblocks/node";
import { ConvexHttpClient } from "convex/browser";
import { auth, currentUser } from "@clerk/nextjs/server";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

const liveblocks = new Liveblocks({
  secret: process.env.LIVEBLOCKS_SECRET_KEY!,
});

interface ClerkOrgClaims {
  id?: string;
  rol?: string;
  slg?: string;
}

export async function POST(req: Request) {
  try {
    const { sessionClaims, getToken } = await auth();

    if (!sessionClaims) {
      return new Response("Unauthorized", { status: 401 });
    }

    const token = await getToken({ template: "convex" });

    // ✅ SAFE CHECK (important)
    if (!token) {
      return new Response("Unauthorized", { status: 401 });
    }

    convex.setAuth(token);

    const user = await currentUser();

    if (!user) {
      return new Response("Unauthorized", { status: 401 });
    }

    // ✅ SAFE BODY PARSE
    let room: string | undefined;

    try {
      const body = await req.json();
      room = body?.room;
    } catch {
      return new Response("Invalid request body", { status: 400 });
    }

    if (!room) {
      return new Response("Missing room", { status: 400 });
    }

 const document = await convex.query(api.documents.getById, {
  id: room as Id<"documents">,
});

    if (!document) {
      return new Response("Unauthorized", { status: 401 });
    }

    const isOwner = document.ownerId === user.id;

    const orgData = (sessionClaims?.o || {}) as ClerkOrgClaims;
    const orgId = sessionClaims?.org_id || orgData.id;

    const isOrganizationMember =
      !!(document.organizationId && document.organizationId === orgId);

    if (!isOwner && !isOrganizationMember) {
      return new Response("Forbidden", { status: 403 });
    }

    const name =
      user.fullName ??
      user.primaryEmailAddress?.emailAddress ??
      "Anonymous";

    const nameToNumber = name
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);

    const hue = Math.abs(nameToNumber) % 360;
    const color = `hsl(${hue}, 80%, 60%)`;

    const session = liveblocks.prepareSession(user.id, {
      userInfo: {
        name,
        email: user.username,
        avatar: user.imageUrl,
        color,
      },
    });

    session.allow(room, session.FULL_ACCESS);

    const { body, status } = await session.authorize();

    return new Response(body, { status });
  } catch (err) {
    console.error("Liveblocks auth error:", err);
    return new Response("Internal Server Error", { status: 500 });
  }
}
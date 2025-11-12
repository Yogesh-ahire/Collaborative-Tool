"use server";

import { ConvexHttpClient } from "convex/browser";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { Id } from "../../../../convex/_generated/dataModel";
import { api } from "../../../../convex/_generated/api";

interface ClerkOrgClaims {
  id?: string;
  rol?: string;
  slg?: string;
}

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function getDocuments( ids: Id<"documents">[]){
    return await convex.query(api.documents.getByIds, { ids });
} 

export async function getUsers() {
    const { sessionClaims } =await auth();
    const clerk = await clerkClient();

    const orgData = (sessionClaims?.o || {}) as ClerkOrgClaims;
    const orgId = sessionClaims?.org_id || orgData.id;

    const response = await clerk.users.getUserList({
        organizationId: [orgId as string] // in the video i am reffering it was 
    });

    const users = response.data.map((user) => ({
        id: user.id,
        name: user.fullName ?? user.primaryEmailAddress?.emailAddress ?? "Anonymous",
        avatar: user.imageUrl,
        color: "",
    }));

    return users;
}
"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";

interface ClerkOrgClaims {
  id?: string;
  rol?: string;
  slg?: string;
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
    }));

    return users;
}
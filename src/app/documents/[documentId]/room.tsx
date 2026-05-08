"use client";

import { toast } from "sonner";
import { getUsers, getDocuments } from "./actions";
import { ReactNode, useEffect, useMemo, useState } from "react";

import {
    LiveblocksProvider,
    RoomProvider,
    ClientSideSuspense,
} from "@liveblocks/react/suspense";

import { FullscreenLoader } from "@/components/fullscreen-loader";
import { LEFT_MARGIN_DEFAULT, RIGHT_MARGIN_DEFAULT } from "@/constants/margins";

import { useParams } from "next/navigation";
import { Id } from "../../../../convex/_generated/dataModel";

// The local type lacks 'email', which causes the conflict.
type User = { id: string; name: string; avatar: string; color: string; };

export function Room({ children }: { children: ReactNode }) {
    const params = useParams();

    const [users, setUsers] = useState<User[]>([]);

    const fetchUsers = useMemo(
        () => async () => {
            try {
                const list = await getUsers();
                setUsers(list);
            } catch {
                toast.error("Failed to fetch users");
            }
        },
        [],
    );

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    return (
        <LiveblocksProvider
            throttle={16}
            authEndpoint={async () => {
                const endpoint = "/api/liveblocks-auth";
                const room = params.documentId as string;

                const response = await fetch(endpoint, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ room }),
                });

                if (!response.ok) {
                    throw new Error("Liveblocks auth failed");
                }

                return await response.json();
            }}
            resolveUsers={({ userIds }) => {
                return userIds.map((userId) => {
                    const user = users.find((user) => user.id === userId);
                    if (!user) return undefined;
                    
                    // We explicitly reconstruct the object to satisfy the liveblocks.config.ts contract
                    return {
                        name: user.name,
                        avatar: user.avatar,
                        color: user.color,
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        email: (user as any).email ?? null, 
                    };
                });
            }}
            resolveMentionSuggestions={({ text }) => {
                let filteredUsers = users;

                if (text) {
                    filteredUsers = users.filter((user) =>
                        user.name.toLowerCase().includes(text.toLowerCase())
                    );
                }

                return filteredUsers.map((user) => user.id);
            }}
            resolveRoomsInfo={async ({ roomIds }) => {
                const documents = await getDocuments(roomIds as Id<"documents">[]);
                return documents.map((document) => ({
                    id: document.id,
                    name: document.name,
                }));
            }}
        >
            <RoomProvider
                id={params.documentId as string}
                initialStorage={{ leftMargin: LEFT_MARGIN_DEFAULT, rightMargin: RIGHT_MARGIN_DEFAULT }}
            >
                <ClientSideSuspense fallback={<FullscreenLoader label="Room loading..." />}>
                    {children}
                </ClientSideSuspense>
            </RoomProvider>
        </LiveblocksProvider>
    );
}
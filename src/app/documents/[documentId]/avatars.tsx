"use client";

import { Separator } from "@/components/ui/separator";
import { ClientSideSuspense } from "@liveblocks/react";
import { useOthers, useSelf } from "@liveblocks/react/suspense";

const AVATAR_SIZE = 36;

export const Avatars = () => {
    return (
        <ClientSideSuspense fallback={null}>
            <AvatarStack />
        </ClientSideSuspense>
    );
};

const AvatarStack = () => {
    const users = useOthers();
    const currentUser = useSelf();

    if (users.length === 0 && !currentUser) return null;

    return (
        <>
            {/* 🔥 THE FIX: flex-nowrap strictly prevents avatars from circling or breaking layout */}
            <div className="flex items-center flex-nowrap">
                {[currentUser, ...users].filter(Boolean).map((user, index) => (
                    <div
                        key={user.connectionId ?? index}
                        className="relative shrink-0 transition-all hover:z-50"
                        style={{ 
                            // 🔥 THE FIX: Strict overlapping formula. First avatar is on top (zIndex 100).
                            zIndex: 100 - index,
                            marginLeft: index === 0 ? 0 : "-12px" 
                        }}
                    >
                        <Avatar
                            src={user?.info?.avatar}
                            name={index === 0 ? "You" : user?.info?.name || "Anonymous"}
                        />
                    </div>
                ))}
            </div>
            <Separator orientation="vertical" className="h-6 mx-2" />
        </>
    )
}

interface AvatarProps {
    src?: string;
    name: string;
};

const Avatar = ({ src, name }: AvatarProps) => {
    return (
        <div
            style={{ width: AVATAR_SIZE, height: AVATAR_SIZE }}
            // 🔥 THE FIX: Removed negative margin from here, reduced border thickness
            className="group flex shrink-0 place-content-center relative border-2 border-white rounded-full bg-gray-400 shadow-sm"
        >
            <div className="opacity-0 group-hover:opacity-100 absolute top-full py-1 px-2 text-white text-xs rounded-lg mt-2.5 z-10 bg-black whitespace-nowrap transition-opacity">
                {name}
            </div>
            {src ? (
                <img
                    alt={name}
                    src={src}
                    className="size-full rounded-full object-cover"
                />
            ) : (
                <span className="text-white text-xs font-semibold flex items-center justify-center h-full">
                    {name.charAt(0).toUpperCase()}
                </span>
            )}
        </div>
    )
}
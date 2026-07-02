"use client";

import * as React from "react";
import { useOthers } from "@liveblocks/react/suspense";
import { useUser, UserButton } from "@clerk/nextjs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function PresenceAvatars() {
  const others = useOthers();
  const { user } = useUser();

  // Filter out any other connections from the same user (e.g. multiple tabs)
  const collaborators = others.filter((other) => other.id !== user?.id);

  const maxVisible = 5;
  const visibleCollaborators = collaborators.slice(0, maxVisible);
  const overflowCount = collaborators.length - maxVisible;

  return (
    <div className="absolute top-4 right-4 z-50 flex items-center gap-3">
      {collaborators.length > 0 && (
        <div className="flex items-center">
          <div className="flex items-center -space-x-2">
            {visibleCollaborators.map((other) => {
              const info = other.info;
              if (!info) return null;

              return (
                <Avatar 
                  key={other.connectionId} 
                  className="size-8 border-2 border-zinc-950 ring-1 ring-border/20"
                  style={{ borderColor: info.color || 'var(--zinc-950)' }}
                  title={info.name}
                >
                  <AvatarImage src={info.avatar} alt={info.name} />
                  <AvatarFallback className="text-xs font-medium bg-zinc-800 text-zinc-200">
                    {info.name?.charAt(0) || "?"}
                  </AvatarFallback>
                </Avatar>
              );
            })}
            
            {overflowCount > 0 && (
              <div className="flex size-8 items-center justify-center rounded-full border-2 border-zinc-950 bg-zinc-800 text-xs font-medium text-zinc-300 ring-1 ring-border/20">
                +{overflowCount}
              </div>
            )}
          </div>
          
          <div className="w-px h-5 bg-border ml-3" />
        </div>
      )}

      <UserButton />
    </div>
  );
}

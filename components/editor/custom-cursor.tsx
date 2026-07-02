"use client";

import * as React from "react";
import { useOther } from "@liveblocks/react/suspense";
import { Loader2 } from "lucide-react";

interface CustomCursorProps {
  connectionId: number;
  userId: string;
}

export default function CustomCursor({ connectionId, userId }: CustomCursorProps) {
  const thinking = useOther(connectionId, (user) => user.presence?.thinking);
  const info = useOther(connectionId, (user) => user.info);

  if (!info) return null;

  const color = info.color || "#A78BFA";
  const name = info.name || "Collaborator";

  return (
    <div className="relative pointer-events-none select-none">
      {/* Standard Pointer SVG */}
      <svg
        className="size-5 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M5.65376 12.396L2.68434 2.196L12.396 5.65376L7.3308 7.3308L5.65376 12.396Z"
          fill={color}
          stroke="white"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>

      {/* Name badge below/right of the cursor pointer */}
      <div
        style={{ backgroundColor: color }}
        className="absolute left-4 top-4 flex items-center gap-1 px-2 py-0.5 rounded-sm text-[10px] font-semibold text-white shadow-sm whitespace-nowrap border border-white/20"
      >
        <span>{name}</span>
        {thinking && (
          <Loader2 className="size-2.5 animate-spin text-white" />
        )}
      </div>
    </div>
  );
}

"use client";
import { Platform } from "@/types";

export default function PlatformBadge({ platform }: { platform: Platform }) {
  return (
    <span
      className="inline-block rounded-md text-[10.5px] font-medium px-2 py-0.5"
      style={{
        background:  platform.bg_color,
        color:       platform.color,
        border:      `1px solid ${platform.color}33`,
      }}
    >
      {platform.name}
    </span>
  );
}

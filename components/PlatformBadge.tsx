"use client";
import { Platform } from "@/types";

const SLUG_CLASS: Record<string, string> = {
  chatgpt: "platform-chatgpt",
  claude:  "platform-claude",
  gemini:  "platform-gemini",
};

export default function PlatformBadge({ platform }: { platform: Platform }) {
  const cls = SLUG_CLASS[platform.slug] ?? "";
  return (
    <span className={`inline-block rounded-md text-[10.5px] font-medium px-2 py-0.5 ${cls}`}>
      {platform.name}
    </span>
  );
}

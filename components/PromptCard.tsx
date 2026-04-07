"use client";
import { Prompt, Platform } from "@/types";
import PlatformBadge from "./PlatformBadge";
import { getCategoryIcon } from "./icons";

interface Props {
  prompt: Prompt & { platforms: Platform[]; variable_count: number };
  onUse: (p: Prompt) => void;
  onEdit: (p: Prompt) => void;
}

export default function PromptCard({ prompt, onUse, onEdit }: Props) {
  return (
    <div
      className="group flex flex-col rounded-xl p-4 gap-3 transition-all duration-150 cursor-default"
      style={{
        background: "var(--surface-1)",
        border: "1.5px solid var(--border)",
      }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--border-strong)")}
      onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border)")}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <h3
          className="text-[13.5px] font-semibold leading-snug line-clamp-2 flex-1"
          style={{ color: "var(--text-primary)" }}
        >
          {prompt.title}
        </h3>
        {prompt.category_name && (
          <span
            className="flex-shrink-0 flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md font-medium whitespace-nowrap"
            style={{
              background: "var(--surface-2)",
              color: "var(--text-secondary)",
              border: "1px solid var(--border)",
            }}
          >
            {(() => { const I = getCategoryIcon(prompt.category_icon); return <I size={11} sw={1.8} />; })()}
            {prompt.category_name}
          </span>
        )}
      </div>

      {/* Description */}
      <p
        className="text-[12.5px] leading-relaxed line-clamp-3 flex-1"
        style={{ color: "var(--text-tertiary)" }}
      >
        {prompt.description || "暂无描述"}
      </p>

      {/* Platforms */}
      {prompt.platforms?.length > 0 && (
        <div className="flex gap-1.5 flex-wrap">
          {prompt.platforms.map(p => (
            <PlatformBadge key={p.id} platform={p} />
          ))}
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between pt-3"
        style={{ borderTop: "1px solid var(--border)" }}
      >
        <span className="text-[11px] font-mono" style={{ color: "var(--text-tertiary)" }}>
          {prompt.variable_count > 0 ? `${prompt.variable_count} 个变量` : "无变量"}
        </span>
        <div className="flex gap-1.5">
          <button
            onClick={() => onEdit(prompt)}
            className="text-[12px] px-3 py-1.5 rounded-lg font-medium cursor-pointer transition-colors"
            style={{
              color: "var(--text-secondary)",
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "var(--surface-hover)")}
            onMouseLeave={e => (e.currentTarget.style.background = "var(--surface-2)")}
          >
            编辑
          </button>
          <button
            onClick={() => onUse(prompt)}
            className="btn-primary text-[12px] px-3 py-1.5 rounded-lg"
          >
            使用
          </button>
        </div>
      </div>
    </div>
  );
}

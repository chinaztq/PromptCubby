"use client";
import { useState, useEffect, useCallback } from "react";
import { Category, Platform, Prompt, Variable } from "@/types";
import PromptCard from "@/components/PromptCard";
import UseModal from "@/components/UseModal";
import EditModal from "@/components/EditModal";
import {
  IconAll, IconBox,
  IconX, IconPlus, IconSearch,
  getCategoryIcon,
} from "@/components/icons";

type FullPrompt = Prompt & { platforms: Platform[]; variables: Variable[]; variable_count: number };

/* ─── Sidebar nav item ─── */
function NavItem({
  icon, label, count, active, onClick,
}: { icon: React.ReactNode; label: string; count: number; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[14px] transition-all cursor-pointer group ${
        active ? "bg-white shadow-sm text-black font-semibold" : "text-black hover:bg-white/60 font-normal"
      }`}
    >
      <span className="w-4 h-4 flex-shrink-0 flex items-center justify-center">{icon}</span>
      <span className="flex-1 text-left truncate">{label}</span>
      <span className={`text-[11px] px-1.5 py-0.5 rounded-md font-mono tabular-nums ${
        active ? "bg-black text-white" : "bg-[#d4d2cc] text-black group-hover:bg-[#c8c6c0]"
      }`}>
        {count}
      </span>
    </button>
  );
}

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [platforms, setPlatforms]   = useState<Platform[]>([]);
  const [prompts, setPrompts]       = useState<FullPrompt[]>([]);
  const [selectedCat, setSelectedCat] = useState<number | "all">("all");
  const [searchQ, setSearchQ]       = useState("");
  const [loading, setLoading]       = useState(true);
  const [useTarget, setUseTarget]   = useState<FullPrompt | null>(null);
  const [editTarget, setEditTarget] = useState<FullPrompt | null | "new">(null);

  const fetchPrompts = useCallback(async (q = "", catId: number | "all" = "all") => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (catId !== "all") params.set("category_id", String(catId));
      const res = await fetch(`/api/prompts?${params}`);
      setPrompts(await res.json());
    } finally { setLoading(false); }
  }, []);

  const refreshCategories = useCallback(() =>
    fetch("/api/categories").then(r => r.json()).then(setCategories), []);

  useEffect(() => {
    Promise.all([
      fetch("/api/categories").then(r => r.json()),
      fetch("/api/platforms").then(r => r.json()),
    ]).then(([cats, plats]) => { setCategories(cats); setPlatforms(plats); });
    fetchPrompts();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => fetchPrompts(searchQ, selectedCat), 280);
    return () => clearTimeout(t);
  }, [searchQ, selectedCat]);

  async function openUseModal(p: Prompt) {
    const res = await fetch(`/api/prompts/${p.id}`);
    setUseTarget(await res.json());
  }
  async function openEditModal(p: Prompt) {
    const res = await fetch(`/api/prompts/${p.id}`);
    setEditTarget(await res.json());
  }

  const totalAll = categories.reduce((s, c) => s + (c.prompt_count || 0), 0);
  const currentCatLabel =
    selectedCat === "all" ? "全部" : categories.find(c => c.id === selectedCat)?.name || "";

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#FAF8F4" }}>

      {/* ════ Sidebar ════ */}
      <aside
        className="flex-shrink-0 flex flex-col overflow-y-auto"
        style={{ width: "var(--sidebar-w)", background: "#F3F1ED", borderRight: "1px solid var(--border)" }}
      >
        {/* Brand */}
        <div className="px-4 pt-5 pb-4">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-black"
              style={{ border: "1.5px solid #000" }}
            >
              <IconBox />
            </div>
            <div>
              <div className="text-[13.5px] font-bold" style={{ color: "#000000" }}>PromptCubby</div>
              <div className="text-[10px]" style={{ color: "#000000" }}>Prompt Manager</div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-3 pb-3 flex flex-col gap-2">
          <button
            onClick={() => setEditTarget("new")}
            className="btn-primary w-full flex items-center justify-center gap-1.5"
          >
            <IconPlus size={14} sw={2.4} />
            新增提示词
          </button>
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all"
            style={{ background: "rgba(0,0,0,0.05)", border: "1.5px solid transparent" }}
            onFocus={e => (e.currentTarget.style.borderColor = "var(--text-primary)")}
            onBlur={e  => (e.currentTarget.style.borderColor = "transparent")}
          >
            <span style={{ color: "var(--text-tertiary)", flexShrink: 0 }}>
              <IconSearch size={14} />
            </span>
            <input
              className="flex-1 bg-transparent text-[13px] outline-none min-w-0"
              style={{ color: "var(--text-primary)" }}
              placeholder="搜索提示词…"
              value={searchQ}
              onChange={e => setSearchQ(e.target.value)}
            />
            {searchQ && (
              <button
                onClick={() => setSearchQ("")}
                className="flex-shrink-0 flex items-center justify-center cursor-pointer"
                style={{ color: "var(--text-tertiary)" }}
              >
                <IconX size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2.5 py-3 flex flex-col gap-0.5">
          <div className="text-[10px] font-semibold uppercase tracking-widest px-2 py-1.5" style={{ color: "#000000" }}>
            分类
          </div>

          <NavItem
            icon={<IconAll />} label="全部提示词" count={totalAll}
            active={selectedCat === "all"} onClick={() => setSelectedCat("all")}
          />
          {categories.map(c => {
            const CatIcon = getCategoryIcon(c.icon);
            return (
              <NavItem
                key={c.id}
                icon={<CatIcon />} label={c.name} count={c.prompt_count || 0}
                active={selectedCat === c.id} onClick={() => setSelectedCat(c.id)}
              />
            );
          })}
        </nav>

        {/* User profile */}
        <div className="px-3 py-3" style={{ borderTop: "1px solid var(--border)" }}>
          <div
            className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer transition-colors"
            style={{ color: "var(--text-primary)" }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(0,0,0,0.05)")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold flex-shrink-0"
              style={{ background: "#1a1a1a", color: "#fff" }}
            >
              U
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-semibold truncate" style={{ color: "var(--text-primary)" }}>Tony</div>
              <div className="text-[11px] truncate" style={{ color: "var(--text-tertiary)" }}>工作区管理员</div>
            </div>
          </div>
        </div>
      </aside>

      {/* ════ Main ════ */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">


        {/* Content */}
        <main className="flex-1 overflow-y-auto px-6 py-5">

          {/* ── Welcome banner ── */}
          {selectedCat === "all" && !searchQ && (
            <div className="mb-8 pt-2">
              <span
                className="inline-block text-[11px] font-semibold tracking-widest uppercase px-3 py-1 rounded-full mb-5"
                style={{ background: "rgba(214,90,80,0.10)", color: "#c0524a" }}
              >
                工作区已就绪
              </span>
              <h1 className="text-[42px] font-bold leading-tight mb-3" style={{ color: "var(--text-primary)" }}>
                Hi, Tony 👋
              </h1>
              <p className="text-[17px]" style={{ color: "var(--text-tertiary)", whiteSpace: "nowrap" }}>
                {loading
                  ? "正在加载提示词库…"
                  : "Prompt better. Build faster. Write once. Use everywhere. One prompt. Endless possibilities."}
              </p>
            </div>
          )}

          {/* Results bar */}
          <div className="flex items-center gap-2 mb-5">
            <span className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>
              {currentCatLabel && (
                <span className="font-medium mr-1.5" style={{ color: "var(--text-secondary)" }}>
                  {currentCatLabel}
                </span>
              )}
              {loading ? "加载中…" : `${prompts.length} 个提示词`}
              {searchQ && !loading && (
                <span>
                  {" "}· 搜索 "<span style={{ color: "var(--text-primary)", fontWeight: 500 }}>{searchQ}</span>"
                </span>
              )}
            </span>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="rounded-xl h-44 animate-pulse" style={{ background: "var(--surface-2)" }} />
              ))}
            </div>
          ) : prompts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5" style={{ background: "var(--surface-2)" }}>
                <span style={{ color: "var(--text-tertiary)" }}>
                  <IconSearch size={28} sw={1.5} />
                </span>
              </div>
              <div className="text-[15px] font-semibold mb-1.5" style={{ color: "var(--text-primary)" }}>
                {searchQ ? "未找到相关提示词" : "还没有提示词"}
              </div>
              <div className="text-[13px] mb-6" style={{ color: "var(--text-tertiary)" }}>
                {searchQ ? `没有与 "${searchQ}" 匹配的内容` : "点击「新增提示词」创建你的第一个模板"}
              </div>
              {!searchQ && (
                <button onClick={() => setEditTarget("new")} className="btn-primary flex items-center gap-1.5">
                  <IconPlus size={14} sw={2.4} />
                  新增提示词
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
              {prompts.map(p => (
                <PromptCard key={p.id} prompt={p} onUse={openUseModal} onEdit={openEditModal} />
              ))}
              {/* Add new */}
              <button
                onClick={() => setEditTarget("new")}
                className="rounded-xl min-h-[160px] flex flex-col items-center justify-center gap-2 transition-all cursor-pointer"
                style={{ border: "1.5px dashed var(--border-strong)", background: "transparent", color: "var(--text-tertiary)" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--text-primary)"; e.currentTarget.style.color = "var(--text-primary)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border-strong)"; e.currentTarget.style.color = "var(--text-tertiary)"; }}
              >
                <IconPlus size={24} sw={1.5} />
                <span className="text-[12px] font-medium">新增提示词</span>
              </button>
            </div>
          )}
        </main>
      </div>

      {/* ── Modals ── */}
      {useTarget && <UseModal prompt={useTarget} onClose={() => setUseTarget(null)} />}
      {editTarget && (
        <EditModal
          prompt={editTarget === "new" ? null : editTarget}
          categories={categories}
          allPlatforms={platforms}
          onClose={() => setEditTarget(null)}
          onSaved={() => { setEditTarget(null); fetchPrompts(searchQ, selectedCat); refreshCategories(); }}
        />
      )}
    </div>
  );
}

"use client";
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Prompt, Platform, Variable, Category } from "@/types";
import { IconX, IconCheck, getCategoryIcon, IconChevronDown, getPlatformLogo } from "./icons";

interface Props {
  prompt?: Prompt & { platforms: Platform[]; variables: Variable[] } | null;
  categories: Category[];
  allPlatforms: Platform[];
  onClose: () => void;
  onSaved: () => void;
}

const VAR_TYPES = [
  { value: "text",     label: "单行文本" },
  { value: "textarea", label: "多行文本" },
  { value: "select",   label: "下拉选择" },
  { value: "radio",    label: "单选"     },
  { value: "number",   label: "数字"     },
  { value: "date",     label: "日期"     },
];

function extractVars(content: string): string[] {
  const seen = new Set<string>(), out: string[] = [];
  for (const m of content.matchAll(/\{\{([^}]+)\}\}/g)) {
    if (!seen.has(m[1])) { seen.add(m[1]); out.push(m[1]); }
  }
  return out;
}

interface VarRow { name: string; hint: string; type: string; options: string; default_value: string; required: boolean; }

function Card({ title, children, overflowVisible }: { title: string; children: React.ReactNode; overflowVisible?: boolean }) {
  return (
    <div className={`rounded-xl ${overflowVisible ? "" : "overflow-hidden"}`} style={{ background: "var(--surface-1)", border: "1px solid var(--border)" }}>
      <div className="px-4 py-3 rounded-t-xl" style={{ borderBottom: "1px solid var(--border)", background: "var(--surface-2)" }}>
        <span className="text-[12px] font-semibold" style={{ color: "var(--text-primary)" }}>{title}</span>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

export default function EditModal({ prompt, categories, allPlatforms, onClose, onSaved }: Props) {
  const isEdit = !!prompt;
  const [title, setTitle] = useState(prompt?.title ?? "");
  const [description, setDescription] = useState(prompt?.description ?? "");
  const [content, setContent] = useState(prompt?.content ?? "");
  const [categoryId, setCategoryId] = useState<number>(prompt?.category_id ?? (categories[0]?.id ?? 0));
  const [platIds, setPlatIds] = useState<number[]>(prompt?.platforms.map(p => p.id) ?? []);
  const [varRows, setVarRows] = useState<VarRow[]>(
    prompt?.variables.map(v => ({
      name: v.name, hint: v.hint, type: v.type,
      options: v.options ?? "", default_value: v.default_value ?? "", required: !!v.required,
    })) ?? []
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [catRect, setCatRect] = useState<DOMRect | null>(null);
  const catRef = useRef<HTMLDivElement>(null);
  const catBtnRef = useRef<HTMLButtonElement>(null);
  const catDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const names = extractVars(content);
    setVarRows(prev => {
      const map = new Map(prev.map(r => [r.name, r]));
      return names.map(n => map.get(n) ?? { name: n, hint: "", type: "text", options: "", default_value: "", required: false });
    });
  }, [content]);

  useEffect(() => {
    if (!catOpen) return;
    function handleClick(e: MouseEvent) {
      const inTrigger  = catRef.current?.contains(e.target as Node);
      const inDropdown = catDropdownRef.current?.contains(e.target as Node);
      if (!inTrigger && !inDropdown) setCatOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [catOpen]);

  function togglePlat(id: number) {
    setPlatIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  function updateVar(i: number, field: keyof VarRow, val: string | boolean) {
    setVarRows(prev => prev.map((r, idx) => idx === i ? { ...r, [field]: val } : r));
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = "标题不能为空";
    if (!content.trim()) e.content = "正文不能为空";
    if (!categoryId) e.category = "请选择分类";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    setSaving(true);
    try {
      const body = {
        title: title.trim(), description: description.trim(),
        content: content.trim(), category_id: categoryId,
        platform_ids: platIds,
        variables: varRows.map((v, i) => ({ ...v, sort_order: i })),
      };
      const res = await fetch(
        isEdit ? `/api/prompts/${prompt!.id}` : "/api/prompts",
        { method: isEdit ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }
      );
      if (!res.ok) throw new Error();
      onSaved();
    } catch {
      setErrors({ submit: "保存失败，请重试" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div
        className="w-full flex flex-col animate-slide-up"
        style={{
          maxWidth: 900,
          maxHeight: "94vh",
          background: "var(--surface-0)",
          borderRadius: "var(--r-xl)",
          border: "1px solid var(--border)",
          boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{ borderBottom: "1px solid var(--border)", background: "var(--surface-1)" }}
        >
          <div>
            <h2 className="text-[15px] font-bold" style={{ color: "var(--text-primary)" }}>
              {isEdit ? "编辑提示词" : "新增提示词"}
            </h2>
            <p className="text-[12px] mt-0.5" style={{ color: "var(--text-tertiary)" }}>
              {isEdit ? "修改后保存，卡片信息自动同步" : "填写模板信息，创建后可随时编辑"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center cursor-pointer p-1.5 rounded-lg transition-colors"
            style={{ color: "var(--text-tertiary)" }}
            onMouseEnter={e => (e.currentTarget.style.color = "var(--text-primary)")}
            onMouseLeave={e => (e.currentTarget.style.color = "var(--text-tertiary)")}
          >
            <IconX size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          <div className="flex gap-4 p-5" style={{ alignItems: "flex-start" }}>

            {/* ── Left column ── */}
            <div className="flex flex-col gap-4" style={{ flex: "1 1 0", minWidth: 0 }}>

              {/* 基本信息 */}
              <Card title="基本信息">
                <div className="flex flex-col gap-3">
                  <div>
                    <label className="block text-[12px] font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                      标题 <span style={{ color: "var(--red)" }}>*</span>
                    </label>
                    <input
                      className={`input-base${errors.title ? " error" : ""}`}
                      value={title}
                      onChange={e => { setTitle(e.target.value); setErrors(p => ({ ...p, title: "" })); }}
                      placeholder="简洁明确，建议 30 字以内"
                    />
                    {errors.title && <p className="text-[11px] mt-1" style={{ color: "var(--red)" }}>{errors.title}</p>}
                  </div>
                  <div>
                    <label className="block text-[12px] font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>描述</label>
                    <textarea
                      className="input-base"
                      rows={3}
                      style={{ resize: "none" }}
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      placeholder="简要说明用途与适用场景，建议 1–3 行"
                    />
                  </div>
                </div>
              </Card>

              {/* 提示词正文 */}
              <Card title="提示词正文">
                <p className="text-[11px] mb-2.5" style={{ color: "var(--text-tertiary)" }}>
                  用 {"{{变量名}}"} 插入占位符，变量将在下方自动识别
                </p>
                <textarea
                  className={`input-base font-mono text-[13px] leading-relaxed${errors.content ? " error" : ""}`}
                  rows={8}
                  style={{ resize: "vertical", minHeight: 150 }}
                  value={content}
                  onChange={e => { setContent(e.target.value); setErrors(p => ({ ...p, content: "" })); }}
                  placeholder="在此输入提示词模板…"
                />
                {errors.content && <p className="text-[11px] mt-1" style={{ color: "var(--red)" }}>{errors.content}</p>}
                {varRows.length > 0 && (
                  <p className="text-[11px] mt-2" style={{ color: "var(--text-tertiary)" }}>
                    已识别到 <span style={{ color: "var(--blue)", fontWeight: 600 }}>{varRows.length}</span> 个变量占位符
                  </p>
                )}
              </Card>

              {/* 变量配置 */}
              {varRows.length > 0 && (
                <Card title={`变量配置 · ${varRows.length} 个`}>
                  <div className="rounded-lg overflow-hidden" style={{ border: "1px solid var(--border)" }}>
                    <div
                      className="grid gap-2 px-3 py-2 text-[10.5px] font-semibold uppercase tracking-wide"
                      style={{
                        gridTemplateColumns: "96px 1fr 106px 92px 64px",
                        background: "var(--surface-2)",
                        borderBottom: "1px solid var(--border)",
                        color: "var(--text-tertiary)",
                      }}
                    >
                      <span>变量名</span><span>说明 / 提示</span><span>类型</span><span>默认值</span>
                      <span className="text-center">必填</span>
                    </div>
                    {varRows.map((v, i) => (
                      <div
                        key={v.name}
                        className="grid gap-2 px-3 py-2.5 items-center"
                        style={{
                          gridTemplateColumns: "96px 1fr 106px 92px 64px",
                          borderBottom: i < varRows.length - 1 ? "1px solid var(--border)" : "none",
                        }}
                      >
                        <span
                          className="inline-block rounded px-2 py-0.5 text-[10.5px] font-semibold font-mono truncate"
                          style={{ background: "var(--amber-bg)", color: "var(--amber)", border: "1px solid rgba(217,119,6,0.2)" }}
                        >
                          {v.name}
                        </span>
                        <input
                          className="input-base text-[12px]"
                          style={{ padding: "6px 10px" }}
                          value={v.hint}
                          onChange={e => updateVar(i, "hint", e.target.value)}
                          placeholder="填写提示文字…"
                        />
                        <select
                          className="input-base text-[12px]"
                          style={{ padding: "6px 10px" }}
                          value={v.type}
                          onChange={e => updateVar(i, "type", e.target.value)}
                        >
                          {VAR_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                        </select>
                        <input
                          className="input-base text-[12px]"
                          style={{ padding: "6px 10px" }}
                          value={v.default_value}
                          onChange={e => updateVar(i, "default_value", e.target.value)}
                          placeholder="默认值…"
                        />
                        <button
                          onClick={() => updateVar(i, "required", !v.required)}
                          className="flex items-center justify-center w-full rounded-md text-[11px] font-semibold cursor-pointer transition-all"
                          style={{
                            height: 28,
                            border: v.required ? "1.5px solid var(--red)" : "1.5px solid var(--border-strong)",
                            background: v.required ? "rgba(220,38,38,0.08)" : "transparent",
                            color: v.required ? "var(--red)" : "var(--text-tertiary)",
                          }}
                          title="点击切换必填 / 选填"
                        >
                          {v.required ? "必填" : "选填"}
                        </button>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>

            {/* ── Right column ── */}
            <div className="flex flex-col gap-4" style={{ width: 224, flexShrink: 0 }}>

              {/* 分类 */}
              <Card title="分类" overflowVisible>
                <div ref={catRef} className="relative">
                  <button
                    type="button"
                    ref={catBtnRef}
                    onClick={() => {
                      if (catBtnRef.current) setCatRect(catBtnRef.current.getBoundingClientRect());
                      setCatOpen(v => !v);
                    }}
                    className={`input-base w-full flex items-center gap-2 text-left cursor-pointer${errors.category ? " error" : ""}`}
                  >
                    {(() => { const cat = categories.find(c => c.id === categoryId); if (!cat) return null; const I = getCategoryIcon(cat.icon); return <I size={13} sw={1.6} />; })()}
                    <span className="flex-1 text-[13px]">{categories.find(c => c.id === categoryId)?.name ?? "请选择分类"}</span>
                    <IconChevronDown size={12} sw={2} />
                  </button>
                  {catOpen && catRect && typeof document !== "undefined" && createPortal(
                    <div
                      ref={catDropdownRef}
                      className="rounded-lg overflow-hidden py-1"
                      style={{
                        position: "fixed",
                        top: catRect.bottom + 4,
                        left: catRect.left,
                        width: catRect.width,
                        zIndex: 99999,
                        background: "var(--surface-1)",
                        border: "1px solid var(--border)",
                        boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                      }}
                    >
                      {categories.map(c => {
                        const CatIcon = getCategoryIcon(c.icon);
                        const active = c.id === categoryId;
                        return (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => { setCategoryId(c.id); setCatOpen(false); setErrors(p => ({ ...p, category: "" })); }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-left transition-colors cursor-pointer"
                            style={{
                              background: active ? "var(--surface-2)" : "transparent",
                              color: active ? "var(--text-primary)" : "var(--text-secondary)",
                              fontWeight: active ? 600 : 400,
                            }}
                            onMouseEnter={e => { if (!active) e.currentTarget.style.background = "var(--surface-2)"; }}
                            onMouseLeave={e => { if (!active) e.currentTarget.style.background = active ? "var(--surface-2)" : "transparent"; }}
                          >
                            <CatIcon size={13} sw={1.6} />
                            {c.name}
                          </button>
                        );
                      })}
                    </div>,
                    document.body
                  )}
                </div>
                {errors.category && <p className="text-[11px] mt-1.5" style={{ color: "var(--red)" }}>{errors.category}</p>}
              </Card>

              {/* 适用平台 */}
              <Card title="适用平台">
                <div className="flex flex-col gap-2">
                  {allPlatforms.map(p => {
                    const on = platIds.includes(p.id);
                    return (
                      <button
                        key={p.id}
                        onClick={() => togglePlat(p.id)}
                        className="w-full flex items-center gap-2 text-[13px] px-3 py-2 rounded-lg cursor-pointer transition-all font-medium text-left"
                        style={{
                          border: `1.5px solid ${on ? "var(--text-primary)" : "var(--border)"}`,
                          background: on ? "var(--surface-2)" : "var(--surface-1)",
                          color: on ? "var(--text-primary)" : "var(--text-secondary)",
                        }}
                        onMouseEnter={e => { if (!on) e.currentTarget.style.background = "var(--surface-2)"; }}
                        onMouseLeave={e => { if (!on) e.currentTarget.style.background = "var(--surface-1)"; }}
                      >
                        {(() => { const Logo = getPlatformLogo(p.slug); return Logo ? <Logo size={15} /> : null; })()}
                        <span className="flex-1">{p.name}</span>
                        {on && <IconCheck size={12} sw={2.5} />}
                      </button>
                    );
                  })}
                  {allPlatforms.length === 0 && (
                    <p className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>暂无可用平台</p>
                  )}
                </div>
              </Card>

            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex-shrink-0 flex items-center justify-between px-6 py-4"
          style={{ borderTop: "1px solid var(--border)", background: "var(--surface-1)" }}
        >
          <div className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>
            {isEdit && prompt?.updated_at
              ? `上次修改：${new Date(prompt.updated_at).toLocaleString("zh-CN")}`
              : " "}
            {errors.submit && <span style={{ color: "var(--red)" }}>{errors.submit}</span>}
          </div>
          <div className="flex gap-2.5">
            <button onClick={onClose} className="btn-ghost">取消</button>
            <button onClick={handleSave} disabled={saving} className="btn-primary">
              {saving ? "保存中…" : isEdit ? "保存更新" : "创建提示词"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

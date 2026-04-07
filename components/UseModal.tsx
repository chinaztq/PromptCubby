"use client";
import { useState, useEffect } from "react";
import { Prompt, Platform, Variable } from "@/types";
import PlatformBadge from "./PlatformBadge";
import { IconX, IconCheck, IconCheckCircle, IconLink, IconClipboard, getCategoryIcon, getPlatformLogo } from "./icons";

interface Props {
  prompt: Prompt & { platforms: Platform[]; variables: Variable[] };
  onClose: () => void;
}

function PreviewContent({ content, values }: { content: string; values: Record<string, string> }) {
  const parts = content.split(/(\{\{[^}]+\}\})/g);
  return (
    <>
      {parts.map((part, i) => {
        const m = part.match(/^\{\{(.+?)\}\}$/);
        if (m) {
          const val = values[m[1]];
          return <span key={i} className={`var-chip ${val ? "filled" : ""}`}>{val || part}</span>;
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

function Card({ title, children, noPad }: { title: string; children: React.ReactNode; noPad?: boolean }) {
  return (
    <div className="rounded-xl overflow-hidden" style={{ background: "var(--surface-1)", border: "1px solid var(--border)" }}>
      <div className="px-4 py-3" style={{ borderBottom: "1px solid var(--border)", background: "var(--surface-2)" }}>
        <span className="text-[12px] font-semibold" style={{ color: "var(--text-primary)" }}>{title}</span>
      </div>
      <div className={noPad ? "" : "p-4"}>{children}</div>
    </div>
  );
}

export default function UseModal({ prompt, onClose }: Props) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [platform, setPlatform] = useState<Platform | null>(prompt.platforms[0] ?? null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    const init: Record<string, string> = {};
    prompt.variables.forEach(v => {
      init[v.name] = sessionStorage.getItem(`pcv_${prompt.id}_${v.name}`) ?? v.default_value ?? "";
    });
    setValues(init);
  }, [prompt]);

  useEffect(() => {
    if (countdown === null || countdown <= 0) {
      if (countdown === 0 && platform) {
        window.open(platform.url_template ?? "#", "_blank");
        setCountdown(null);
      }
      return;
    }
    const t = setTimeout(() => setCountdown(c => (c !== null ? c - 1 : null)), 1000);
    return () => clearTimeout(t);
  }, [countdown, platform]);

  function buildContent() {
    let s = prompt.content;
    Object.entries(values).forEach(([k, v]) => { s = s.replaceAll(`{{${k}}}`, v); });
    return s;
  }

  function validate() {
    const e: Record<string, string> = {};
    prompt.variables.forEach(v => { if (v.required && !values[v.name]?.trim()) e[v.name] = "必填"; });
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmitWithPlatform(p: Platform) {
    if (!validate()) return;
    setPlatform(p);
    const content = buildContent();
    Object.entries(values).forEach(([k, v]) =>
      sessionStorage.setItem(`pcv_${prompt.id}_${k}`, v));

    if (p.delivery_method === "url_scheme") {
      const url = (p.url_template ?? "").replace("{prompt}", encodeURIComponent(content));
      window.open(url, "_blank");
    } else {
      try { await navigator.clipboard.writeText(content); }
      catch {
        const ta = Object.assign(document.createElement("textarea"), { value: content });
        document.body.appendChild(ta); ta.select(); document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setCountdown(3);
    }
  }

  function setValue(name: string, val: string) {
    setValues(prev => ({ ...prev, [name]: val }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  }

  function renderInput(v: Variable) {
    const val = values[v.name] ?? "";
    const err = !!errors[v.name];
    const cls = `input-base${err ? " error" : ""}`;
    if (v.type === "textarea") return (
      <textarea className={cls} style={{ minHeight: 72, resize: "vertical" }}
        value={val} onChange={e => setValue(v.name, e.target.value)} placeholder={v.hint} />
    );
    if (v.type === "select") {
      const opts: string[] = v.options ? JSON.parse(v.options) : [];
      if (opts.length) return (
        <select className={cls} value={val} onChange={e => setValue(v.name, e.target.value)}>
          <option value="">请选择…</option>
          {opts.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      );
    }
    if (v.type === "number") return (
      <input type="number" className={cls} value={val}
        onChange={e => setValue(v.name, e.target.value)} placeholder={v.hint} />
    );
    if (v.type === "date") return (
      <input type="date" className={cls} value={val}
        onChange={e => setValue(v.name, e.target.value)} />
    );
    return (
      <input type="text" className={cls} value={val}
        onChange={e => setValue(v.name, e.target.value)} placeholder={v.hint} />
    );
  }

  const isCounting = countdown !== null && countdown > 0;
  const CatIcon = getCategoryIcon(prompt.category_icon);

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
          className="flex items-start justify-between px-6 py-4 flex-shrink-0"
          style={{ borderBottom: "1px solid var(--border)", background: "var(--surface-1)" }}
        >
          <div className="flex flex-col gap-2">
            <h2 className="text-[16px] font-bold" style={{ color: "var(--text-primary)" }}>
              {prompt.title}
            </h2>
            <div className="flex gap-1.5 flex-wrap">
              {prompt.category_name && (
                <span
                  className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md font-medium"
                  style={{ background: "var(--surface-2)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}
                >
                  <CatIcon size={11} sw={1.8} />
                  {prompt.category_name}
                </span>
              )}
              {prompt.platforms.map(p => <PlatformBadge key={p.id} platform={p} />)}
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center cursor-pointer rounded-lg p-1.5 transition-colors"
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

            {/* ── Left: preview ── */}
            <div className="flex flex-col gap-4" style={{ flex: "1.2 1 0", minWidth: 0 }}>

              {prompt.description && (
                <Card title="描述">
                  <p className="text-[13px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                    {prompt.description}
                  </p>
                </Card>
              )}

              <Card title="提示词预览" noPad>
                <div
                  className="p-4 text-[13px] leading-relaxed whitespace-pre-wrap"
                  style={{ color: "var(--text-secondary)", fontFamily: "inherit" }}
                >
                  <PreviewContent content={prompt.content} values={values} />
                </div>
              </Card>

            </div>

            {/* ── Right: variables + platform ── */}
            <div className="flex flex-col gap-4" style={{ width: 260, flexShrink: 0 }}>

              {/* Variables */}
              <Card title={prompt.variables.length > 0 ? `填写变量 · ${prompt.variables.length} 个` : "变量"}>
                {prompt.variables.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 py-4 text-center">
                    <span style={{ color: "var(--green)" }}>
                      <IconCheckCircle size={28} sw={1.4} />
                    </span>
                    <p className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>此提示词无需填写变量</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {prompt.variables.map(v => (
                      <div key={v.id} className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[12.5px] font-semibold" style={{ color: "var(--text-primary)" }}>{v.name}</span>
                          {!!v.required && <span className="text-[10px]" style={{ color: "var(--red)" }}>必填</span>}
                        </div>
                        {v.hint && <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>{v.hint}</p>}
                        {renderInput(v)}
                        {errors[v.name] && <p className="text-[11px]" style={{ color: "var(--red)" }}>{errors[v.name]}</p>}
                      </div>
                    ))}
                    <p className="text-[11px] pt-1" style={{ color: "var(--text-tertiary)", borderTop: "1px dashed var(--border)" }}>
                      变量将实时替换左侧预览
                    </p>
                  </div>
                )}
              </Card>

            </div>
          </div>

          {/* ── Platform grid ── */}
          {prompt.platforms.length > 0 && (
            <div className="px-5 pb-5">
              <div
                className="rounded-xl overflow-hidden"
                style={{ background: "var(--surface-1)", border: "1px solid var(--border)" }}
              >
                <div className="px-4 py-3" style={{ borderBottom: "1px solid var(--border)", background: "var(--surface-2)" }}>
                  <span className="text-[12px] font-semibold" style={{ color: "var(--text-primary)" }}>去使用这个提示词</span>
                </div>
                <div className="p-5 flex gap-5 flex-wrap justify-center">
                  {prompt.platforms.map(p => (
                    <button
                      key={p.id}
                      onClick={() => handleSubmitWithPlatform(p)}
                      disabled={isCounting}
                      className="flex flex-col items-center gap-2 cursor-pointer group"
                      style={{ background: "none", border: "none", padding: 0 }}
                    >
                      <div
                        className="w-14 h-14 rounded-full flex items-center justify-center transition-transform group-hover:scale-110"
                        style={{ background: p.bg_color || "#f0f0f0" }}
                      >
                        {(() => { const L = getPlatformLogo(p.slug); return L ? <L size={28} /> : <span className="text-[14px] font-bold">{p.name.slice(0, 2)}</span>; })()}
                      </div>
                      <span className="text-[12px] font-medium" style={{ color: "var(--text-secondary)" }}>{p.name}</span>
                      <span
                        className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-md"
                        style={{
                          background: p.delivery_method === "url_scheme" ? "rgba(22,163,74,0.08)" : "rgba(217,119,6,0.08)",
                          color: p.delivery_method === "url_scheme" ? "var(--green)" : "var(--amber)",
                        }}
                      >
                        {p.delivery_method === "url_scheme"
                          ? <><IconLink size={10} /> 自动填入</>
                          : <><IconClipboard size={10} /> 复制粘贴</>
                        }
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {isCounting && (
          <div
            className="flex-shrink-0 px-6 py-4"
            style={{ borderTop: "1px solid var(--border)", background: "var(--surface-1)" }}
          >
            <div
              className="flex items-center gap-2 text-[12.5px] px-3.5 py-2.5 rounded-lg"
              style={{ background: "var(--green-bg)", color: "var(--green)", border: "1px solid rgba(22,163,74,0.2)" }}
            >
              <IconCheck size={14} sw={2.5} />
              <span>已复制到剪贴板，<strong>{countdown}s</strong> 后跳转 · 在新页面直接粘贴即可</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

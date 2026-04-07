---
name: PromptCubby Project
description: Core facts about the PromptCubby prompt management system project built from scratch
type: project
---

PromptCubby is a full-stack AI prompt management web app built with Next.js 15 + SQLite (better-sqlite3).

**Why:** User provided a detailed HTML design doc (提示词管理系统_页面规划与设计文档.html) and requested the full project be scaffolded.

**How to apply:** When working on this project, refer to the design doc for UI decisions, and the existing codebase structure below.

## Structure
- `app/page.tsx` — Main page: sidebar + topbar + card grid, all state managed here
- `app/layout.tsx` — Root layout with Google Fonts (Noto Sans SC, Inter, JetBrains Mono)
- `app/globals.css` — CSS variables, platform badge classes, modal overlay, animations
- `app/api/prompts/route.ts` — GET (list+search+filter) / POST (create)
- `app/api/prompts/[id]/route.ts` — GET / PUT / DELETE for single prompt (async params for Next.js 15)
- `app/api/categories/route.ts` — GET / POST categories
- `app/api/platforms/route.ts` — GET platforms
- `lib/db.ts` — SQLite singleton via better-sqlite3, auto-creates schema + seeds 6 prompts on first run
- `types/index.ts` — TypeScript interfaces: Category, Platform, Variable, Prompt, PromptWithDetails
- `components/PromptCard.tsx` — Card with title, description, platform badges, use/edit buttons
- `components/PlatformBadge.tsx` — Colored badge per platform slug (chatgpt/claude/gemini/wenxin)
- `components/UseModal.tsx` — Use prompt modal: left preview panel (live var substitution) + right variable form + platform selector + clipboard/URL delivery
- `components/EditModal.tsx` — Edit/Create modal: basic info + prompt body (auto-detects {{var}} syntax) + variable config table

## DB Schema
- categories (id, name, emoji, sort_order, created_at)
- platforms (id, name, slug, delivery_method, url_template, color, bg_color)
- prompts (id, title, description, content, category_id, created_at, updated_at)
- prompt_platforms (prompt_id, platform_id)
- variables (id, prompt_id, name, hint, type, options, default_value, required, sort_order)

## Platform delivery
- Claude: url_scheme → opens claude.ai/new?q={encodeURIComponent(content)}
- Others (ChatGPT, Gemini, 文心): clipboard → copies text + 3s countdown + opens platform URL

## Run
npm run dev → http://localhost:3000

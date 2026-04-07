"use client";

type P = { size?: number; sw?: number; className?: string };

function svg(size: number, sw: number, children: React.ReactNode, extra?: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24"
      fill="none" stroke="currentColor"
      strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"
      {...extra}
    >{children}</svg>
  );
}

/* ─── Navigation / Category icons ─── */
export function IconAll({ size = 16, sw = 1.6 }: P) {
  return svg(size, sw, <>
    <rect x="3" y="3" width="7" height="7" rx="1"/>
    <rect x="14" y="3" width="7" height="7" rx="1"/>
    <rect x="3" y="14" width="7" height="7" rx="1"/>
    <rect x="14" y="14" width="7" height="7" rx="1"/>
  </>);
}
export function IconEdit({ size = 16, sw = 1.6 }: P) {
  return svg(size, sw, <>
    <path d="M12 20h9"/>
    <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
  </>);
}
export function IconChart({ size = 16, sw = 1.6 }: P) {
  return svg(size, sw, <>
    <line x1="18" y1="20" x2="18" y2="10"/>
    <line x1="12" y1="20" x2="12" y2="4"/>
    <line x1="6" y1="20" x2="6" y2="14"/>
    <line x1="2" y1="20" x2="22" y2="20"/>
  </>);
}
export function IconGlobe({ size = 16, sw = 1.6 }: P) {
  return svg(size, sw, <>
    <circle cx="12" cy="12" r="10"/>
    <line x1="2" y1="12" x2="22" y2="12"/>
    <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
  </>);
}
export function IconCode({ size = 16, sw = 1.6 }: P) {
  return svg(size, sw, <>
    <polyline points="16 18 22 12 16 6"/>
    <polyline points="8 6 2 12 8 18"/>
  </>);
}
export function IconSpeaker({ size = 16, sw = 1.6 }: P) {
  return svg(size, sw, <>
    <path d="M11 5L6 9H2v6h4l5 4V5z"/>
    <path d="M19.07 4.93a10 10 0 010 14.14"/>
    <path d="M15.54 8.46a5 5 0 010 7.07"/>
  </>);
}
export function IconHeadphones({ size = 16, sw = 1.6 }: P) {
  return svg(size, sw, <>
    <path d="M3 18v-6a9 9 0 0118 0v6"/>
    <path d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3z"/>
    <path d="M3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z"/>
  </>);
}
export function IconFile({ size = 16, sw = 1.6 }: P) {
  return svg(size, sw, <>
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
  </>);
}
export function IconBox({ size = 16, sw = 1.7 }: P) {
  return svg(size, sw, <>
    <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
    <line x1="12" y1="22.08" x2="12" y2="12"/>
  </>);
}

/* ─── UI action icons ─── */
export function IconX({ size = 16, sw = 2 }: P) {
  return svg(size, sw, <>
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </>);
}
export function IconPlus({ size = 16, sw = 2 }: P) {
  return svg(size, sw, <>
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </>);
}
export function IconCheck({ size = 16, sw = 2.2 }: P) {
  return svg(size, sw, <polyline points="20 6 9 17 4 12"/>);
}
export function IconCheckCircle({ size = 28, sw = 1.5 }: P) {
  return svg(size, sw, <>
    <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </>);
}
export function IconLink({ size = 13, sw = 2 }: P) {
  return svg(size, sw, <>
    <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
    <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
  </>);
}
export function IconClipboard({ size = 13, sw = 2 }: P) {
  return svg(size, sw, <>
    <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/>
    <rect x="8" y="2" width="8" height="4" rx="1"/>
  </>);
}

/* ─── Toggle icons (required / optional) ─── */
export function IconToggleOn({ size = 20, sw = 1.8 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="6" width="22" height="12" rx="6"/>
      <circle cx="16" cy="12" r="4" fill="currentColor" stroke="none"/>
    </svg>
  );
}
export function IconToggleOff({ size = 20, sw = 1.8 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="6" width="22" height="12" rx="6"/>
      <circle cx="8" cy="12" r="4" fill="currentColor" stroke="none"/>
    </svg>
  );
}

/* ─── Search icon ─── */
export function IconSearch({ size = 16, sw = 2 }: P) {
  return svg(size, sw, <>
    <circle cx="11" cy="11" r="8"/>
    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </>);
}
export function IconChevronDown({ size = 16, sw = 2 }: P) {
  return svg(size, sw, <polyline points="6 9 12 15 18 9"/>);
}

/* ═══════════════════════════════════════════════
   Category icon registry — single source of truth
   ═══════════════════════════════════════════════ */

/** Map of icon name (stored in DB) → component */
export const CATEGORY_ICON_MAP: Record<string, React.ComponentType<P>> = {
  all:        IconAll,
  edit:       IconEdit,
  chart:      IconChart,
  globe:      IconGlobe,
  code:       IconCode,
  speaker:    IconSpeaker,
  headphones: IconHeadphones,
  file:       IconFile,
  box:        IconBox,
};

/** Resolve an icon name (from DB) to its component. Falls back to IconFile. */
export function getCategoryIcon(icon?: string): React.ComponentType<P> {
  return CATEGORY_ICON_MAP[icon ?? ''] ?? IconFile;
}

/* ═══════════════════════════════════════════════
   Platform brand logos
   ═══════════════════════════════════════════════ */

type LP = { size?: number };

/** ChatGPT / OpenAI — lobehub official icon */
export function LogoChatGPT({ size = 28 }: LP) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" fillRule="evenodd">
      <path d="M9.205 8.658v-2.26c0-.19.072-.333.238-.428l4.543-2.616c.619-.357 1.356-.523 2.117-.523 2.854 0 4.662 2.212 4.662 4.566 0 .167 0 .357-.024.547l-4.71-2.759a.797.797 0 00-.856 0l-5.97 3.473zm10.609 8.8V12.06c0-.333-.143-.57-.429-.737l-5.97-3.473 1.95-1.118a.433.433 0 01.476 0l4.543 2.617c1.309.76 2.189 2.378 2.189 3.948 0 1.808-1.07 3.473-2.76 4.163zM7.802 12.703l-1.95-1.142c-.167-.095-.239-.238-.239-.428V5.899c0-2.545 1.95-4.472 4.591-4.472 1 0 1.927.333 2.712.928L8.23 5.067c-.285.166-.428.404-.428.737v6.898zM12 15.128l-2.795-1.57v-3.33L12 8.658l2.795 1.57v3.33L12 15.128zm1.796 7.23c-1 0-1.927-.332-2.712-.927l4.686-2.712c.285-.166.428-.404.428-.737v-6.898l1.974 1.142c.167.095.238.238.238.428v5.233c0 2.545-1.974 4.472-4.614 4.472zm-5.637-5.303l-4.544-2.617c-1.308-.761-2.188-2.378-2.188-3.948A4.482 4.482 0 014.21 6.327v5.423c0 .333.143.571.428.738l5.947 3.449-1.95 1.118a.432.432 0 01-.476 0zm-.262 3.9c-2.688 0-4.662-2.021-4.662-4.519 0-.19.024-.38.047-.57l4.686 2.71c.286.167.571.167.856 0l5.97-3.448v2.26c0 .19-.07.333-.237.428l-4.543 2.616c-.619.357-1.356.523-2.117.523zm5.899 2.83a5.947 5.947 0 005.827-4.756C22.287 18.339 24 15.84 24 13.296c0-1.665-.713-3.282-1.998-4.448.119-.5.19-.999.19-1.498 0-3.401-2.759-5.947-5.946-5.947-.642 0-1.26.095-1.88.31A5.962 5.962 0 0010.205 0a5.947 5.947 0 00-5.827 4.757C1.713 5.447 0 7.945 0 10.49c0 1.666.713 3.283 1.998 4.448-.119.5-.19 1-.19 1.499 0 3.401 2.759 5.946 5.946 5.946.642 0 1.26-.095 1.88-.309a5.96 5.96 0 004.162 1.713z"/>
    </svg>
  );
}

/** Claude / Anthropic — lobehub official icon */
export function LogoClaude({ size = 28 }: LP) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" fillRule="evenodd">
      <path d="M4.709 15.955l4.72-2.647.08-.23-.08-.128H9.2l-.79-.048-2.698-.073-2.339-.097-2.266-.122-.571-.121L0 11.784l.055-.352.48-.321.686.06 1.52.103 2.278.158 1.652.097 2.449.255h.389l.055-.157-.134-.098-.103-.097-2.358-1.596-2.552-1.688-1.336-.972-.724-.491-.364-.462-.158-1.008.656-.722.881.06.225.061.893.686 1.908 1.476 2.491 1.833.365.304.145-.103.019-.073-.164-.274-1.355-2.446-1.446-2.49-.644-1.032-.17-.619a2.97 2.97 0 01-.104-.729L6.283.134 6.696 0l.996.134.42.364.62 1.414 1.002 2.229 1.555 3.03.456.898.243.832.091.255h.158V9.01l.128-1.706.237-2.095.23-2.695.08-.76.376-.91.747-.492.584.28.48.685-.067.444-.286 1.851-.559 2.903-.364 1.942h.212l.243-.242.985-1.306 1.652-2.064.73-.82.85-.904.547-.431h1.033l.76 1.129-.34 1.166-1.064 1.347-.881 1.142-1.264 1.7-.79 1.36.073.11.188-.02 2.856-.606 1.543-.28 1.841-.315.833.388.091.395-.328.807-1.969.486-2.309.462-3.439.813-.042.03.049.061 1.549.146.662.036h1.622l3.02.225.79.522.474.638-.079.485-1.215.62-1.64-.389-3.829-.91-1.312-.329h-.182v.11l1.093 1.068 2.006 1.81 2.509 2.33.127.578-.322.455-.34-.049-2.205-1.657-.851-.747-1.926-1.62h-.128v.17l.444.649 2.345 3.521.122 1.08-.17.353-.608.213-.668-.122-1.374-1.925-1.415-2.167-1.143-1.943-.14.08-.674 7.254-.316.37-.729.28-.607-.461-.322-.747.322-1.476.389-1.924.315-1.53.286-1.9.17-.632-.012-.042-.14.018-1.434 1.967-2.18 2.945-1.726 1.845-.414.164-.717-.37.067-.662.401-.589 2.388-3.036 1.44-1.882.93-1.086-.006-.158h-.055L4.132 18.56l-1.13.146-.487-.456.061-.746.231-.243 1.908-1.312-.006.006z"/>
    </svg>
  );
}

/** Google Gemini — lobehub official icon */
export function LogoGemini({ size = 28 }: LP) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" fillRule="evenodd">
      <path d="M20.616 10.835a14.147 14.147 0 01-4.45-3.001 14.111 14.111 0 01-3.678-6.452.503.503 0 00-.975 0 14.134 14.134 0 01-3.679 6.452 14.155 14.155 0 01-4.45 3.001c-.65.28-1.318.505-2.002.678a.502.502 0 000 .975c.684.172 1.35.397 2.002.677a14.147 14.147 0 014.45 3.001 14.112 14.112 0 013.679 6.453.502.502 0 00.975 0c.172-.685.397-1.351.677-2.003a14.145 14.145 0 013.001-4.45 14.113 14.113 0 016.453-3.678.503.503 0 000-.975 13.245 13.245 0 01-2.003-.678z"/>
    </svg>
  );
}


/** Perplexity — lobehub official icon */
export function LogoPerplexity({ size = 28 }: LP) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" fillRule="evenodd">
      <path d="M19.785 0v7.272H22.5V17.62h-2.935V24l-7.037-6.194v6.145h-1.091v-6.152L4.392 24v-6.465H1.5V7.188h2.884V0l7.053 6.494V.19h1.09v6.49L19.786 0zm-7.257 9.044v7.319l5.946 5.234V14.44l-5.946-5.397zm-1.099-.08l-5.946 5.398v7.235l5.946-5.234V8.965zm8.136 7.58h1.844V8.349H13.46l6.105 5.54v2.655zm-8.982-8.28H2.59v8.195h1.8v-2.576l6.192-5.62zM5.475 2.476v4.71h5.115l-5.115-4.71zm13.219 0l-5.115 4.71h5.115v-4.71z"/>
    </svg>
  );
}

/** Comet (CometAPI) — lobehub official icon */
export function LogoComet({ size = 28 }: LP) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" fillRule="evenodd">
      <path d="M7.754 3.248C9.483.97 12.144-.223 14.99.035c4.67.422 8.023 4.694 7.27 9.384-.266 1.667-1 3.125-2.203 4.374-.468.487-1.025.9-1.662 1.422-2.554 2.09-6.026 4.854-10.413 8.294-.224.176-.669.495-.94.49a.19.19 0 01-.137-.06.192.192 0 01-.05-.14c.01-.207.077-.473.202-.8.04-.108.44-.956 1.197-2.545a1.99 1.99 0 00.179-.577.143.143 0 00-.007-.068.142.142 0 00-.098-.09.144.144 0 00-.07 0 1.479 1.479 0 00-.505.237c-.414.288-.86.648-1.337 1.078-.506.453-1.137 1.025-1.895 1.716a8.873 8.873 0 01-1.252.977.155.155 0 01-.064.021.152.152 0 01-.123-.04.154.154 0 01-.037-.055c-.027-.067-.024-.165.01-.292.113-.423.283-.902.511-1.437.17-.396.52-1.206 1.051-2.428.17-.39.697-1.592.61-1.897a.167.167 0 00-.102-.111.166.166 0 00-.15.018c-.284.194-.593.485-.93.87-.782.895-1.569 1.78-2.358 2.657-.248.274-.477.388-.687.343v-.238c.058-.215.104-.438.178-.642C4.075 12.378 5.938 7.2 6.764 4.964c.198-.537.529-1.11.99-1.716zm6.49-1.771a6.641 6.641 0 100 13.283 6.641 6.641 0 000-13.283z"/>
      <path d="M14.244 3.104a5.017 5.017 0 11-.002 10.033 5.017 5.017 0 01.002-10.033zm2.049 1.695a3.087 3.087 0 00-4.363 1.187 1.583 1.583 0 00-.165.442c-.015.067-.027.13-.033.194a1.308 1.308 0 00.078.56c.025.07.056.137.091.203.287.529.884.944 1.43 1.288.135.086.269.167.393.245l.392.246c.343.212.72.43 1.102.568.305.112.613.173.908.142a1.34 1.34 0 00.535-.178c.103-.061.202-.14.298-.237.064-.065.127-.137.186-.22a3.133 3.133 0 00.445-.868 3.08 3.08 0 00.056-1.71A3.063 3.063 0 0016.293 4.8z"/>
    </svg>
  );
}

/** Grok (xAI) — lobehub official icon */
export function LogoGrok({ size = 28 }: LP) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" fillRule="evenodd">
      <path d="M9.27 15.29l7.978-5.897c.391-.29.95-.177 1.137.272.98 2.369.542 5.215-1.41 7.169-1.951 1.954-4.667 2.382-7.149 1.406l-2.711 1.257c3.889 2.661 8.611 2.003 11.562-.953 2.341-2.344 3.066-5.539 2.388-8.42l.006.007c-.983-4.232.242-5.924 2.75-9.383.06-.082.12-.164.179-.248l-3.301 3.305v-.01L9.267 15.292M7.623 16.723c-2.792-2.67-2.31-6.801.071-9.184 1.761-1.763 4.647-2.483 7.166-1.425l2.705-1.25a7.808 7.808 0 00-1.829-1A8.975 8.975 0 005.984 5.83c-2.533 2.536-3.33 6.436-1.962 9.764 1.022 2.487-.653 4.246-2.34 6.022-.599.63-1.199 1.259-1.682 1.925l7.62-6.815"/>
    </svg>
  );
}

/** Resolve a platform slug to its logo component. Falls back to null. */
export const PLATFORM_LOGO_MAP: Record<string, React.ComponentType<LP>> = {
  chatgpt:    LogoChatGPT,
  claude:     LogoClaude,
  gemini:     LogoGemini,
  perplexity: LogoPerplexity,
  comet:      LogoComet,
  grok:       LogoGrok,
};

export function getPlatformLogo(slug: string): React.ComponentType<LP> | null {
  return PLATFORM_LOGO_MAP[slug] ?? null;
}

/** Available icon options for the category create/edit UI */
export const ICON_OPTIONS: { value: string; label: string }[] = [
  { value: 'edit',       label: '文案' },
  { value: 'chart',      label: '分析' },
  { value: 'globe',      label: '翻译' },
  { value: 'code',       label: '编程' },
  { value: 'speaker',    label: '营销' },
  { value: 'headphones', label: '客服' },
  { value: 'file',       label: '通用' },
  { value: 'box',        label: '其他' },
];

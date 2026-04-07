"use client";
interface Props {
  name: string;
  value?: string;
}
export default function VariableChip({ name, value }: Props) {
  const filled = value && value.trim().length > 0;
  return (
    <span className={`var-chip ${filled ? "filled" : ""}`}>
      {filled ? value : `{{${name}}}`}
    </span>
  );
}

// components/CopyButton.tsx
import * as React from "react";
import { Copy, Check } from "lucide-react";

type Props = {
  value: string;
  className?: string;
  ariaLabel?: string;
};

export function CopyButton({ value, className, ariaLabel = "Скопировать" }: Props) {
  const [copied, setCopied] = React.useState(false);

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      const t = setTimeout(() => setCopied(false), 1200);
      return () => clearTimeout(t);
    } catch (e) {
      console.error("Не удалось скопировать:", e);
    }
  }

  return (
    <button
      type="button"
      onClick={onCopy}
      aria-label={ariaLabel}
      title={copied ? "Скопировано!" : ariaLabel}
      className={["inline-flex items-center rounded-md px-1.5 py-1 text-xs border border-border/40 hover:bg-accent/40 transition", className].join(" ")}
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}

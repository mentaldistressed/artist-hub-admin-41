// components/CopyableLine.tsx
import * as React from "react";
import { CopyButton } from "./CopyButton";

type Props = {
  label?: string;
  value: string | number;
  mono?: boolean;
  // Если хочешь, чтобы копировалось по клику на весь текст:
  clickableWhole?: boolean;
};

export function CopyableLine({ label, value, mono, clickableWhole }: Props) {
  const str = String(value);

  const content = (
    <div className="flex items-center gap-1.5">
      {label && <span className="text-muted-foreground">{label}:</span>}
      <span
        className={["truncate", mono ? "font-mono" : ""].join(" ")}
        {...(clickableWhole
          ? {
              title: "Нажмите, чтобы скопировать",
              role: "button",
              tabIndex: 0,
              onClick: async () => await navigator.clipboard.writeText(str),
              onKeyDown: async (e: React.KeyboardEvent) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  await navigator.clipboard.writeText(str);
                }
              },
              className:
                "truncate cursor-pointer underline decoration-dotted underline-offset-2 " +
                (mono ? "font-mono" : ""),
            }
          : {})}
      >
        {str}
      </span>
      <CopyButton value={str} ariaLabel={`Скопировать ${label ?? "значение"}`} />
    </div>
  );

  return content;
}

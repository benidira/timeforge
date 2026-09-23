"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* permission denied or insecure context: try the fallback below */
  }
  try {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    const done = document.execCommand("copy");
    document.body.removeChild(area);
    return done;
  } catch {
    return false;
  }
}

interface CopyButtonProps {
  value: string;
  /** What is being copied, e.g. "UTC". Used for the accessible name and announcements. */
  label: string;
  children?: ReactNode;
  className?: string;
  disabled?: boolean;
}

export function CopyButton({
  value,
  label,
  children = "Copy",
  className = "btn btn-secondary btn-sm",
  disabled = false,
}: CopyButtonProps) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  async function handleClick() {
    const done = await copyToClipboard(value);
    setState(done ? "copied" : "failed");
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setState("idle"), 1800);
  }

  return (
    <>
      <button type="button" className={className} onClick={handleClick} disabled={disabled} aria-label={`Copy ${label}`}>
        {state === "copied" ? "Copied" : state === "failed" ? "Copy failed" : children}
      </button>
      <span role="status" aria-live="polite" className="sr-only">
        {state === "copied" ? `${label} copied to clipboard` : state === "failed" ? `Could not copy ${label}` : ""}
      </span>
    </>
  );
}

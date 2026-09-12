import type { ReactNode } from "react";
import type { Root } from "react-dom/client";
import { injectAfter, injectBefore, waitForElement } from "../utils/dom";

interface MountControlOptions {
  buttonSelector: string;
  enabled: boolean;
  name: string;
  node: ReactNode;
  position: "after" | "before";
  targetSelector: string;
}

export async function mountControl({
  buttonSelector,
  enabled,
  name,
  node,
  position,
  targetSelector,
}: MountControlOptions): Promise<Root | null> {
  if (!enabled || document.querySelector(buttonSelector)) return null;

  const target = await waitForElement<HTMLElement>(targetSelector);
  if (!target) {
    console.warn(`[TVING KBO PLUS] ${name} 버튼을 추가할 위치를 찾지 못했습니다.`);
    return null;
  }

  return position === "before"
    ? injectBefore(node, target)
    : injectAfter(node, target);
}

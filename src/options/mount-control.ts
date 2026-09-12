import type { ReactNode } from "react";
import type { Root } from "react-dom/client";
import {
  injectAfter,
  injectBefore,
  type InjectedRoot,
  waitForElement,
} from "../utils/dom";

interface MountControlOptions {
  buttonSelector: string;
  enabled: boolean;
  name: string;
  node: ReactNode;
  position: "after" | "before";
  targetSelector: string;
}

const mountedControls = new Map<string, InjectedRoot>();
const mountGenerations = new Map<string, number>();

function nextGeneration(key: string): number {
  const generation = (mountGenerations.get(key) ?? 0) + 1;
  mountGenerations.set(key, generation);
  return generation;
}

function unmountControl(key: string): void {
  nextGeneration(key);
  const mounted = mountedControls.get(key);
  if (!mounted) return;

  mounted.root.unmount();
  mounted.container.remove();
  mountedControls.delete(key);
}

export function unmountAllControls(): void {
  const keys = new Set([
    ...mountedControls.keys(),
    ...mountGenerations.keys(),
  ]);
  for (const key of keys) unmountControl(key);
}

export async function mountControl({
  buttonSelector,
  enabled,
  name,
  node,
  position,
  targetSelector,
}: MountControlOptions): Promise<Root | null> {
  if (!enabled) {
    unmountControl(buttonSelector);
    return null;
  }

  const mounted = mountedControls.get(buttonSelector);
  if (mounted?.container.isConnected) return mounted.root;
  if (mounted) unmountControl(buttonSelector);
  if (document.querySelector(buttonSelector)) return null;

  const generation = nextGeneration(buttonSelector);

  const target = await waitForElement<HTMLElement>(targetSelector);
  if (generation !== mountGenerations.get(buttonSelector)) return null;
  if (!target) {
    console.warn(`[TVING KBO PLUS] ${name} 버튼을 추가할 위치를 찾지 못했습니다.`);
    return null;
  }

  const injected = position === "before"
    ? injectBefore(node, target)
    : injectAfter(node, target);
  mountedControls.set(buttonSelector, injected);
  return injected.root;
}

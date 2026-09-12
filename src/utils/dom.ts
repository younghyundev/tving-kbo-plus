import type { ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";

type SiblingPosition = "afterend" | "beforebegin";

export interface InjectedRoot {
  container: HTMLSpanElement;
  root: Root;
}

const pendingElementQueries = new WeakMap<
  object,
  Map<string, Promise<Element | null>>
>();

function injectSibling(
  node: ReactNode,
  target: HTMLElement,
  position: SiblingPosition,
): InjectedRoot {
  const container = document.createElement("span");
  container.className = "kbo-plus-control-slot";
  container.style.display = "contents";
  target.insertAdjacentElement(position, container);

  const root = createRoot(container);
  root.render(node);
  return { container, root };
}

export function injectAfter(
  node: ReactNode,
  target: HTMLElement,
): InjectedRoot {
  return injectSibling(node, target, "afterend");
}

export function injectBefore(
  node: ReactNode,
  target: HTMLElement,
): InjectedRoot {
  return injectSibling(node, target, "beforebegin");
}

export function waitForElement<T extends Element = HTMLElement>(
  selector: string,
  timeout = 5000,
  root: ParentNode = document,
): Promise<T | null> {
  const existingElement = root.querySelector<T>(selector);
  if (existingElement) return Promise.resolve(existingElement);

  let rootQueries = pendingElementQueries.get(root);
  if (!rootQueries) {
    rootQueries = new Map();
    pendingElementQueries.set(root, rootQueries);
  }
  const queryKey = `${selector}\u0000${timeout}`;
  const pendingQuery = rootQueries.get(queryKey);
  if (pendingQuery) return pendingQuery as Promise<T | null>;

  const query = new Promise<T | null>((resolve) => {
    const observedNode = root instanceof Document ? root.documentElement : root;
    if (!observedNode) {
      resolve(null);
      return;
    }

    let settled = false;
    let timeoutId = 0;
    const observer = new MutationObserver(() => {
      const element = root.querySelector<T>(selector);
      if (element) finish(element);
    });
    const finish = (element: T | null) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeoutId);
      observer.disconnect();
      resolve(element);
    };

    timeoutId = window.setTimeout(() => finish(null), timeout);
    observer.observe(observedNode, {
      attributes: true,
      attributeFilter: ["aria-label", "class", "disabled", "id"],
      childList: true,
      subtree: true,
    });
  });

  rootQueries.set(queryKey, query);
  void query.then(() => {
    if (rootQueries.get(queryKey) === query) rootQueries.delete(queryKey);
  });
  return query;
}

export function setStyleElement(id: string, css: string, enabled = true): void {
  const existingStyle = document.getElementById(id);
  if (!enabled) {
    existingStyle?.remove();
    return;
  }
  if (existingStyle) return;

  const style = document.createElement("style");
  style.id = id;
  style.textContent = css;
  document.head.appendChild(style);
}

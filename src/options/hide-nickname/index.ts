import selectors from "../../constant/selectors";
import { setStyleElement } from "../../utils/dom";

const STYLE_ID = "kbo-plus-hide-nickname-style";
const UNKNOWN_BADGE_CLASS = "kbo-plus-unknown-badge";
const UNKNOWN_BADGE_SELECTOR = `.${UNKNOWN_BADGE_CLASS}`;

let observer: MutationObserver | null = null;
let observedRoot: Element | null = null;

function reconcileMessage(message: Element): void {
  const unknownBadge = message.querySelector(UNKNOWN_BADGE_SELECTOR);
  if (message.querySelector(selectors.CHAT_TEAM_BADGE)) {
    unknownBadge?.remove();
    return;
  }
  if (unknownBadge) return;

  const nickname = message.querySelector<HTMLElement>(selectors.CHAT_NICKNAME);
  if (!nickname) return;

  const isCurrentChat = message.matches(".group\\/message");
  const badge = document.createElement("span");
  badge.className = isCurrentChat
    ? `mr-[0.333rem] inline-flex items-center align-middle ${UNKNOWN_BADGE_CLASS}`
    : `ml-[0.333rem] inline-flex items-center align-middle ${UNKNOWN_BADGE_CLASS}`;
  badge.setAttribute("aria-label", "응원팀 없음");
  badge.title = "응원팀 없음";

  const icon = document.createElement("span");
  icon.className = "kbo-plus-unknown-badge-icon";
  icon.textContent = "?";
  icon.setAttribute("aria-hidden", "true");
  badge.appendChild(icon);

  nickname.insertAdjacentElement(
    isCurrentChat ? "beforebegin" : "afterend",
    badge,
  );
}

function reconcileMessagesWithin(node: Element): void {
  if (node.matches(selectors.CHAT_MESSAGE)) reconcileMessage(node);
  node.querySelectorAll(selectors.CHAT_MESSAGE).forEach(reconcileMessage);
}

function getContainingMessage(node: Node): Element | null {
  if (!(node instanceof Element)) return null;
  return node.matches(selectors.CHAT_MESSAGE)
    ? node
    : node.closest(selectors.CHAT_MESSAGE);
}

function stopBadgeObserver(): void {
  observer?.disconnect();
  observer = null;
  observedRoot = null;
  document.querySelectorAll(UNKNOWN_BADGE_SELECTOR).forEach((badge) => {
    badge.remove();
  });
}

function startBadgeObserver(): void {
  const root =
    document.querySelector(selectors.SPORTS_GAME_ROOT) ?? document.body;
  if (!root) return;

  if (observer && observedRoot !== root) stopBadgeObserver();
  reconcileMessagesWithin(root);
  if (observer) return;

  observedRoot = root;
  observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      const containingMessage = getContainingMessage(mutation.target);
      if (containingMessage?.isConnected) reconcileMessage(containingMessage);

      for (const node of mutation.addedNodes) {
        if (node instanceof Element) reconcileMessagesWithin(node);
      }
    }
  });
  observer.observe(root, {
    attributes: true,
    attributeFilter: ["class", "src"],
    childList: true,
    subtree: true,
  });
}

export function hideNickname(enabled: boolean): void {
  setStyleElement(
    STYLE_ID,
    `
      .group\\/message > span.align-middle.text-gray-600,
      .group\\/message > span.ml-\\[0\\.17rem\\],
      .group\\/item > span.text-\\[\\#808080\\] {
        display: none !important;
      }

      .group\\/item > span.ml-\\[0\\.333rem\\] {
        margin-left: 0 !important;
      }

      .kbo-plus-unknown-badge-icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 1rem;
        height: 1rem;
        color: #808080;
        font-size: 10px;
        font-weight: 700;
        line-height: 1;
        background: #3a3a3a;
        border-radius: 30%;
      }
    `,
    enabled,
  );

  if (enabled) startBadgeObserver();
  else stopBadgeObserver();
}

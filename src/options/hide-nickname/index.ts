import selectors from "../../constant/selectors";

export function hideNickname(enabled: boolean) {
  if (!enabled) return;
  if (document.getElementById("kbo-plus-hide-nickname-style")) return;

  const style = document.createElement("style");
  style.id = "kbo-plus-hide-nickname-style";
  style.textContent = `
    .group\\/message > span.align-middle.text-gray-600,
    .group\\/message > span.ml-\\[0\\.17rem\\],
    .group\\/item > span.text-\\[\\#808080\\] {
      display: none !important;
    }
    .group\\/item > span.ml-\\[0\\.333rem\\] {
      margin-left: 0 !important;
    }
  `;
  document.head.appendChild(style);

  function addMissingBadge(item: Element) {
    if (item.querySelector(selectors.CHAT_TEAM_BADGE)) {
      item.querySelector(".kbo-plus-unknown-badge")?.remove();
      return;
    }
    if (item.querySelector(".kbo-plus-unknown-badge")) return;

    const nickname = item.querySelector<HTMLElement>(
      selectors.CHAT_NICKNAME,
    );
    if (!nickname) return;

    const badge = document.createElement("span");
    const isCurrentChat = item.matches(".group\\/message");
    badge.className = isCurrentChat
      ? "mr-[0.333rem] inline-flex items-center align-middle kbo-plus-unknown-badge"
      : "ml-[0.333rem] inline-flex items-center align-middle kbo-plus-unknown-badge";

    const icon = document.createElement("span");
    icon.textContent = "?";
    icon.style.cssText =
      "display:inline-flex;align-items:center;justify-content:center;width:1rem;height:1rem;font-size:10px;font-weight:bold;color:#808080;background:#3a3a3a;border-radius:30%;";

    badge.appendChild(icon);
    nickname.insertAdjacentElement(
      isCurrentChat ? "beforebegin" : "afterend",
      badge,
    );
  }

  document.querySelectorAll(selectors.CHAT_MESSAGE).forEach(addMissingBadge);

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (!(node instanceof HTMLElement)) continue;
        if (node.matches(selectors.CHAT_MESSAGE)) {
          addMissingBadge(node);
        }
        node.querySelectorAll(selectors.CHAT_MESSAGE).forEach(addMissingBadge);
      }
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

export function hideNickname(enabled: boolean) {
  if (!enabled) return;

  const style = document.createElement("style");
  style.textContent = `
    .group\\/item > span.text-\\[\\#808080\\] {
      display: none !important;
    }
    .group\\/item > span.ml-\\[0\\.333rem\\] {
      margin-left: 0 !important;
    }
  `;
  document.head.appendChild(style);

  function addMissingBadge(item: Element) {
    // 이미 팀로고가 있으면 스킵
    if (item.querySelector("span.ml-\\[0\\.333rem\\] img")) return;
    // 이미 처리된 경우 스킵
    if (item.querySelector(".kbo-plus-unknown-badge")) return;

    const nickname = item.querySelector<HTMLElement>(
      ":scope > span.text-\\[\\#808080\\]",
    );
    if (!nickname) return;

    const badge = document.createElement("span");
    badge.className =
      "ml-[0.333rem] inline-flex items-center align-middle kbo-plus-unknown-badge";
    badge.style.marginLeft = "0";

    const icon = document.createElement("span");
    icon.textContent = "?";
    icon.style.cssText =
      "display:inline-flex;align-items:center;justify-content:center;width:1rem;height:1rem;font-size:10px;font-weight:bold;color:#808080;background:#3a3a3a;border-radius:30%;";

    badge.appendChild(icon);
    nickname.insertAdjacentElement("afterend", badge);
  }

  // 기존 채팅 처리
  document.querySelectorAll(".group\\/item").forEach(addMissingBadge);

  // 새로 추가되는 채팅 처리
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (!(node instanceof HTMLElement)) continue;
        if (node.matches(".group\\/item")) {
          addMissingBadge(node);
        }
        node.querySelectorAll(".group\\/item").forEach(addMissingBadge);
      }
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

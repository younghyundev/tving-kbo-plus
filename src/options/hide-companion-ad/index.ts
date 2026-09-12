import selectors from "../../constant/selectors";

const STYLE_ID = "kbo-plus-hide-companion-ad-style";

export function hideCompanionAd() {
  if (document.getElementById(STYLE_ID)) return;

  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    ${selectors.PLAYER_COMPANION_AD} {
      display: none !important;
    }
  `;
  document.head.appendChild(style);

  return () => style.remove();
}

import selectors from "../../constant/selectors";

const STYLE_ID = "kbo-plus-hide-top-navigation-style";

export function hideTopNavigation(enabled: boolean) {
  if (!enabled || document.getElementById(STYLE_ID)) return;

  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    ${selectors.SPORTS_GNB},
    ${selectors.SPORTS_TYPE_HEADER} {
      display: none !important;
    }

    ${selectors.SPORTS_GAME_ROOT} {
      --sports-header-height: 0px !important;
      --sports-gnb-height: 0px !important;
      --sports-type-header-height: 0px !important;
    }
  `;
  document.head.appendChild(style);
}

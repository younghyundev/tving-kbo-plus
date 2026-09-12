import selectors from "../../constant/selectors";

const STYLE_ID = "kbo-plus-hide-top-navigation-style";
const HIDDEN_ATTRIBUTE = "data-kbo-plus-top-navigation-hidden";
const SCROLL_THRESHOLD = 24;
const TRANSITION_DURATION = 250;

export function hideTopNavigation(enabled: boolean) {
  if (!enabled || document.getElementById(STYLE_ID)) return;

  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    ${selectors.SPORTS_GNB_WRAPPER} > *,
    ${selectors.SPORTS_TYPE_HEADER_WRAPPER} > * {
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
      transition:
        opacity ${TRANSITION_DURATION}ms ease,
        transform ${TRANSITION_DURATION}ms ease,
        visibility 0s linear 0s,
        background-color 300ms linear !important;
    }

    :root[${HIDDEN_ATTRIBUTE}] ${selectors.SPORTS_GNB_WRAPPER} > *,
    :root[${HIDDEN_ATTRIBUTE}] ${selectors.SPORTS_TYPE_HEADER_WRAPPER} > * {
      opacity: 0;
      visibility: hidden;
      pointer-events: none;
      transform: translateY(-12px);
      transition:
        opacity ${TRANSITION_DURATION}ms ease,
        transform ${TRANSITION_DURATION}ms ease,
        visibility 0s linear ${TRANSITION_DURATION}ms,
        background-color 300ms linear !important;
    }

    :root[${HIDDEN_ATTRIBUTE}] ${selectors.SPORTS_GAME_ROOT} {
      --sports-header-height: 0px !important;
      --sports-gnb-height: 0px !important;
      --sports-type-header-height: 0px !important;
    }
  `;
  document.head.appendChild(style);

  let hidden: boolean | undefined;
  const updateNavigation = () => {
    const shouldHide = window.scrollY <= SCROLL_THRESHOLD;
    if (shouldHide === hidden) return;

    document.documentElement.toggleAttribute(HIDDEN_ATTRIBUTE, shouldHide);
    hidden = shouldHide;
  };

  updateNavigation();
  window.addEventListener("scroll", updateNavigation, { passive: true });

  return () => {
    window.removeEventListener("scroll", updateNavigation);
    document.documentElement.removeAttribute(HIDDEN_ATTRIBUTE);
    style.remove();
  };
}

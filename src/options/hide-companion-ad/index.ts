import selectors from "../../constant/selectors";
import { setStyleElement } from "../../utils/dom";

const STYLE_ID = "kbo-plus-hide-companion-ad-style";

export function hideCompanionAd(): void {
  setStyleElement(
    STYLE_ID,
    `
      ${selectors.PLAYER_COMPANION_AD} {
        display: none !important;
      }
    `,
  );
}

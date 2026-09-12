import selectors from "../../constant/selectors";
import { setStyleElement } from "../../utils/dom";

const STYLE_ID = "kbo-plus-hide-like-style";

export function hideLikeButton(enabled: boolean): void {
  setStyleElement(
    STYLE_ID,
    `
      ${selectors.LIKE_BUTTON} {
        display: none !important;
      }
    `,
    enabled,
  );
}

import { setStyleElement } from "../../utils/dom";

const STYLE_ID = "kbo-plus-hide-nickname-style";

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
    `,
    enabled,
  );
}

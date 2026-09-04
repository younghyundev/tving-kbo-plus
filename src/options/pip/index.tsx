import { PipButton } from "../../components/pip";
import { waitForElement, injectAfter } from "../../utils/dom";
import selectors from "../../constant/selectors";

export async function addPipButton(enabled: boolean) {
  if (!enabled) return;
  if (document.querySelector('button[aria-label="PIP 모드"], button[aria-label="PIP 종료"]')) return;

  const space = await waitForElement(selectors.SPACE);

  if (!space) {
    console.warn("error, no space element");
    return;
  }

  injectAfter(<PipButton />, space);
}

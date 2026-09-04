import { CinemaModeButton } from "../../components/cinema-mode";
import selectors from "../../constant/selectors";
import { injectBefore, waitForElement } from "../../utils/dom";

export async function addCinemaButton(enabled: boolean) {
  if (!enabled) return;
  if (document.querySelector('button[aria-label="넓은 화면 모드"], button[aria-label="좁은 화면 모드"]')) return;

  const space = await waitForElement(selectors.FULLSCREEN_BUTTON);

  if (!space) {
    console.warn("error, no space element");
    return;
  }

  injectBefore(<CinemaModeButton />, space);
}

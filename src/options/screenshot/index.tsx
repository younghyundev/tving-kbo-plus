import { ScreenshotButton } from "../../components/screenshot";
import selectors from "../../constant/selectors";
import { mountControl } from "../mount-control";

export function addScreenshotButton(enabled: boolean) {
  return mountControl({
    buttonSelector: 'button[aria-label="스크린샷"]',
    enabled,
    name: "스크린샷",
    node: <ScreenshotButton />,
    position: "after",
    targetSelector: selectors.SPACE,
  });
}

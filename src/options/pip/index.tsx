import { PipButton } from "../../components/pip";
import selectors from "../../constant/selectors";
import { mountControl } from "../mount-control";

export function addPipButton(enabled: boolean) {
  return mountControl({
    buttonSelector:
      'button[aria-label="PIP 모드"], button[aria-label="PIP 종료"]',
    enabled,
    name: "PIP",
    node: <PipButton />,
    position: "after",
    targetSelector: selectors.SPACE,
  });
}

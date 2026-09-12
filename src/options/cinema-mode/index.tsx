import { CinemaModeButton } from "../../components/cinema-mode";
import selectors from "../../constant/selectors";
import { mountControl } from "../mount-control";

export function addCinemaButton(enabled: boolean) {
  return mountControl({
    buttonSelector:
      'button[aria-label="넓은 화면 모드"], button[aria-label="좁은 화면 모드"]',
    enabled,
    name: "영화관 모드",
    node: <CinemaModeButton />,
    position: "before",
    targetSelector: selectors.FULLSCREEN_BUTTON,
  });
}

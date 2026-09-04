import selectors from "../constant/selectors";
import { getVideoElement } from "./get";
import { waitForElement } from "./dom";

interface CinemaModeSnapshot {
  bodyOverflow: string;
  containerStyle: string | null;
  fullscreenStyle: string | null;
  playerRootStyle: string | null;
  wrapperStyle: string | null;
}

let snapshot: CinemaModeSnapshot | null = null;

function restoreStyle(element: HTMLElement, style: string | null) {
  if (style === null) {
    element.removeAttribute("style");
    return;
  }

  element.setAttribute("style", style);
}

export async function toggleCinemaMode(isWideMode: boolean) {
  const video = await getVideoElement();
  const container =
    video?.closest<HTMLElement>(selectors.PLAYER_CONTAINER) ??
    (await waitForElement(selectors.PLAYER_CONTAINER));
  const playerRoot =
    video?.closest<HTMLElement>(".cjp-root") ??
    (await waitForElement(selectors.PLAYER_WRAP));
  const wrapper = playerRoot?.parentElement;
  const fullScreenButton = await waitForElement(selectors.FULLSCREEN_BUTTON);

  if (!container || !playerRoot || !wrapper || !fullScreenButton) {
    console.warn("필요한 요소를 찾을 수 없습니다");
    return;
  }

  if (isWideMode) {
    if (snapshot) return;

    snapshot = {
      bodyOverflow: document.body.style.overflow,
      containerStyle: container.getAttribute("style"),
      fullscreenStyle: fullScreenButton.getAttribute("style"),
      playerRootStyle: playerRoot.getAttribute("style"),
      wrapperStyle: wrapper.getAttribute("style"),
    };

    Object.assign(container.style, {
      position: "fixed",
      inset: "0",
      width: "100vw",
      height: "100vh",
      zIndex: "9999",
    });
    Object.assign(wrapper.style, {
      width: "100%",
      height: "100%",
      maxWidth: "none",
      maxHeight: "none",
    });
    Object.assign(playerRoot.style, {
      width: "100%",
      height: "100%",
      maxWidth: "none",
      maxHeight: "none",
    });
    document.body.style.overflow = "hidden";
    fullScreenButton.style.display = "none";
    return;
  }

  if (!snapshot) return;

  restoreStyle(container, snapshot.containerStyle);
  restoreStyle(wrapper, snapshot.wrapperStyle);
  restoreStyle(playerRoot, snapshot.playerRootStyle);
  restoreStyle(fullScreenButton, snapshot.fullscreenStyle);
  document.body.style.overflow = snapshot.bodyOverflow;
  snapshot = null;
}

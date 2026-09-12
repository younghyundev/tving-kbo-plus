import selectors from "../../constant/selectors";
import { getVideoElement } from "../../utils/get";

let observer: MutationObserver | null = null;
let observedRoot: Element | null = null;
let mutedVideo: HTMLVideoElement | null = null;
let mutedBeforeAd = false;
const RELEVANT_SELECTOR = `${selectors.AD_BUTTON}, ${selectors.VIDEO}`;

function getCurrentVideo(): HTMLVideoElement | null {
  return (
    observedRoot?.querySelector<HTMLVideoElement>(selectors.VIDEO) ??
    document.querySelector<HTMLVideoElement>(selectors.VIDEO)
  );
}

function restoreMuteState(): void {
  if (mutedVideo) mutedVideo.muted = mutedBeforeAd;
  mutedVideo = null;
}

function updateMuteState(video = getCurrentVideo()): void {
  if (!video) return;

  const hasAd = Boolean(
    (observedRoot ?? document).querySelector(selectors.AD_BUTTON),
  );
  if (!hasAd) {
    restoreMuteState();
    return;
  }
  if (mutedVideo === video) return;

  restoreMuteState();
  mutedBeforeAd = video.muted;
  video.muted = true;
  mutedVideo = video;
}

function stopAutoMute(): void {
  observer?.disconnect();
  observer = null;
  observedRoot = null;
  restoreMuteState();
}

function nodeContainsRelevantElement(node: Node): boolean {
  if (!(node instanceof Element)) return false;
  return (
    node.matches(RELEVANT_SELECTOR) ||
    Boolean(node.querySelector(RELEVANT_SELECTOR))
  );
}

function mutationAffectsAdState(mutation: MutationRecord): boolean {
  if (
    mutation.type === "attributes" &&
    mutation.target instanceof HTMLButtonElement
  ) {
    return mutedVideo !== null || mutation.target.matches(selectors.AD_BUTTON);
  }
  return [...mutation.addedNodes, ...mutation.removedNodes].some(
    nodeContainsRelevantElement,
  );
}

export async function autoMuteOnAd(enabled: boolean): Promise<void> {
  if (!enabled) {
    stopAutoMute();
    return;
  }
  if (observer && observedRoot?.isConnected) return;
  stopAutoMute();

  const video = getCurrentVideo() ?? (await getVideoElement());
  if (!video) return;
  observedRoot =
    video.closest(selectors.PLAYER_CONTAINER) ??
    video.parentElement ??
    document.body;
  updateMuteState(video);

  observer = new MutationObserver((mutations) => {
    if (!observedRoot?.isConnected) {
      stopAutoMute();
      return;
    }
    if (mutations.some(mutationAffectsAdState)) updateMuteState();
  });
  observer.observe(observedRoot, {
    attributes: true,
    attributeFilter: ["class"],
    childList: true,
    subtree: true,
  });
}

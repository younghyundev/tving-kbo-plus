import selectors from "../../constant/selectors";
import { getVideoElement } from "../../utils/get";

let observer: MutationObserver | null = null;
let mutedVideo: HTMLVideoElement | null = null;
let mutedBeforeAd = false;

function getCurrentVideo(): HTMLVideoElement | null {
  return document.querySelector<HTMLVideoElement>(selectors.VIDEO);
}

function restoreMuteState(): void {
  if (mutedVideo) mutedVideo.muted = mutedBeforeAd;
  mutedVideo = null;
}

function updateMuteState(video = getCurrentVideo()): void {
  if (!video) return;

  const hasAd = Boolean(document.querySelector(selectors.AD_BUTTON));
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
  restoreMuteState();
}

export async function autoMuteOnAd(enabled: boolean): Promise<void> {
  if (!enabled) {
    stopAutoMute();
    return;
  }
  if (observer) return;

  const video = getCurrentVideo() ?? (await getVideoElement());
  if (!video) return;
  updateMuteState(video);

  observer = new MutationObserver(() => updateMuteState());
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

import selectors from "../../constant/selectors";
import { getVideoElement } from "../../utils/get";

let observer: MutationObserver | null = null;
let adActive = false;
let mutedBeforeAd = false;

export async function autoMuteOnAd(enabled: boolean) {
  if (!enabled || observer) return;

  const updateMuteState = async () => {
    const video = await getVideoElement();
    if (!video) return;

    const hasAd = Boolean(document.querySelector(selectors.AD_BUTTON));
    if (hasAd && !adActive) {
      mutedBeforeAd = video.muted;
      video.muted = true;
      adActive = true;
      return;
    }

    if (!hasAd && adActive) {
      video.muted = mutedBeforeAd;
      adActive = false;
    }
  };

  await updateMuteState();

  observer = new MutationObserver(updateMuteState);

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

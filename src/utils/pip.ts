import { getVideoElement } from "./get";

const SEEK_ACTIONS: MediaSessionAction[] = [
  "seekto",
  "seekforward",
  "seekbackward",
];

export async function togglePip(): Promise<boolean> {
  if (document.pictureInPictureElement) {
    await document.exitPictureInPicture();
    return false;
  }

  const video = await getVideoElement();
  if (!video) {
    console.warn("error, no video element for PIP");
    return false;
  }

  await video.requestPictureInPicture();

  for (const action of SEEK_ACTIONS) {
    navigator.mediaSession.setActionHandler(action, null);
  }
  navigator.mediaSession.setPositionState();

  return true;
}

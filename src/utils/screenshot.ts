import { getCurrentTime, getTitle, getVideoElement } from "./get";

export async function screenshot(): Promise<void> {
  const video = await getVideoElement();
  if (video === null) {
    return;
  }

  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const ctx = canvas.getContext("2d");

  if (ctx === null) {
    console.error("Failed to get 2d context, cannot take a screenshot");
    return;
  }

  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  const image = canvas.toDataURL("image/png");

  const link = document.createElement("a");
  const title = await getTitle();
  const date = getCurrentTime();
  link.download = `${title || "screenshot"}-${date}.png`;
  link.href = image;

  link.click();
}

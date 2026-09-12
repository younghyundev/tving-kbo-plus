import { getCurrentTime, getTitle, getVideoElement } from "./get";

let mediaRecorder: MediaRecorder | null = null;
let chunks: BlobPart[] = [];
let isRecording = false;

interface CapturableVideoElement extends HTMLVideoElement {
  captureStream(): MediaStream;
}

function canCaptureStream(
  video: HTMLVideoElement,
): video is CapturableVideoElement {
  return (
    "captureStream" in video &&
    typeof (video as Partial<CapturableVideoElement>).captureStream ===
      "function"
  );
}

function downloadRecording(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.download = filename;
  link.href = url;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

export async function record(): Promise<boolean> {
  if (mediaRecorder && mediaRecorder.state === "recording") {
    mediaRecorder.stop();
    isRecording = false;
    return isRecording;
  }

  const video = await getVideoElement();

  if (video === null) {
    alert("비디오 요소를 찾을 수 없습니다.");
    return isRecording;
  }
  if (!canCaptureStream(video)) {
    alert("현재 브라우저에서는 비디오 녹화를 지원하지 않습니다.");
    return isRecording;
  }

  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const ctx = canvas.getContext("2d");
  if (ctx === null) {
    console.error("2d 컨텍스트를 가져오는데 실패했습니다.");
    return isRecording;
  }
  const videoStream = canvas.captureStream();
  const audioStream = video.captureStream().getAudioTracks();
  const combinedStream = new MediaStream([
    ...videoStream.getTracks(),
    ...audioStream,
  ]);

  mediaRecorder = new MediaRecorder(combinedStream, {
    mimeType: "video/mp4; codecs=avc1.42E01E,mp4a.40.2",
  });
  chunks = [];

  mediaRecorder.ondataavailable = (event) => {
    if (event.data.size > 0) chunks.push(event.data);
  };

  mediaRecorder.onstop = async () => {
    const blob = new Blob(chunks, { type: "video/mp4" });
    const title = await getTitle();
    const date = getCurrentTime();
    downloadRecording(blob, `${title || "clip"}-${date}.mp4`);

    mediaRecorder = null;
    chunks = [];
    isRecording = false;
  };

  const drawFrame = () => {
    if (video.ended || !mediaRecorder || mediaRecorder.state !== "recording")
      return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    requestAnimationFrame(drawFrame);
  };

  mediaRecorder.start();
  drawFrame();
  isRecording = true;
  return isRecording;
}

export function getRecordingStatus(): boolean {
  return isRecording;
}

import { getCurrentTime, getTitle, getVideoElement } from "./get";

const RECORDING_FRAME_RATE = 30;
const RECORDING_FRAME_INTERVAL = 1000 / RECORDING_FRAME_RATE;

let mediaRecorder: MediaRecorder | null = null;
let chunks: BlobPart[] = [];
let animationFrameId: number | null = null;
let recordingStreams: MediaStream[] = [];
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

function stopCaptureResources(): void {
  if (animationFrameId !== null) {
    window.cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }

  const tracks = new Set(
    recordingStreams.flatMap((stream) => stream.getTracks()),
  );
  for (const track of tracks) track.stop();
  recordingStreams = [];
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

async function finalizeRecording(recordedChunks: BlobPart[]): Promise<void> {
  if (recordedChunks.length === 0) return;
  const blob = new Blob(recordedChunks, { type: "video/mp4" });
  const title = await getTitle();
  downloadRecording(blob, `${title || "clip"}-${getCurrentTime()}.mp4`);
}

export async function record(): Promise<boolean> {
  if (mediaRecorder) {
    if (mediaRecorder.state === "recording") mediaRecorder.stop();
    isRecording = false;
    return false;
  }

  const video = await getVideoElement();
  if (!video) {
    alert("비디오 요소를 찾을 수 없습니다.");
    return false;
  }
  if (!canCaptureStream(video)) {
    alert("현재 브라우저에서는 비디오 녹화를 지원하지 않습니다.");
    return false;
  }

  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const context = canvas.getContext("2d");
  if (!context) {
    console.error("2d 컨텍스트를 가져오는데 실패했습니다.");
    return false;
  }

  const canvasStream = canvas.captureStream(RECORDING_FRAME_RATE);
  const sourceStream = video.captureStream();
  for (const track of sourceStream.getVideoTracks()) track.stop();
  const combinedStream = new MediaStream([
    ...canvasStream.getVideoTracks(),
    ...sourceStream.getAudioTracks(),
  ]);
  recordingStreams = [canvasStream, combinedStream];

  let recorder: MediaRecorder;
  try {
    recorder = new MediaRecorder(combinedStream, {
      mimeType: "video/mp4; codecs=avc1.42E01E,mp4a.40.2",
    });
  } catch (error) {
    stopCaptureResources();
    throw error;
  }
  mediaRecorder = recorder;
  chunks = [];

  recorder.ondataavailable = (event) => {
    if (event.data.size > 0) chunks.push(event.data);
  };

  recorder.onerror = () => {
    if (mediaRecorder === recorder) mediaRecorder = null;
    chunks = [];
    isRecording = false;
    stopCaptureResources();
  };

  recorder.onstop = () => {
    const recordedChunks = chunks;
    if (mediaRecorder === recorder) mediaRecorder = null;
    chunks = [];
    isRecording = false;
    stopCaptureResources();
    void finalizeRecording(recordedChunks);
  };

  let lastDrawTime = -RECORDING_FRAME_INTERVAL;
  const drawFrame = (timestamp: number) => {
    if (video.ended || recorder.state !== "recording") return;

    if (timestamp - lastDrawTime >= RECORDING_FRAME_INTERVAL) {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      lastDrawTime = timestamp;
    }
    animationFrameId = window.requestAnimationFrame(drawFrame);
  };

  recorder.start(1000);
  animationFrameId = window.requestAnimationFrame(drawFrame);
  isRecording = true;
  return true;
}

export function getRecordingStatus(): boolean {
  return isRecording;
}

export function stopRecording(): void {
  if (mediaRecorder?.state === "recording") {
    mediaRecorder.stop();
    isRecording = false;
  }
}

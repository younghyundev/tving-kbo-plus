import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { record, stopRecording } from "../record";

class FakeMediaStream {
  constructor(private readonly tracks: MediaStreamTrack[] = []) {}

  getTracks() {
    return this.tracks;
  }

  getVideoTracks() {
    return this.tracks.filter((track) => track.kind === "video");
  }

  getAudioTracks() {
    return this.tracks.filter((track) => track.kind === "audio");
  }
}

class FakeMediaRecorder {
  state: RecordingState = "inactive";
  ondataavailable: ((event: BlobEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  onstop: ((event: Event) => void) | null = null;

  start() {
    this.state = "recording";
  }

  stop() {
    this.state = "inactive";
    this.onstop?.(new Event("stop"));
  }
}

function createTrack(kind: "audio" | "video") {
  return {
    kind,
    stop: vi.fn(),
  } as unknown as MediaStreamTrack;
}

describe("record", () => {
  beforeEach(() => {
    document.body.innerHTML = '<video id="tving-player-1"></video>';
    vi.stubGlobal("MediaStream", FakeMediaStream);
    vi.stubGlobal("MediaRecorder", FakeMediaRecorder);
    vi.spyOn(window, "requestAnimationFrame").mockReturnValue(1);
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => undefined);
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
      drawImage: vi.fn(),
    } as unknown as CanvasRenderingContext2D);
  });

  afterEach(() => {
    stopRecording();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("녹화 종료 시 생성한 모든 미디어 track을 중지한다", async () => {
    const video = document.querySelector<HTMLVideoElement>("video")!;
    const sourceVideoTrack = createTrack("video");
    const sourceAudioTrack = createTrack("audio");
    const canvasVideoTrack = createTrack("video");

    Object.defineProperty(video, "captureStream", {
      configurable: true,
      value: () => new FakeMediaStream([sourceVideoTrack, sourceAudioTrack]),
    });
    Object.defineProperty(HTMLCanvasElement.prototype, "captureStream", {
      configurable: true,
      value: () => new FakeMediaStream([canvasVideoTrack]),
    });

    await expect(record()).resolves.toBe(true);
    expect(sourceVideoTrack.stop).toHaveBeenCalledOnce();

    stopRecording();

    expect(sourceAudioTrack.stop).toHaveBeenCalledOnce();
    expect(canvasVideoTrack.stop).toHaveBeenCalledOnce();
    expect(window.cancelAnimationFrame).toHaveBeenCalledWith(1);
  });
});

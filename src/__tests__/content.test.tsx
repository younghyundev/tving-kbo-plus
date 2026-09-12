import { waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_SETTINGS } from "../types";

describe("content script", () => {
  beforeEach(() => {
    vi.resetModules();
    document.head.innerHTML = "";
    document.body.innerHTML = `<div id="sports-game-scroll-root">
      <section class="sports-player">
        <div class="player-module__playerWrapper">
          <div class="cjp-root">
            <video id="tving-player-1"></video>
            <div class="cjp__ui-control">
              <div class="con__space-center"></div>
              <button class="con__fullscreen" aria-label="전체화면"></button>
            </div>
          </div>
        </div>
      </section>
      <button aria-label="좋아요"></button>
    </div>`;
  });

  afterEach(() => {
    window.dispatchEvent(new Event("pagehide"));
    vi.clearAllMocks();
  });

  it("현재 TVING 플레이어가 이미 있으면 기능을 즉시 적용한다", async () => {
    await chrome.storage.sync.set({
      tvingSettings: {
        ...DEFAULT_SETTINGS,
        addRecord: true,
        enableLiveSync: false,
      },
    });

    await import("../content");

    await waitFor(() => {
      expect(
        document.querySelector('button[aria-label="스크린샷"]'),
      ).not.toBeNull();
      expect(document.querySelector('button[aria-label="녹화"]')).not.toBeNull();
      expect(
        document.querySelector('button[aria-label="넓은 화면 모드"]'),
      ).not.toBeNull();
      expect(
        document.querySelector('button[aria-label="PIP 모드"]'),
      ).not.toBeNull();
    });
  });

  it("스포츠 페이지가 아니면 기능 번들을 초기화하지 않는다", async () => {
    document.body.innerHTML = "<main>home</main>";
    vi.mocked(chrome.storage.sync.get).mockClear();

    await import("../content");
    await Promise.resolve();

    expect(chrome.storage.sync.get).not.toHaveBeenCalled();
  });

  it("스포츠 페이지를 벗어나면 주입한 컨트롤을 언마운트한다", async () => {
    await import("../content");
    await waitFor(() => {
      expect(
        document.querySelector('button[aria-label="스크린샷"]'),
      ).not.toBeNull();
    });

    document.getElementById("sports-game-scroll-root")?.remove();

    await waitFor(() => {
      expect(document.querySelector(".kbo-plus-control-slot")).toBeNull();
    });
  });
});

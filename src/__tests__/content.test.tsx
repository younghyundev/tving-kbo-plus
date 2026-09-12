import { waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_SETTINGS } from "../types";

describe("content script", () => {
  beforeEach(() => {
    vi.resetModules();
    document.head.innerHTML = "";
    document.body.innerHTML = `
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
    `;
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
});

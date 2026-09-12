import { afterEach, describe, expect, it, vi } from "vitest";
import { autoMuteOnAd } from ".";

describe("autoMuteOnAd", () => {
  afterEach(async () => {
    await autoMuteOnAd(false);
  });

  it("광고 동안만 음소거하고 기존 상태를 복원한다", async () => {
    document.body.innerHTML = '<video id="tving-player-1"></video>';
    const video = document.querySelector("video")!;
    video.muted = false;

    await autoMuteOnAd(true);

    const adButton = document.createElement("button");
    adButton.className =
      "PcAdvertisementLinkButton-module__hash__advertisementLinkButton";
    document.body.appendChild(adButton);

    await vi.waitFor(() => expect(video.muted).toBe(true));

    adButton.remove();

    await vi.waitFor(() => expect(video.muted).toBe(false));
  });

  it("기능을 끄면 광고 전 음소거 상태를 복원한다", async () => {
    document.body.innerHTML = '<video id="tving-player-1"></video>';
    const video = document.querySelector("video")!;
    video.muted = false;
    const adButton = document.createElement("button");
    adButton.className =
      "PcAdvertisementLinkButton-module__hash__advertisementLinkButton";
    document.body.appendChild(adButton);

    await autoMuteOnAd(true);
    expect(video.muted).toBe(true);

    await autoMuteOnAd(false);
    expect(video.muted).toBe(false);
  });

  it("플레이어 외부 DOM 변경은 광고로 처리하지 않는다", async () => {
    document.body.innerHTML = `
      <section class="sports-player">
        <video id="tving-player-1"></video>
      </section>
      <aside id="outside"></aside>
    `;
    const video = document.querySelector("video")!;
    await autoMuteOnAd(true);

    const outsideAd = document.createElement("button");
    outsideAd.className =
      "PcAdvertisementLinkButton-module__hash__advertisementLinkButton";
    document.getElementById("outside")?.appendChild(outsideAd);
    await Promise.resolve();
    expect(video.muted).toBe(false);

    const playerAd = outsideAd.cloneNode() as HTMLButtonElement;
    document.querySelector(".sports-player")?.appendChild(playerAd);
    await vi.waitFor(() => expect(video.muted).toBe(true));
  });
});

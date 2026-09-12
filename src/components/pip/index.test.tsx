import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { PipButton } from ".";

describe("PipButton", () => {
  afterEach(() => {
    Object.defineProperty(document, "pictureInPictureElement", {
      configurable: true,
      value: null,
    });
  });

  it("브라우저에서 PIP가 종료돼도 버튼 상태를 동기화한다", async () => {
    document.body.innerHTML = '<video id="tving-player-1"></video>';
    const video = document.querySelector("video")!;

    render(<PipButton />);
    await screen.findByRole("button", { name: "PIP 모드" });

    Object.defineProperty(document, "pictureInPictureElement", {
      configurable: true,
      value: video,
    });
    fireEvent(video, new Event("enterpictureinpicture"));

    await screen.findByRole("button", { name: "PIP 종료" });

    Object.defineProperty(document, "pictureInPictureElement", {
      configurable: true,
      value: null,
    });
    fireEvent(video, new Event("leavepictureinpicture"));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "PIP 모드" })).toBeVisible();
    });
  });
});

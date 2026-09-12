import { beforeEach, describe, expect, it } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import App from "../App";
import { DEFAULT_SETTINGS, SETTINGS_STORAGE_KEY } from "../types";

describe("App", () => {
  beforeEach(async () => {
    await chrome.storage.sync.set({
      [SETTINGS_STORAGE_KEY]: DEFAULT_SETTINGS,
    });
  });

  it("타이틀을 렌더링한다", async () => {
    render(<App />);
    expect(await screen.findByText("TVING KBO PLUS")).toBeInTheDocument();
  });

  it("접근 가능한 스위치로 설정을 변경하고 저장한다", async () => {
    render(<App />);
    const toggle = await screen.findByRole("switch", {
      name: "좋아요 버튼 숨기기",
    });

    expect(toggle).toHaveAttribute("aria-checked", "false");
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-checked", "true");

    await waitFor(async () => {
      const result = await chrome.storage.sync.get(SETTINGS_STORAGE_KEY);
      expect(result[SETTINGS_STORAGE_KEY]).toMatchObject({
        hideLikeButton: true,
      });
    });
  });
});

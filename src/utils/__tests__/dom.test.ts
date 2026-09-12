import { describe, it, expect } from "vitest";
import { waitForElement } from "../dom";

describe("waitForElement", () => {
  it("이미 존재하는 요소를 즉시 반환한다", async () => {
    document.body.innerHTML = '<div id="target">hello</div>';
    const el = await waitForElement("#target");
    expect(el).not.toBeNull();
    expect(el?.textContent).toBe("hello");
  });

  it("타임아웃 시 null을 반환한다", async () => {
    document.body.innerHTML = "";
    const el = await waitForElement("#nonexistent", 100);
    expect(el).toBeNull();
  });

  it("나중에 추가된 요소를 감지한다", async () => {
    const result = waitForElement<HTMLButtonElement>("#delayed-target");
    const button = document.createElement("button");
    button.id = "delayed-target";
    document.body.appendChild(button);

    await expect(result).resolves.toBe(button);
  });
});

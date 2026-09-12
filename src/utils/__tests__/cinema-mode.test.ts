import { beforeEach, describe, expect, it } from "vitest";
import { toggleCinemaMode } from "../cinema-mode";

describe("toggleCinemaMode", () => {
  beforeEach(() => {
    document.body.style.overflow = "auto";
    document.body.innerHTML = `
      <section class="sports-player" style="color: red">
        <div class="player-module__playerWrapper" style="border-width: 1px">
          <div class="cjp-root" style="background: black">
            <video id="tving-player-1"></video>
            <button
              class="con__fullscreen"
              style="display: inline-block"
            ></button>
          </div>
        </div>
      </section>
    `;
  });

  it("현행 플레이어를 전체 화면 크기로 만들고 원래 스타일을 복원한다", async () => {
    const container = document.querySelector<HTMLElement>(".sports-player")!;
    const wrapper = document.querySelector<HTMLElement>(
      ".player-module__playerWrapper",
    )!;
    const playerRoot = document.querySelector<HTMLElement>(".cjp-root")!;
    const fullscreen = document.querySelector<HTMLElement>(
      ".con__fullscreen",
    )!;

    await toggleCinemaMode(true);

    expect(container.style.position).toBe("fixed");
    expect(container.style.width).toBe("100vw");
    expect(container.style.height).toBe("100vh");
    expect(wrapper.style.width).toBe("100%");
    expect(playerRoot.style.height).toBe("100%");
    expect(fullscreen.style.display).toBe("none");
    expect(document.body.style.overflow).toBe("hidden");

    await toggleCinemaMode(false);

    expect(container.style.color).toBe("red");
    expect(container.style.position).toBe("");
    expect(wrapper.style.borderWidth).toBe("1px");
    expect(wrapper.style.width).toBe("");
    expect(playerRoot.style.background).toBe("black");
    expect(playerRoot.style.height).toBe("");
    expect(fullscreen.style.display).toBe("inline-block");
    expect(document.body.style.overflow).toBe("auto");
  });
});

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const INSTALLED_KEY = "__TVING_KBO_PLUS_WINDOWED_MULTIVIEW__";
const INSTALLED_ATTRIBUTE = "data-kbo-plus-windowed-multiview-installed";
const TRIGGER_ATTRIBUTE = "data-kbo-plus-windowed-multiview-trigger";
const ACTIVE_ATTRIBUTE = "data-kbo-plus-windowed-multiview-active";

describe("windowed multiview content script", () => {
  const originalRequestFullscreen = Element.prototype.requestFullscreen;
  const originalExitFullscreen = Document.prototype.exitFullscreen;
  let requestFullscreen: ReturnType<typeof vi.fn>;
  let siteFullscreen: boolean;

  beforeEach(() => {
    vi.resetModules();
    vi.useFakeTimers();
    Reflect.deleteProperty(window, INSTALLED_KEY);
    window.history.replaceState({}, "", "/sports/game/test/talk");
    document.documentElement.removeAttribute(INSTALLED_ATTRIBUTE);
    document.documentElement.removeAttribute(ACTIVE_ATTRIBUTE);
    document.body.className = "";
    document.body.innerHTML = `
      <section class="sports-player normal-layout">
        <div class="cjp-root">
          <button
            aria-label="전체화면"
            class="con__fullscreen"
            type="button"
          ></button>
          <button
            aria-label="멀티뷰"
            class="relative pointer-events-none opacity-40"
            type="button"
            disabled
          ></button>
        </div>
      </section>
    `;

    requestFullscreen = vi.fn().mockResolvedValue(undefined);
    siteFullscreen = false;
    Object.defineProperty(Element.prototype, "requestFullscreen", {
      configurable: true,
      writable: true,
      value: requestFullscreen,
    });
    Object.defineProperty(Document.prototype, "exitFullscreen", {
      configurable: true,
      writable: true,
      value: vi.fn().mockResolvedValue(undefined),
    });
    Object.defineProperty(document, "fullscreenElement", {
      configurable: true,
      value: null,
    });

    const multiviewButton = document.querySelector<HTMLButtonElement>(
      'button[aria-label="멀티뷰"]',
    );
    const fullscreenButton =
      document.querySelector<HTMLButtonElement>(".con__fullscreen");
    const sportsPlayer = document.querySelector<HTMLElement>(".sports-player");

    fullscreenButton?.addEventListener("click", () => {
      if (siteFullscreen) {
        siteFullscreen = false;
        document.body.classList.remove("fullscreen");
        sportsPlayer?.setAttribute("class", "sports-player normal-layout");
        fullscreenButton.setAttribute("aria-label", "전체화면");
        return;
      }

      siteFullscreen = true;
      void document.body.requestFullscreen();
      document.body.classList.add("fullscreen");
      sportsPlayer?.setAttribute(
        "class",
        "sports-player fixed inset-0 h-screen w-screen",
      );
      fullscreenButton.setAttribute("aria-label", "전체화면 종료");

      const chatExitButton = document.createElement("button");
      chatExitButton.type = "button";
      chatExitButton.setAttribute("aria-label", "chat exit");
      chatExitButton.addEventListener("click", () => {
        chatExitButton.remove();
        if (multiviewButton) {
          multiviewButton.disabled = false;
          multiviewButton.classList.remove(
            "pointer-events-none",
            "opacity-40",
          );
        }
      });
      document.body.append(chatExitButton);
    });

    multiviewButton?.addEventListener("click", () => {
      const multiview = document.createElement("section");
      multiview.className = "sports-multiview";
      Object.defineProperty(multiview, "getBoundingClientRect", {
        configurable: true,
        value: () => ({
          x: 0,
          y: 0,
          top: 0,
          right: 1432.5,
          bottom: 805.78125,
          width: 1432.5,
          height: 805.78125,
          toJSON: () => ({}),
        }),
      });

      const gridContainer = document.createElement("div");
      const main = document.createElement("main");
      const tile = document.createElement("div");
      const video = document.createElement("video");
      tile.append(video);
      main.append(tile);
      gridContainer.append(main);
      multiview.append(gridContainer);

      const hint = document.createElement("aside");
      multiview.append(hint);

      const footer = document.createElement("footer");
      footer.style.opacity = "1";
      Object.defineProperty(footer, "offsetHeight", {
        configurable: true,
        value: 120,
      });
      multiview.append(footer);
      document.body.append(multiview);
    });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    Reflect.deleteProperty(window, INSTALLED_KEY);
    Object.defineProperty(Element.prototype, "requestFullscreen", {
      configurable: true,
      writable: true,
      value: originalRequestFullscreen,
    });
    Object.defineProperty(Document.prototype, "exitFullscreen", {
      configurable: true,
      writable: true,
      value: originalExitFullscreen,
    });
  });

  it("opens multiview without native fullscreen and restores the talk layout", async () => {
    // @ts-expect-error The standalone MAIN-world content script has no exports.
    await import("./windowed-multiview");

    const multiviewButton = document.querySelector<HTMLButtonElement>(
      'button[aria-label="멀티뷰"]',
    );
    expect(multiviewButton).not.toBeNull();
    expect(multiviewButton).toBeEnabled();
    expect(multiviewButton).toHaveAttribute(TRIGGER_ATTRIBUTE);

    multiviewButton?.click();
    await vi.advanceTimersByTimeAsync(0);

    expect(requestFullscreen).not.toHaveBeenCalled();
    expect(document.fullscreenElement).toBeNull();
    expect(siteFullscreen).toBe(true);
    expect(document.body).not.toHaveClass("fullscreen");
    expect(document.querySelector(".sports-player")).toHaveClass(
      "sports-player",
      "normal-layout",
    );
    expect(document.querySelector(".sports-multiview")).not.toBeNull();
    expect(document.querySelector('[aria-label="chat exit"]')).toBeNull();
    expect(document.documentElement).toHaveAttribute(ACTIVE_ATTRIBUTE);

    const multiview = document.querySelector<HTMLElement>(".sports-multiview");
    const main = multiview?.querySelector<HTMLElement>("main");
    const gridContainer = main?.parentElement;
    const footer = multiview?.querySelector<HTMLElement>("footer");
    const video = multiview?.querySelector<HTMLVideoElement>("video");

    expect(multiview?.style.getPropertyValue("overflow")).toBe("hidden");
    expect(gridContainer?.style.getPropertyValue("width")).toBe("100%");
    expect(gridContainer?.style.getPropertyValue("height")).toBe("100%");
    expect(main?.style.getPropertyValue("position")).toBe("absolute");
    expect(Number.parseFloat(main?.style.width || "0")).toBeLessThan(1000);
    expect(Number.parseFloat(main?.style.height || "0")).toBeGreaterThan(500);
    expect(footer?.style.getPropertyValue("bottom")).toBe("84px");
    expect(footer?.style.getPropertyValue("transform")).toBe("scale(0.8)");
    expect(video?.style.getPropertyValue("object-fit")).toBe("contain");

    for (let index = 0; index < 3; index += 1) {
      main?.append(document.createElement("div"));
    }
    await vi.advanceTimersByTimeAsync(250);

    expect(main?.children).toHaveLength(4);
    expect(Number.parseFloat(main?.style.width || "0")).toBeLessThan(950);

    if (footer) footer.style.opacity = "0";
    await vi.advanceTimersByTimeAsync(250);

    expect(multiview).toHaveAttribute(
      "data-kbo-plus-windowed-multiview-ui-visible",
      "false",
    );
    expect(main?.style.getPropertyValue("top")).toBe("0px");
    expect(Number.parseFloat(main?.style.width || "0")).toBeGreaterThan(1400);
    expect(Number.parseFloat(main?.style.height || "0")).toBeGreaterThan(800);
    expect(
      multiview?.querySelector<HTMLElement>("aside")?.style.opacity,
    ).toBe("0");

    multiview?.remove();
    await vi.advanceTimersByTimeAsync(250);

    expect(siteFullscreen).toBe(false);
    expect(document.body).not.toHaveClass("fullscreen");
    expect(document.documentElement).not.toHaveAttribute(ACTIVE_ATTRIBUTE);
    expect(multiviewButton).toBeEnabled();
    expect(multiviewButton).toHaveAttribute(TRIGGER_ATTRIBUTE);
  });
});

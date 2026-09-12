(() => {
  const selectors = {
    multiviewButton: 'button[aria-label="\uBA40\uD2F0\uBDF0"]',
    chatExitButton: 'button[aria-label="chat exit"]',
    fullscreenButton: ".con__fullscreen",
    sportsPlayer: ".sports-player",
    multiview: ".sports-multiview",
  };
  const INSTALLED_KEY = "__TVING_KBO_PLUS_WINDOWED_MULTIVIEW__";
  const INSTALLED_ATTRIBUTE = "data-kbo-plus-windowed-multiview-installed";
  const TRIGGER_ATTRIBUTE = "data-kbo-plus-windowed-multiview-trigger";
  const ACTIVE_ATTRIBUTE = "data-kbo-plus-windowed-multiview-active";
  const WAIT_TIMEOUT = 3000;
  const SYNC_INTERVAL = 250;

  if (window[INSTALLED_KEY]) return;
  window[INSTALLED_KEY] = true;
  document.documentElement?.setAttribute(INSTALLED_ATTRIBUTE, "");

  const originalRequestFullscreen = Element.prototype.requestFullscreen;
  const originalExitFullscreen = Document.prototype.exitFullscreen;
  const connectedButtons = new WeakSet();
  let suppressNextFullscreen = false;
  let fakeFullscreenActive = false;
  let siteFullscreenActive = false;
  let starting = false;
  let multiviewWasVisible = false;
  let normalPlayerClassName = null;
  let syncQueued = false;
  let observedMultiview = null;
  let multiviewObserver = null;

  if (typeof originalRequestFullscreen === "function") {
    Element.prototype.requestFullscreen = function (options) {
      if (suppressNextFullscreen) {
        suppressNextFullscreen = false;
        fakeFullscreenActive = true;
        return Promise.resolve();
      }

      return originalRequestFullscreen.call(this, options);
    };
  }

  if (typeof originalExitFullscreen === "function") {
    Document.prototype.exitFullscreen = function () {
      if (fakeFullscreenActive && !document.fullscreenElement) {
        return Promise.resolve();
      }

      return originalExitFullscreen.call(this);
    };
  }

  function setRootAttribute(name, enabled) {
    const root = document.documentElement;
    if (!root) return;

    if (enabled && !root.hasAttribute(name)) root.setAttribute(name, "");
    else if (!enabled && root.hasAttribute(name)) root.removeAttribute(name);
  }

  function waitFor(predicate, timeout = WAIT_TIMEOUT) {
    const value = predicate();
    if (value !== null) return Promise.resolve(value);

    return new Promise((resolve, reject) => {
      const observer = new MutationObserver(() => {
        const nextValue = predicate();
        if (nextValue === null) return;

        window.clearTimeout(timer);
        observer.disconnect();
        resolve(nextValue);
      });
      const timer = window.setTimeout(() => {
        observer.disconnect();
        reject(new Error("Timed out while opening windowed multiview"));
      }, timeout);

      observer.observe(document, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["class", "disabled"],
      });
    });
  }

  function getButton(selector) {
    const element = document.querySelector(selector);
    return element?.tagName === "BUTTON" ? element : null;
  }

  function isNormalWindowedLayout() {
    return (
      !fakeFullscreenActive &&
      !document.fullscreenElement &&
      !document.body?.classList.contains("fullscreen")
    );
  }

  function getSportsPlayer() {
    return document.querySelector(selectors.sportsPlayer);
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function setImportantStyles(element, styles) {
    for (const [property, value] of Object.entries(styles)) {
      element.style.setProperty(property, value, "important");
    }
  }

  function observeMultiview(multiview) {
    if (observedMultiview === multiview) return;

    multiviewObserver?.disconnect();
    observedMultiview = multiview;
    multiviewObserver = new MutationObserver(queueSync);
    multiviewObserver.observe(multiview, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class"],
    });
  }

  function applyResponsiveMultiviewLayout(multiview) {
    const main = multiview.querySelector("main");
    const streamCount = main?.children.length || 0;
    if (!main || streamCount === 0) return;

    const { width, height } = multiview.getBoundingClientRect();
    if (width === 0 || height === 0) return;

    const rootFontSize =
      Number.parseFloat(getComputedStyle(document.documentElement).fontSize) ||
      16;
    const tileMargin = rootFontSize * 0.4;
    const footer = multiview.querySelector("footer");
    const overlayVisible =
      !footer ||
      Number.parseFloat(getComputedStyle(footer).opacity) > 0.05;
    const visibleTopReserve = clamp(height * 0.105, 40, 84);
    const visibleControlsReserve = clamp(height * 0.105, 44, 84);
    const visibleTrayHeight = clamp(height * 0.13, 52, 96);
    const topReserve = overlayVisible ? visibleTopReserve : 0;
    const controlsReserve = overlayVisible ? visibleControlsReserve : 0;
    const trayHeight = overlayVisible ? visibleTrayHeight : 0;
    const verticalGap = overlayVisible
      ? clamp(height * 0.018, 8, 16)
      : 0;
    const sideReserve = overlayVisible
      ? clamp(width * 0.015, 12, 24)
      : 0;
    const contentHeight = Math.max(
      64,
      height -
        topReserve -
        controlsReserve -
        trayHeight -
        verticalGap,
    );
    const contentWidth = Math.max(160, width - sideReserve * 2);
    let mainWidth = contentWidth;

    if (streamCount === 1) {
      const widthForSingleRow =
        (Math.max(32, contentHeight - tileMargin * 2) * (16 / 9)) /
        0.97;
      mainWidth = Math.min(contentWidth, widthForSingleRow);
    } else if (streamCount === 2) {
      const widthForSingleRow =
        (Math.max(32, contentHeight - tileMargin * 2) * (16 / 9)) /
        0.48;
      mainWidth = Math.min(contentWidth, widthForSingleRow);
    } else {
      const widthForTwoRows =
        (Math.max(32, contentHeight - tileMargin * 4) * (16 / 9)) /
        (0.48 * 2);
      mainWidth = Math.min(contentWidth, widthForTwoRows);
    }

    const mainLeft = Math.max(sideReserve, (width - mainWidth) / 2);
    setImportantStyles(multiview, { overflow: "hidden" });
    multiview.setAttribute(
      "data-kbo-plus-windowed-multiview-ui-visible",
      String(overlayVisible),
    );

    const gridContainer = main.parentElement;
    if (gridContainer && gridContainer !== multiview) {
      setImportantStyles(gridContainer, {
        top: "0",
        left: "0",
        width: "100%",
        height: "100%",
      });
    }

    setImportantStyles(main, {
      position: "absolute",
      top: `${topReserve}px`,
      left: `${mainLeft}px`,
      width: `${mainWidth}px`,
      height: `${contentHeight}px`,
      margin: "0",
      transition:
        "top 300ms ease, left 300ms ease, width 300ms ease, height 300ms ease",
    });

    for (const video of main.querySelectorAll("video")) {
      setImportantStyles(video, {
        "object-fit": "contain",
        "max-width": "100%",
        "max-height": "100%",
      });
    }

    if (footer) {
      const naturalFooterHeight =
        footer.offsetHeight || rootFontSize * 7.667;
      const footerScale = Math.min(
        1,
        visibleTrayHeight / naturalFooterHeight,
      );
      setImportantStyles(footer, {
        bottom: `${visibleControlsReserve}px`,
        transform: `scale(${footerScale})`,
        "transform-origin": "bottom center",
      });
    }

    const hint = Array.from(multiview.querySelectorAll("aside")).find(
      (element) => !main.contains(element),
    );
    if (hint) {
      const hintBottom =
        visibleControlsReserve +
        Math.max(0, (visibleTrayHeight - hint.offsetHeight) / 2);
      setImportantStyles(hint, {
        bottom: `${hintBottom}px`,
        opacity: overlayVisible ? "1" : "0",
        transition: "opacity 200ms ease",
      });
    }
  }

  function enforceWindowedLayout() {
    const multiview = document.querySelector(selectors.multiview);
    if (!fakeFullscreenActive || !multiview) {
      return;
    }

    observeMultiview(multiview);

    document.body?.classList.remove("fullscreen");

    const sportsPlayer = getSportsPlayer();
    if (
      sportsPlayer &&
      normalPlayerClassName &&
      sportsPlayer.className !== normalPlayerClassName
    ) {
      sportsPlayer.className = normalPlayerClassName;
    }

    applyResponsiveMultiviewLayout(multiview);
  }

  function isTalkOpen() {
    return /\/talk\/?$/.test(window.location.pathname);
  }

  function handleTriggerClick(event) {
    const button = event.currentTarget;
    if (
      button?.tagName !== "BUTTON" ||
      !button.hasAttribute(TRIGGER_ATTRIBUTE) ||
      !isNormalWindowedLayout()
    ) {
      return;
    }

    event.preventDefault();
    event.stopImmediatePropagation();
    void startWindowedMultiview();
  }

  function syncTrigger() {
    const button = getButton(selectors.multiviewButton);
    if (!button) return;

    if (!connectedButtons.has(button)) {
      button.addEventListener("click", handleTriggerClick, true);
      connectedButtons.add(button);
    }

    if (!isNormalWindowedLayout() || starting) {
      if (button.hasAttribute(TRIGGER_ATTRIBUTE)) {
        button.removeAttribute(TRIGGER_ATTRIBUTE);
      }
      return;
    }

    if (button.disabled) button.disabled = false;
    if (
      button.classList.contains("pointer-events-none") ||
      button.classList.contains("opacity-40")
    ) {
      button.classList.remove("pointer-events-none", "opacity-40");
    }
    if (!button.hasAttribute(TRIGGER_ATTRIBUTE)) {
      button.setAttribute(TRIGGER_ATTRIBUTE, "");
    }
  }

  async function exitWindowedLayout() {
    if (!fakeFullscreenActive) return;

    const exitButton = await waitFor(() =>
      getButton(selectors.fullscreenButton),
    ).catch(() => null);
    const shouldExitSiteFullscreen =
      siteFullscreenActive ||
      document.body?.classList.contains("fullscreen") ||
      exitButton?.getAttribute("aria-label") ===
        "\uC804\uCCB4\uD654\uBA74 \uC885\uB8CC";

    if (exitButton && shouldExitSiteFullscreen) {
      exitButton?.click();
      await waitFor(() =>
        getButton(selectors.fullscreenButton)?.getAttribute("aria-label") ===
        "\uC804\uCCB4\uD654\uBA74 \uC885\uB8CC"
          ? null
          : true,
      ).catch(() => null);
    }

    document.body?.classList.remove("fullscreen");
    const sportsPlayer = getSportsPlayer();
    if (sportsPlayer && normalPlayerClassName) {
      sportsPlayer.className = normalPlayerClassName;
    }

    fakeFullscreenActive = false;
    siteFullscreenActive = false;
    multiviewWasVisible = false;
    normalPlayerClassName = null;
    multiviewObserver?.disconnect();
    multiviewObserver = null;
    observedMultiview = null;
    setRootAttribute(ACTIVE_ATTRIBUTE, false);
    syncTrigger();
  }

  async function startWindowedMultiview() {
    if (starting || fakeFullscreenActive) return;
    starting = true;
    setRootAttribute(ACTIVE_ATTRIBUTE, true);
    const shouldCloseTalk = isTalkOpen();
    const sportsPlayer = getSportsPlayer();
    normalPlayerClassName = sportsPlayer?.className || null;

    try {
      const fullscreenButton = await waitFor(() =>
        getButton(selectors.fullscreenButton),
      );

      suppressNextFullscreen = true;
      fakeFullscreenActive = true;
      fullscreenButton.click();

      await waitFor(() =>
        document.body?.classList.contains("fullscreen") ? true : null,
      );
      siteFullscreenActive = true;

      const chatExitButton = shouldCloseTalk
        ? await waitFor(() => getButton(selectors.chatExitButton))
        : getButton(selectors.chatExitButton);

      if (chatExitButton) {
        chatExitButton.click();
        await waitFor(() =>
          getButton(selectors.chatExitButton) ? null : true,
        );
      }

      const multiviewButton = await waitFor(() => {
        const button = getButton(selectors.multiviewButton);
        return button && !button.disabled ? button : null;
      });
      multiviewButton.click();

      await waitFor(() => document.querySelector(selectors.multiview));
      multiviewWasVisible = true;
      enforceWindowedLayout();
    } catch (error) {
      console.warn("Failed to open windowed multiview", error);
      await exitWindowedLayout();
    } finally {
      suppressNextFullscreen = false;
      starting = false;
      queueSync();
    }
  }

  function syncMultiviewState() {
    const visible = Boolean(document.querySelector(selectors.multiview));
    if (visible) {
      multiviewWasVisible = true;
      enforceWindowedLayout();
      return;
    }

    if (fakeFullscreenActive && multiviewWasVisible && !starting) {
      void exitWindowedLayout();
    }
  }

  function syncState() {
    setRootAttribute(INSTALLED_ATTRIBUTE, true);
    syncTrigger();
    syncMultiviewState();
  }

  function queueSync() {
    if (syncQueued) return;
    syncQueued = true;

    queueMicrotask(() => {
      syncQueued = false;
      syncState();
    });
  }

  window.setInterval(syncState, SYNC_INTERVAL);
  syncState();
})();

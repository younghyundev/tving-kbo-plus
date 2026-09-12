import selectors from "../constant/selectors";
import { setStyleElement, waitForElement } from "./dom";

const BUTTON_ID = "kbo-plus-live-sync-btn";
const STYLE_ID = "kbo-plus-live-sync-style";
const DELAY_UPDATE_INTERVAL = 1000;
const SVG_NAMESPACE = "http://www.w3.org/2000/svg";
const DELAY_PLACEHOLDER_PREFIX = "지연시간:";

let delayIntervalId: number | null = null;
let syncButton: HTMLButtonElement | null = null;
let activeTextarea: HTMLTextAreaElement | null = null;
let activeVideo: HTMLVideoElement | null = null;
let activeContainer: HTMLElement | null = null;
let originalPlaceholder = "";
let originalContainerPosition = "";
let liveSyncGeneration = 0;

function getCurrentVideo(): HTMLVideoElement | null {
  if (activeVideo?.isConnected) return activeVideo;
  activeVideo = document.querySelector<HTMLVideoElement>(selectors.VIDEO);
  return activeVideo;
}

function getDelay(video: HTMLVideoElement): number | null {
  if (!Number.isFinite(video.duration)) return null;
  return video.duration - video.currentTime;
}

function seekToLive(video: HTMLVideoElement): void {
  if (!Number.isFinite(video.duration)) return;
  video.currentTime = Math.max(0, video.duration - 0.5);
}

function handleClick(event: MouseEvent): void {
  event.preventDefault();
  event.stopPropagation();

  const video = getCurrentVideo();
  if (!video) return;

  const delay = getDelay(video);
  if (delay !== null && delay >= 5) seekToLive(video);
}

function updateDelayIndicator(): void {
  if (!syncButton?.isConnected || !activeTextarea?.isConnected) {
    disposeLiveSync();
    return;
  }

  const video = getCurrentVideo();
  if (!video) return;

  const delay = getDelay(video);
  if (delay === null) return;

  const nextPlaceholder = `${DELAY_PLACEHOLDER_PREFIX} ${delay.toFixed(1)}초`;
  if (activeTextarea.placeholder !== nextPlaceholder) {
    activeTextarea.placeholder = nextPlaceholder;
  }
}

function startDelayIndicator(): void {
  if (delayIntervalId !== null) return;

  updateDelayIndicator();
  delayIntervalId = window.setInterval(
    updateDelayIndicator,
    DELAY_UPDATE_INTERVAL,
  );
}

function createFastForwardIcon(): SVGSVGElement {
  const icon = document.createElementNS(SVG_NAMESPACE, "svg");
  icon.setAttribute("aria-hidden", "true");
  icon.setAttribute("width", "14");
  icon.setAttribute("height", "14");
  icon.setAttribute("viewBox", "0 0 24 24");
  icon.setAttribute("fill", "none");
  icon.setAttribute("stroke", "currentColor");
  icon.setAttribute("stroke-width", "2.5");
  icon.setAttribute("stroke-linecap", "round");
  icon.setAttribute("stroke-linejoin", "round");

  for (const points of ["13 19 22 12 13 5 13 19", "2 19 11 12 2 5 2 19"]) {
    const polygon = document.createElementNS(SVG_NAMESPACE, "polygon");
    polygon.setAttribute("points", points);
    icon.appendChild(polygon);
  }

  return icon;
}

function createSyncButton(): HTMLButtonElement {
  const button = document.createElement("button");
  button.id = BUTTON_ID;
  button.type = "button";
  button.setAttribute("aria-label", "라이브 동기화");
  button.title = "라이브 동기화";
  button.appendChild(createFastForwardIcon());
  button.addEventListener("click", handleClick);
  return button;
}

function ensureSyncButtonStyle(): void {
  setStyleElement(
    STYLE_ID,
    `
      #${BUTTON_ID} {
        position: absolute;
        top: 50%;
        right: 3.2rem;
        z-index: 10;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 2.333rem;
        height: 2.333rem;
        padding: 0;
        color: #000000;
        background: #808080;
        border: 0;
        border-radius: 50%;
        cursor: pointer;
        touch-action: manipulation;
        transform: translateY(-50%);
        transition: background-color 200ms ease;
      }

      #${BUTTON_ID}:hover {
        background: #6b6b6b;
      }

      #${BUTTON_ID}:focus-visible {
        outline: 2px solid #ffffff;
        outline-offset: 2px;
      }

      @media (prefers-reduced-motion: reduce) {
        #${BUTTON_ID} {
          transition-duration: 0.01ms;
        }
      }
    `,
  );
}

export function disposeLiveSync(): void {
  liveSyncGeneration += 1;
  if (delayIntervalId !== null) {
    window.clearInterval(delayIntervalId);
    delayIntervalId = null;
  }
  syncButton?.removeEventListener("click", handleClick);
  syncButton?.remove();
  syncButton = null;

  if (activeContainer?.style.position === "relative") {
    activeContainer.style.position = originalContainerPosition;
  }
  activeContainer = null;
  originalContainerPosition = "";

  if (
    activeTextarea?.isConnected &&
    activeTextarea.placeholder.startsWith(DELAY_PLACEHOLDER_PREFIX)
  ) {
    activeTextarea.placeholder = originalPlaceholder;
  }
  activeTextarea = null;
  activeVideo = null;
  originalPlaceholder = "";
  setStyleElement(STYLE_ID, "", false);
}

export async function initLiveSync(): Promise<void> {
  if (syncButton?.isConnected) return;
  disposeLiveSync();
  const currentGeneration = liveSyncGeneration;

  const textarea = await waitForElement<HTMLTextAreaElement>(
    selectors.CHAT_TEXTAREA,
    10000,
  );
  if (!textarea || currentGeneration !== liveSyncGeneration) return;

  const container = textarea.closest<HTMLElement>("div.relative");
  if (!container) return;

  document.getElementById(BUTTON_ID)?.remove();
  ensureSyncButtonStyle();
  activeTextarea = textarea;
  originalPlaceholder = textarea.placeholder;
  activeVideo = document.querySelector<HTMLVideoElement>(selectors.VIDEO);
  activeContainer = container;
  originalContainerPosition = container.style.position;
  syncButton = createSyncButton();
  container.style.position = "relative";
  container.appendChild(syncButton);
  startDelayIndicator();
}

import { getVideoElement } from "./get";
import { waitForElement } from "./dom";

const CHAT_TEXTAREA_SELECTOR = "#live-chat-textarea";
const BUTTON_ID = "kbo-plus-live-sync-btn";
const DELAY_UPDATE_INTERVAL = 1000;

let delayIntervalId: ReturnType<typeof setInterval> | null = null;

async function getDelay(): Promise<number | null> {
  const video = await getVideoElement();
  if (!video) return null;

  const { duration, currentTime } = video;
  if (!isFinite(duration)) return null;

  return duration - currentTime;
}

function updatePlaceholder(textarea: HTMLTextAreaElement, delay: number) {
  textarea.placeholder = `지연시간: ${delay.toFixed(1)}초`;
}

async function seekToLive() {
  const video = await getVideoElement();
  if (!video || !isFinite(video.duration)) return;

  video.currentTime = video.duration - 0.5;
  console.log("[TVING KBO PLUS] 라이브 최신 지점으로 이동");
}

async function handleClick() {
  const delay = await getDelay();

  if (delay !== null && delay >= 5) {
    await seekToLive();
  }
}

function startDelayIndicator() {
  if (delayIntervalId !== null) return;

  delayIntervalId = setInterval(async () => {
    const textarea = document.querySelector<HTMLTextAreaElement>(
      CHAT_TEXTAREA_SELECTOR,
    );
    if (!textarea) return;

    const delay = await getDelay();
    if (delay !== null) {
      updatePlaceholder(textarea, delay);
    }
  }, DELAY_UPDATE_INTERVAL);
}

function createSyncButton(): HTMLButtonElement {
  const btn = document.createElement("button");
  btn.id = BUTTON_ID;
  btn.type = "button";
  btn.title = "라이브 동기화 (빨리감기)";
  btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 19 22 12 13 5 13 19"/><polygon points="2 19 11 12 2 5 2 19"/></svg>`;

  btn.style.cssText = `
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 2.333rem;
    width: 2.333rem;
    background: #808080;
    border: none;
    border-radius: 50%;
    right: 3.2rem;
    top: 50%;
    transform: translateY(-50%);
    cursor: pointer;
    color: #000;
    transition: background-color 200ms;
    z-index: 10;
  `;

  btn.addEventListener("mouseenter", () => {
    btn.style.background = "#6B6B6B";
  });
  btn.addEventListener("mouseleave", () => {
    btn.style.background = "#808080";
  });

  btn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    handleClick();
  });

  return btn;
}

export async function initLiveSync() {
  const textarea = await waitForElement(CHAT_TEXTAREA_SELECTOR, 10000);
  if (!textarea) return;

  const container = textarea.closest("div.relative") as HTMLElement;
  if (!container) return;

  if (document.getElementById(BUTTON_ID)) return;

  container.style.position = "relative";
  container.appendChild(createSyncButton());

  // 지연시간 자동 갱신 시작
  startDelayIndicator();
}

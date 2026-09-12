import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import selectors from "../../constant/selectors";
import { hideLikeButton } from "../../options/heart-button";
import { hideNickname } from "../../options/hide-nickname";
import { initLiveSync } from "../live-sync";

describe("현재 TVING DOM 호환성", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    document.head.innerHTML = "";
    document.body.innerHTML = `
      <section class="sports-player">
        <div class="cjp-root">
          <video id="tving-player-1"></video>
          <div class="con__space-center"></div>
          <button class="con__fullscreen"></button>
        </div>
      </section>
      <div class="group/message" data-case="with-team">
        <span class="mr-[0.333rem] inline-flex align-middle">
          <img src="https://image.tving.com/ntgs/badge/kbo/HH.webp" alt="" />
        </span>
        <span class="align-middle text-gray-600">nickname</span>
        <span class="ml-[0.17rem]"><img alt="profile badge" /></span>
        <span class="message">message</span>
      </div>
      <div class="group/message" data-case="without-team">
        <span class="align-middle text-gray-600">nickname</span>
        <span class="ml-[0.17rem]"><img alt="profile badge" /></span>
        <span class="message">message</span>
      </div>
      <div id="live-chat-form-box">
        <div class="relative">
          <textarea aria-label="메시지 입력"></textarea>
        </div>
      </div>
      <button aria-label="좋아요"></button>
    `;
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it("현행 플레이어와 채팅 요소를 찾는다", () => {
    expect(document.querySelector(selectors.VIDEO)).not.toBeNull();
    expect(document.querySelector(selectors.PLAYER_CONTAINER)).not.toBeNull();
    expect(document.querySelector(selectors.PLAYER_WRAP)).not.toBeNull();
    expect(document.querySelector(selectors.CHAT_TEXTAREA)).not.toBeNull();
    expect(document.querySelectorAll(selectors.CHAT_MESSAGE)).toHaveLength(2);
  });

  it("좋아요와 닉네임 숨김 처리를 현행 DOM에 적용한다", async () => {
    await hideLikeButton(true);
    hideNickname(true);

    expect(document.getElementById("kbo-plus-hide-like-style")).not.toBeNull();
    expect(
      document.getElementById("kbo-plus-hide-nickname-style"),
    ).not.toBeNull();
    expect(document.querySelectorAll(".kbo-plus-unknown-badge")).toHaveLength(0);
    expect(
      document.querySelector(
        '[data-case="with-team"] .kbo-plus-unknown-badge',
      ),
    ).toBeNull();

    expect(
      document.querySelector('[data-case="with-team"] img[src*="/badge/kbo/"]'),
    ).not.toBeNull();
  });

  it("현행 채팅 입력창에 라이브 동기화 버튼을 추가한다", async () => {
    await initLiveSync();

    expect(document.getElementById("kbo-plus-live-sync-btn")).not.toBeNull();
  });
});

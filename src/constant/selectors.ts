export default {
  LIKE_BUTTON:
    'button[aria-label="좋아요"], #live-chat-form-box > div.absolute',
  AD_BUTTON:
    '[class*="PcAdvertisementLinkButton"][class*="advertisementLinkButton"], .PcAdvertisementLinkButton_advertisementLinkButton__tyCiu',
  MUTE_BUTTON: 'button[aria-label="음소거"]',
  UNMUTE_BUTTON: 'button[aria-label="음소거 해제"]',
  VIDEO: 'video[id^="tving-player"], video',
  PLAYER_CONTAINER: ".sports-player, .player-container",
  SPACE: ".con__space-center", // 툴바 가운데 기준점
  PLAYER_WRAP: ".sports-player .cjp-root, .player-wrap",
  FULLSCREEN_BUTTON: ".con__fullscreen",
  CHAT_TEXTAREA:
    'textarea[aria-label="메시지 입력"], #live-chat-textarea',
  CHAT_MESSAGE: ".group\\/message, .group\\/item",
  CHAT_NICKNAME:
    ":scope > span.align-middle.text-gray-600, :scope > span.text-\\[\\#808080\\]",
  CHAT_TEAM_BADGE:
    'img[src*="/badge/kbo/"], span.ml-\\[0\\.333rem\\] img',
  SPORTS_GAME_ROOT: "#sports-game-scroll-root",
  SPORTS_GNB: "#TVING-SPORTS-GNB",
  SPORTS_TYPE_HEADER:
    "#sports-game-scroll-root > main > .hidden-in-fullscreen-mode.contents > header",
} as const;

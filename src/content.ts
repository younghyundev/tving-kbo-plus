import selectors from "./constant/selectors";
import { autoMuteOnAd } from "./options/auto-mute-ad";
import { addCinemaButton } from "./options/cinema-mode";
import { hideLikeButton } from "./options/heart-button";
import { hideCompanionAd } from "./options/hide-companion-ad";
import { hideNickname } from "./options/hide-nickname";
import { hideTopNavigation } from "./options/hide-top-navigation";
import { enableLiveSync } from "./options/live-sync";
import { addPipButton } from "./options/pip";
import { addRecordButton } from "./options/record";
import { addScreenshotButton } from "./options/screenshot";
import { loadSettings } from "./settings";
import type { SettingKey, Settings } from "./types";
import { waitForElement } from "./utils/dom";

interface SettingInitializer {
  key: SettingKey;
  initialize: (enabled: boolean) => unknown;
}

const SETTING_INITIALIZERS = [
  { key: "hideLikeButton", initialize: hideLikeButton },
  { key: "autoMuteOnAd", initialize: autoMuteOnAd },
  { key: "addScreenshot", initialize: addScreenshotButton },
  { key: "addRecord", initialize: addRecordButton },
  { key: "addCinemaMode", initialize: addCinemaButton },
  { key: "addPip", initialize: addPipButton },
  { key: "enableLiveSync", initialize: enableLiveSync },
  { key: "hideNickname", initialize: hideNickname },
  { key: "hideTopNavigation", initialize: hideTopNavigation },
] as const satisfies readonly SettingInitializer[];

function applySettings(settings: Settings): void {
  for (const { key, initialize } of SETTING_INITIALIZERS) {
    void initialize(settings[key]);
  }
}

async function initializeContentScript(): Promise<void> {
  hideCompanionAd();

  const [settings, video] = await Promise.all([
    loadSettings(),
    waitForElement<HTMLVideoElement>(selectors.VIDEO),
  ]);
  if (!video) {
    console.warn("[TVING KBO PLUS] 비디오 요소를 찾지 못했습니다.");
    return;
  }

  applySettings(settings);
}

void initializeContentScript().catch((error: unknown) => {
  console.error("[TVING KBO PLUS] 초기화에 실패했습니다.", error);
});

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
import { unmountAllControls } from "./options/mount-control";
import { loadSettings } from "./settings";
import type { SettingKey, Settings } from "./types";
import { waitForElement } from "./utils/dom";
import { stopRecording } from "./utils/record";

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

async function applySettings(settings: Settings): Promise<void> {
  await Promise.all(
    SETTING_INITIALIZERS.map(({ key, initialize }) =>
      Promise.resolve(initialize(settings[key])),
    ),
  );
}

export async function initializeContentFeatures(
  sportsRoot: HTMLElement,
): Promise<void> {
  hideCompanionAd();

  const [settings, video] = await Promise.all([
    loadSettings(),
    waitForElement<HTMLVideoElement>(selectors.VIDEO, 5000, sportsRoot),
  ]);
  if (!video || !sportsRoot.isConnected) {
    console.warn("[TVING KBO PLUS] 비디오 요소를 찾지 못했습니다.");
    return;
  }

  await applySettings(settings);
}

export function disposeContentFeatures(): void {
  stopRecording();
  unmountAllControls();
  void autoMuteOnAd(false);
  enableLiveSync(false);
  hideTopNavigation(false);
  hideLikeButton(false);
  hideNickname(false);
}

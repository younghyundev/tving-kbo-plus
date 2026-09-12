import selectors from "./constant/selectors";
import { autoMuteOnAd } from "./options/auto-mute-ad";
import { addCinemaButton } from "./options/cinema-mode";
import { hideLikeButton } from "./options/heart-button";
import { hideNickname } from "./options/hide-nickname";
import { hideTopNavigation } from "./options/hide-top-navigation";
import { enableLiveSync } from "./options/live-sync";
import { addPipButton } from "./options/pip";
import { addRecordButton } from "./options/record";
import { addScreenshotButton } from "./options/screenshot";
import { DEFAULT_SETTINGS, Settings } from "./types";

class Content {
  private settings: Settings = { ...DEFAULT_SETTINGS };

  constructor() {
    console.log("initialize");
    this.initialize();
  }

  private async initialize() {
    try {
      const result = await chrome.storage.sync.get("tvingSettings");
      this.settings = {
        ...DEFAULT_SETTINGS,
        ...(result.tvingSettings as Partial<Settings> | undefined),
      };
      this.waitForVideoElement();
    } catch (e) {
      console.log(e);
    }
  }

  private waitForVideoElement() {
    let observer: MutationObserver | undefined;
    const applyWhenReady = () => {
      if (!document.querySelector(selectors.VIDEO)) return false;

      observer?.disconnect();
      this.applySettings();
      return true;
    };

    if (applyWhenReady()) return;

    observer = new MutationObserver(applyWhenReady);

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  private applySettings() {
    hideLikeButton(this.settings.hideLikeButton);
    autoMuteOnAd(this.settings.autoMuteOnAd);
    addScreenshotButton(this.settings.addScreenshot);
    addRecordButton(this.settings.addRecord);
    addCinemaButton(this.settings.addCinemaMode);
    addPipButton(this.settings.addPip);
    enableLiveSync(this.settings.enableLiveSync);
    hideNickname(this.settings.hideNickname);
    hideTopNavigation(this.settings.hideTopNavigation);
  }
}

new Content();

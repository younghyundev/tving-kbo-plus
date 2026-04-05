export interface Settings {
  hideLikeButton: boolean;
  autoMuteOnAd: boolean;
  addScreenshot: boolean;
  addRecord: boolean;
  addCinemaMode: boolean;
  addPip: boolean;
  enableLiveSync: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  hideLikeButton: false,
  autoMuteOnAd: false,
  addScreenshot: true,
  addRecord: false,
  addCinemaMode: true,
  addPip: true,
  enableLiveSync: true,
};

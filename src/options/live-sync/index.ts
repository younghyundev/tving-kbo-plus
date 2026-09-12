import { disposeLiveSync, initLiveSync } from "../../utils/live-sync";

export function enableLiveSync(enabled: boolean): void {
  if (!enabled) {
    disposeLiveSync();
    return;
  }
  void initLiveSync();
}

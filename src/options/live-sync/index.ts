import { initLiveSync } from "../../utils/live-sync";

export function enableLiveSync(enabled: boolean) {
  if (!enabled) return;
  initLiveSync();
}

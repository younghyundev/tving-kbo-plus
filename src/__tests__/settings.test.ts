import { describe, expect, it } from "vitest";
import { loadSettings } from "../settings";
import {
  DEFAULT_SETTINGS,
  SETTINGS_STORAGE_KEY,
  type Settings,
} from "../types";

describe("settings", () => {
  it("저장된 boolean 값만 반영하고 나머지는 기본값을 사용한다", async () => {
    await chrome.storage.sync.set({
      [SETTINGS_STORAGE_KEY]: {
        addRecord: true,
        addPip: "invalid",
        unknownSetting: true,
      },
    });

    const settings = await loadSettings();

    expect(settings).toEqual<Settings>({
      ...DEFAULT_SETTINGS,
      addRecord: true,
    });
  });
});

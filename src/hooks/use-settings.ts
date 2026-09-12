import { useCallback, useEffect, useRef, useState } from "react";
import { loadSettings, saveSettings } from "../settings";
import { DEFAULT_SETTINGS, type SettingKey, type Settings } from "../types";

interface UseSettingsResult {
  settings: Settings | null;
  toggleSetting: (key: SettingKey) => void;
}

export function useSettings(): UseSettingsResult {
  const [settings, setSettings] = useState<Settings | null>(null);
  const settingsRef = useRef<Settings | null>(null);

  useEffect(() => {
    let active = true;

    void loadSettings()
      .then((loadedSettings) => {
        if (!active) return;
        settingsRef.current = loadedSettings;
        setSettings(loadedSettings);
      })
      .catch((error: unknown) => {
        console.error("[TVING KBO PLUS] 설정을 불러오지 못했습니다.", error);
        if (!active) return;

        const defaultSettings = { ...DEFAULT_SETTINGS };
        settingsRef.current = defaultSettings;
        setSettings(defaultSettings);
      });

    return () => {
      active = false;
    };
  }, []);

  const toggleSetting = useCallback((key: SettingKey) => {
    const currentSettings = settingsRef.current;
    if (!currentSettings) return;

    const nextSettings = {
      ...currentSettings,
      [key]: !currentSettings[key],
    };
    settingsRef.current = nextSettings;
    setSettings(nextSettings);

    void saveSettings(nextSettings).catch((error: unknown) => {
      console.error("[TVING KBO PLUS] 설정을 저장하지 못했습니다.", error);
    });
  }, []);

  return { settings, toggleSetting };
}

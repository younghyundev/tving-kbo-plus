import * as S from "./App.styled";
import { useSettings } from "./hooks/use-settings";
import type { SettingKey } from "./types";

interface SettingDefinition {
  key: SettingKey;
  label: string;
}

const SETTING_DEFINITIONS = [
  { key: "hideLikeButton", label: "좋아요 버튼 숨기기" },
  { key: "autoMuteOnAd", label: "광고 시 자동 음소거" },
  { key: "addScreenshot", label: "스크린샷 버튼 활성화" },
  { key: "addRecord", label: "녹화 버튼 활성화" },
  { key: "addCinemaMode", label: "영화관 모드 버튼 활성화" },
  { key: "addPip", label: "PIP 모드 버튼 활성화" },
  { key: "hideNickname", label: "채팅 닉네임 숨기기" },
  { key: "hideTopNavigation", label: "상단 메뉴 숨기기" },
  { key: "enableLiveSync", label: "채팅창에 지연시간 표기" },
] as const satisfies readonly SettingDefinition[];

interface SettingToggleProps {
  checked: boolean;
  definition: SettingDefinition;
  onToggle: (key: SettingKey) => void;
}

function SettingToggle({ checked, definition, onToggle }: SettingToggleProps) {
  const labelId = `setting-${definition.key}`;

  return (
    <S.SettingRow>
      <S.Label id={labelId}>{definition.label}</S.Label>
      <S.ToggleButton
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={labelId}
        $isActive={checked}
        onClick={() => onToggle(definition.key)}
      />
    </S.SettingRow>
  );
}

function App() {
  const { settings, toggleSetting } = useSettings();

  if (!settings) return null;

  return (
    <S.Container aria-labelledby="extension-title">
      <S.GlobalStyle />
      <S.Title id="extension-title" translate="no">
        TVING KBO PLUS
      </S.Title>
      <S.Notice>설정 변경 후 새로고침해야 적용됩니다.</S.Notice>
      <S.SettingsList>
        {SETTING_DEFINITIONS.map((definition) => (
          <SettingToggle
            key={definition.key}
            checked={settings[definition.key]}
            definition={definition}
            onToggle={toggleSetting}
          />
        ))}
      </S.SettingsList>
    </S.Container>
  );
}

export default App;

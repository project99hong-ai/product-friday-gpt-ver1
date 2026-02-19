import { useTapStore } from "../../store/useTapStore.js";

export const tap = {
  id: "settings",
  label: "설정",
  title: "환경 설정",
  description: "TAP별 선호도나 관심사를 저장하는 설정 공간. 가벼운 상태 관리로 유지합니다.",
  Component: function Settings() {
    const { preferences, setPreference } = useTapStore();
    const current = preferences.memo?.focus ?? "";

    return (
      <div className="settings">
        <label className="field">
          <span>메모 탭의 관심사</span>
          <input
            type="text"
            value={current}
            onChange={(event) => setPreference("memo", "focus", event.target.value)}
            placeholder="예: 제품 전략, 브랜드 톤"
          />
        </label>
        <p className="tap-text">저장된 값: {current || "(아직 없음)"}</p>
      </div>
    );
  },
};

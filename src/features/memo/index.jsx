export const tap = {
  id: "memo",
  label: "메모",
  title: "오늘의 메모",
  description: "핵심 아이디어를 스케치하는 공간. 손으로 쓴 듯한 탭으로 빠르게 이동합니다.",
  Component: function Memo() {
    return (
      <div>
        <p className="tap-text">
          회의에서 떠오른 문장, 짧은 스케치를 기록합니다. TAP은 독립 모듈이라
          확장 시 기존 코드에 영향이 없습니다.
        </p>
      </div>
    );
  },
};

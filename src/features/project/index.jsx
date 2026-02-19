export const tap = {
  id: "project",
  label: "프로젝트",
  title: "진행 중 프로젝트",
  description: "탭은 각각 독립적인 TAP 모듈로 구성되어, 새로운 섹션이 추가되어도 영향을 최소화합니다.",
  Component: function Project() {
    return (
      <div>
        <ul className="tap-list">
          <li>BRD 정리 및 일정 확정</li>
          <li>와이어프레임 피드백 반영</li>
          <li>콘셉트 컬러 테스트</li>
        </ul>
      </div>
    );
  },
};

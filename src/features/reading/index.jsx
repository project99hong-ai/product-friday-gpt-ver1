export const tap = {
  id: "reading",
  label: "읽기",
  title: "리딩 리스트",
  description: "읽어야 할 글이나 레퍼런스를 정리하는 자리. 관심 주제는 상태 스토어에 저장됩니다.",
  Component: function Reading() {
    return (
      <div>
        <ul className="tap-list">
          <li>노이즈 패턴과 종이 질감 리서치</li>
          <li>스크랩북 스타일 UI 사례</li>
          <li>모듈형 콘텐츠 구조 설계</li>
        </ul>
      </div>
    );
  },
};

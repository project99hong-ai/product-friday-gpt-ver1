export const tap = {
  id: "ideas",
  label: "아이디어",
  title: "아이디어 보드",
  description: "생각을 적고 분류할 수 있는 작업 공간. 탭 전환 시 종이가 넘어가는 느낌의 페이드가 적용됩니다.",
  Component: function Ideas() {
    return (
      <div className="chip-wrap">
        <span className="chip">즉시 적기</span>
        <span className="chip">모눈 노트</span>
        <span className="chip">빠른 분류</span>
        <span className="chip">주간 아이디어</span>
      </div>
    );
  },
};

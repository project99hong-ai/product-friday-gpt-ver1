export const tap = {
  id: "inspire",
  label: "영감",
  title: "영감 수집",
  description: "사진, 색감, 문구를 스크랩하는 공간. 손그림 탭이 프레임 역할을 합니다.",
  Component: function Inspire() {
    return (
      <div className="swatch-grid">
        <div className="swatch" style={{ background: "#f6d9c4" }} />
        <div className="swatch" style={{ background: "#d5e6f7" }} />
        <div className="swatch" style={{ background: "#f7efc6" }} />
        <div className="swatch" style={{ background: "#dfe8d1" }} />
      </div>
    );
  },
};

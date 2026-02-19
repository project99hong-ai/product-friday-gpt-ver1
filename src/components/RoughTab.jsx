import { useEffect, useRef } from "react";
import rough from "roughjs/bundled/rough.esm.js";

export default function RoughTab({ label, active, onClick }) {
  const buttonRef = useRef(null);
  const svgRef = useRef(null);

  useEffect(() => {
    const button = buttonRef.current;
    const svg = svgRef.current;
    if (!button || !svg) return;

    const draw = () => {
      const { width, height } = button.getBoundingClientRect();
      if (!width || !height) return;

      svg.innerHTML = "";
      svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
      const rc = rough.svg(svg);
      const shape = rc.rectangle(3, 3, Math.max(0, width - 6), Math.max(0, height - 6), {
        roughness: 1.4,
        stroke: "#2b2b2b",
        strokeWidth: 1.6,
        fill: active ? "rgba(255, 235, 178, 0.7)" : "rgba(255, 255, 255, 0.0)",
        fillStyle: "solid",
      });
      svg.appendChild(shape);
    };

    draw();
    const observer = new ResizeObserver(draw);
    observer.observe(button);
    return () => observer.disconnect();
  }, [active, label]);

  return (
    <button ref={buttonRef} type="button" className={`tab ${active ? "is-active" : ""}`} onClick={onClick}>
      <span>{label}</span>
      <svg ref={svgRef} aria-hidden="true" />
    </button>
  );
}

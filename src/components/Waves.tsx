// Decorative flowing waves, echoing the conference poster. Pure SVG, no JS.
// Renders a band of red + blue ribbons. Use `flip` to mirror it vertically.

const LINES = Array.from({ length: 11 }, (_, i) => {
  const y = 30 + i * 9;
  const color = i % 2 === 0 ? "var(--color-blue)" : "var(--color-red)";
  const opacity = 0.35 + (i % 3) * 0.2;
  const width = 3 + (i % 3);
  return { y, color, opacity, width };
});

export default function Waves({ className = "", flip = false }: { className?: string; flip?: boolean }) {
  return (
    <svg
      viewBox="0 0 1200 160"
      preserveAspectRatio="none"
      aria-hidden="true"
      className={className}
      style={flip ? { transform: "scaleY(-1)" } : undefined}
    >
      {LINES.map((l, i) => (
        <path
          key={i}
          d={`M -40 ${l.y} C 200 ${l.y - 42} 420 ${l.y + 42} 620 ${l.y} C 820 ${l.y - 42} 1040 ${l.y + 42} 1240 ${l.y}`}
          fill="none"
          stroke={l.color}
          strokeWidth={l.width}
          strokeLinecap="round"
          opacity={l.opacity}
        />
      ))}
    </svg>
  );
}

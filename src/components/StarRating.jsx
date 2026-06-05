import { useState } from "react";

/**
 * StarRating component
 * Props:
 *   value       - current rating (1–5)
 *   onChange    - called with new rating; if omitted, renders read-only
 *   size        - 'sm' | 'md' | 'lg'  (default 'md')
 */
export default function StarRating({ value = 0, onChange, size = "md" }) {
  const [hovered, setHovered] = useState(0);
  const interactive = typeof onChange === "function";

  const sizeMap = { sm: "1rem", md: "1.5rem", lg: "2rem" };
  const starStyle = { fontSize: sizeMap[size] ?? sizeMap.md, cursor: interactive ? "pointer" : "default" };

  const display = interactive ? hovered || value : value;

  return (
    <span style={{ display: "inline-flex", gap: "2px" }} aria-label={`${value} of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          style={{ ...starStyle, color: n <= display ? "#f5a623" : "#d1d5db" }}
          onClick={() => interactive && onChange(n)}
          onMouseEnter={() => interactive && setHovered(n)}
          onMouseLeave={() => interactive && setHovered(0)}
          role={interactive ? "button" : undefined}
          aria-label={interactive ? `Rate ${n} star${n > 1 ? "s" : ""}` : undefined}
        >
          ★
        </span>
      ))}
    </span>
  );
}
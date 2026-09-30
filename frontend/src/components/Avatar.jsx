import { useState } from "react";

const COLORS = ["#e91e63", "#9c27b0", "#3f51b5", "#009688", "#ff5722", "#795548", "#607d8b", "#1e88e5"];

/** Circular avatar with an initial-letter fallback when no image (or a broken one) is available. */
export default function Avatar({ src, name = "?", size = 36, className = "" }) {
  const [broken, setBroken] = useState(false);
  const style = { width: size, height: size, fontSize: size * 0.45 };
  if (src && !broken) {
    return <img src={src} alt={name} className={`avatar ${className}`} style={style} onError={() => setBroken(true)} />;
  }
  const color = COLORS[(name.charCodeAt(0) || 0) % COLORS.length];
  return (
    <span className={`avatar avatar--fallback ${className}`} style={{ ...style, background: color }} aria-label={name}>
      {name.charAt(0).toUpperCase()}
    </span>
  );
}

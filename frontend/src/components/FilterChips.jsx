import { useRef } from "react";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";

/** Horizontally scrollable category chips shown at the top of the home page. */
export default function FilterChips({ categories, active, onChange }) {
  const scroller = useRef(null);
  const scroll = (dir) => scroller.current?.scrollBy({ left: dir * 240, behavior: "smooth" });

  return (
    <div className="chips">
      <button className="chips__arrow chips__arrow--left" onClick={() => scroll(-1)} aria-label="Scroll left">
        <MdChevronLeft size={24} />
      </button>
      <div className="chips__track" ref={scroller} role="tablist" aria-label="Filter by category">
        {["All", ...categories].map((c) => (
          <button
            key={c}
            role="tab"
            aria-selected={active === c}
            className={`chip ${active === c ? "chip--active" : ""}`}
            onClick={() => onChange(c)}
          >
            {c}
          </button>
        ))}
      </div>
      <button className="chips__arrow chips__arrow--right" onClick={() => scroll(1)} aria-label="Scroll right">
        <MdChevronRight size={24} />
      </button>
    </div>
  );
}

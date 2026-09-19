"use client";

const Star = ({ fill = 1 }) => {
  // fill: 0..1
  const id = `g${Math.round(fill * 100)}`;
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <defs>
        <linearGradient id={id}>
          <stop offset={`${fill * 100}%`} stopColor="var(--rd-star, #100501)" />
          <stop offset={`${fill * 100}%`} stopColor="transparent" />
        </linearGradient>
      </defs>
      <path
        d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.4l-5.9 3.2 1.3-6.6L2.5 9.4l6.6-.8z"
        fill={fill >= 1 ? "var(--rd-star, #100501)" : fill <= 0 ? "transparent" : `url(#${id})`}
        stroke="var(--rd-star, #100501)"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
};

/** Read-only star row. `value` 0..5 (decimals allowed). */
export default function Stars({ value = 0, size = "", className = "" }) {
  const v = Math.max(0, Math.min(5, Number(value) || 0));
  return (
    <span className={`rd-stars ${size ? `rd-stars--${size}` : ""} ${className}`} aria-label={`${v} out of 5 stars`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <Star key={i} fill={Math.max(0, Math.min(1, v - i))} />
      ))}
    </span>
  );
}

/** Interactive star picker. */
export function StarInput({ value, onChange }) {
  return (
    <span className="rd-stars rd-stars--input" role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} star${n > 1 ? "s" : ""}`}
          onClick={() => onChange(n)}
        >
          <Star fill={n <= value ? 1 : 0} />
        </button>
      ))}
    </span>
  );
}

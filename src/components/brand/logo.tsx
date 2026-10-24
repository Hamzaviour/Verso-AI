// The Verso mark: two plates printed slightly out of register. Cyan is the
// left of the spectrum, magenta the right; where they overlap the ink goes
// solid. That lens is the product: the facts both sides print.

type MarkProps = {
  size?: number;
  mono?: boolean;
  className?: string;
  title?: string;
};

export const LENS_PATH = "M20 4.78 A11 11 0 0 1 20 23.22 A11 11 0 0 1 20 4.78 Z";

export function Mark({ size = 28, mono = false, className, title }: MarkProps) {
  return (
    <svg
      viewBox="0 0 40 28"
      width={(size * 40) / 28}
      height={size}
      className={className}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      {mono ? (
        <>
          <circle cx="14" cy="14" r="10.25" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="26" cy="14" r="10.25" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </>
      ) : (
        <>
          <circle cx="14" cy="14" r="11" fill="var(--cyan)" />
          <circle cx="26" cy="14" r="11" fill="var(--magenta)" />
        </>
      )}
      <path d={LENS_PATH} fill={mono ? "currentColor" : "var(--ink)"} />
    </svg>
  );
}

export function Wordmark({ className, size = 28 }: { className?: string; size?: number }) {
  return (
    <span
      className={`inline-flex items-center gap-[0.32em] font-sans font-extrabold leading-none tracking-[-0.045em] text-ink ${className ?? ""}`}
      style={{ fontSize: size, fontStretch: "112%" }}
    >
      <Mark size={size * 0.82} />
      <span>verso</span>
    </span>
  );
}

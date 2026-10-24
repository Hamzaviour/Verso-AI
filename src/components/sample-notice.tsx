import { FlaskConical } from "lucide-react";

export function SampleNotice({ className }: { className?: string }) {
  return (
    <div
      role="note"
      className={`flex items-start gap-3 border border-dashed border-ink-3 px-4 py-3 text-[13px] leading-relaxed text-ink-2 ${className ?? ""}`}
    >
      <FlaskConical size={16} strokeWidth={1.75} className="mt-0.5 shrink-0 text-ink-3" />
      <p>
        <strong className="font-semibold text-ink">Sample edition.</strong> The live pipeline has not produced analysed
        stories yet, so you are looking at a fictional event covered by fictional outlets. Real coverage replaces it after
        the first ingest run.
      </p>
    </div>
  );
}

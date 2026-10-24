import { groupClaims } from "@/lib/claims";
import { biasToPct, biasColor } from "@/lib/spectrum";
import type { ArticleView, Claim } from "@/lib/types";
import { OutletChips } from "./outlet-chips";

function SpreadBar({ claim, byId }: { claim: Claim; byId: Record<number, ArticleView> }) {
  const biases = [...new Map(claim.sources.map((id) => byId[id]).filter(Boolean).map((a) => [a.outlet.id, a.outlet.bias])).values()];
  if (!biases.length) return null;
  const min = Math.min(...biases);
  const max = Math.max(...biases);
  return (
    <span className="relative block h-[10px] w-full max-w-[140px]" aria-hidden>
      <span className="absolute inset-x-0 top-1/2 h-px bg-rule" />
      <span className="absolute top-1/2 left-1/2 h-[7px] w-px -translate-y-1/2 bg-ink-3" />
      <span
        className="absolute top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-ink/25"
        style={{ left: `${biasToPct(min)}%`, width: `${Math.max(0.5, biasToPct(max) - biasToPct(min))}%` }}
      />
      {biases.map((b, i) => (
        <span
          key={i}
          className="absolute top-1/2 size-[7px] -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-sheet"
          style={{ left: `${biasToPct(b)}%`, background: biasColor(b) }}
        />
      ))}
    </span>
  );
}

function ClaimRow({ claim, byId, tone }: { claim: Claim; byId: Record<number, ArticleView>; tone?: "contested" }) {
  return (
    <li className="grid gap-x-6 gap-y-2 border-t border-rule py-4 first:border-t-0 sm:grid-cols-[1fr_150px]">
      <div>
        <p className="font-serif text-[17px] leading-[1.45] text-ink">{claim.text}</p>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[12px] text-ink-3">
          <OutletChips ids={claim.sources} byId={byId} size="xs" label="Reported by" />
          {tone === "contested" && claim.contradictedBy.length > 0 && (
            <span className="inline-flex items-center gap-1.5">
              <span>disputed by</span>
              <OutletChips ids={claim.contradictedBy} byId={byId} size="xs" label="Disputed by" />
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center sm:justify-end">
        <SpreadBar claim={claim} byId={byId} />
      </div>
    </li>
  );
}

function Group({
  title,
  note,
  claims,
  byId,
  accent,
  tone,
}: {
  title: string;
  note: string;
  claims: Claim[];
  byId: Record<number, ArticleView>;
  accent: string;
  tone?: "contested";
}) {
  if (!claims.length) return null;
  return (
    <div className="bg-sheet px-5 pt-5 pb-2 shadow-[var(--shadow)] sm:px-7">
      <div className="flex items-baseline justify-between gap-4 border-b-2 pb-3" style={{ borderColor: accent }}>
        <h3 className="font-sans text-[15px] font-bold tracking-[-0.005em]">{title}</h3>
        <span className="tabular text-[12px] text-ink-3">{claims.length}</span>
      </div>
      <p className="mt-2 text-[13px] text-ink-3">{note}</p>
      <ul className="mt-1">
        {claims.map((c, i) => (
          <ClaimRow key={i} claim={c} byId={byId} tone={tone} />
        ))}
      </ul>
    </div>
  );
}

export function ClaimsLedger({ claims, byId }: { claims: Claim[]; byId: Record<number, ArticleView> }) {
  const g = groupClaims(claims);
  return (
    <section aria-labelledby="claims-heading" className="space-y-5">
      <div>
        <h2 id="claims-heading" className="font-serif text-[28px] leading-tight font-semibold tracking-[-0.01em]">
          What every side agrees on, and what it doesn’t
        </h2>
        <p className="mt-1 max-w-[62ch] text-[14px] text-ink-2">
          Each claim is attributed to the outlets that report it. Agreement is computed from where those outlets sit on
          the spectrum, not from the model’s opinion.
        </p>
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="lg:col-span-2">
          <Group
            title="Agreed facts"
            note="Reported by outlets on both sides of center, or by most outlets covering the story."
            claims={g.agreed}
            byId={byId}
            accent="var(--ink)"
          />
        </div>
        <Group
          title="Only on the left"
          note="Reported only by outlets left of center."
          claims={g.left}
          byId={byId}
          accent="var(--cyan)"
        />
        <Group
          title="Only on the right"
          note="Reported only by outlets right of center."
          claims={g.right}
          byId={byId}
          accent="var(--magenta)"
        />
        <Group title="Narrowly reported" note="Reported by a few outlets near the center." claims={g.partial} byId={byId} accent="var(--rule-strong)" />
        <Group
          title="Contested"
          note="At least one outlet reports something incompatible."
          claims={g.contested}
          byId={byId}
          accent="var(--yellow)"
          tone="contested"
        />
      </div>
    </section>
  );
}

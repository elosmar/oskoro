import type { ReactNode } from "react";
import type { Orientation } from "@/lib/data/constants";
import type { MoveView, SymbolLabels } from "@/lib/move-view";
import { cardStyles, cx } from "@/ui";
import { OrientationChip } from "./OrientationChip";
import { RichText } from "./RichText";
import { TypeBadge } from "./TypeBadge";

export interface MoveCardLabels {
  energy: string;
  damage: string;
  effect: string;
  noEffect: string;
  fanTranslation: string;
  showEffects: string;
}

export interface MoveCardProps {
  move: MoveView;
  symbols: SymbolLabels;
  labels: MoveCardLabels;
  /** Makes the card header a toggle button (e.g. select for the team). */
  onPress?: () => void;
  pressed?: boolean;
  disabled?: boolean;
  /** Face of the Charakoro to highlight in the effects list. */
  highlight?: Orientation | null;
  /** Start with the effects open. */
  defaultOpen?: boolean;
  /** Extra actions rendered under the card (e.g. "I used this move"). */
  footer?: ReactNode;
}

/**
 * Mimics the physical Wazacard: energy and damage on top, Japanese title as
 * the main title (what you see on the table), translation under it.
 */
export function MoveCard({
  move,
  symbols,
  labels,
  onPress,
  pressed = false,
  disabled = false,
  highlight = null,
  defaultOpen = false,
  footer,
}: MoveCardProps) {
  const header = (
    <div className="flex w-full flex-col gap-1 text-left">
      <div className="flex items-center justify-between">
        <span className="flex gap-1" aria-label={labels.energy}>
          {move.energy.map((type, i) => (
            <TypeBadge key={i} type={type} label={symbols.types[type]} />
          ))}
        </span>
        {move.damage !== null && (
          <span className="text-2xl font-extrabold tabular-nums">
            <span className="sr-only">{labels.damage}: </span>
            {move.damage}
          </span>
        )}
      </div>
      <p lang="ja" className="text-xl font-bold leading-tight">
        {move.japanese}
      </p>
      <p className="flex flex-wrap items-center gap-2 font-semibold">
        {move.name}
        {!move.official && (
          <span className="rounded-full border border-border px-2 py-0.5 text-[10px] font-medium text-muted">
            {labels.fanTranslation}
          </span>
        )}
      </p>
      <p className="text-[10px] tracking-wide text-muted">{move.code}</p>
    </div>
  );

  return (
    <article className={cx(cardStyles({ selected: pressed }), "flex flex-col gap-3")}>
      {onPress ? (
        <button
          type="button"
          onClick={onPress}
          aria-pressed={pressed}
          disabled={disabled}
          className="rounded-control transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {header}
        </button>
      ) : (
        header
      )}

      {/* Choosing a face opens the effects so the highlight is visible; the key
          remounts it so a later face change reopens it after a manual close. */}
      <details
        key={highlight ?? "none"}
        open={defaultOpen || highlight !== null}
        className="group border-t border-border pt-2 text-sm"
      >
        <summary className="cursor-pointer select-none text-muted marker:content-none">
          <span className="inline-block transition group-open:rotate-90" aria-hidden>
            ▸
          </span>{" "}
          {labels.showEffects}
        </summary>
        <dl className="mt-2 space-y-2">
          <div>
            <dt className="text-xs font-semibold text-muted">{labels.effect}</dt>
            <dd>{move.effect ? <RichText text={move.effect} symbols={symbols} /> : "—"}</dd>
          </div>
          {move.orientations.map(({ key, text }) => (
            <div
              key={key}
              data-highlighted={highlight === key || undefined}
              className={cx(
                "flex flex-col gap-1 rounded-control p-1",
                highlight === key && "bg-surface-muted ring-2 ring-accent",
              )}
            >
              <dt>
                <OrientationChip orientation={key} labels={symbols.orientations} highlighted={highlight === key} />
              </dt>
              <dd className={cx(!text && "text-muted")}>
                {text ? <RichText text={text} symbols={symbols} /> : labels.noEffect}
              </dd>
            </div>
          ))}
        </dl>
      </details>

      {footer}
    </article>
  );
}

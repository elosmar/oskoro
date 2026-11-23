import { MoveCard, type MoveCardLabels } from "@/components/MoveCard";
import type { MoveView, SymbolLabels } from "@/lib/move-view";

export interface MoveGridProps {
  moves: MoveView[];
  symbols: SymbolLabels;
  cardLabels: MoveCardLabels;
  selected?: readonly string[];
  /** Omit for a read-only list (static HTML before hydration). */
  onToggle?: (code: string) => void;
  /** When true, unselected cards can't be picked. */
  full?: boolean;
}

/** Presentational list of move cards. No hooks, so it also renders on the server. */
export function MoveGrid({ moves, symbols, cardLabels, selected = [], onToggle, full = false }: MoveGridProps) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {moves.map((move) => {
        const isSelected = selected.includes(move.code);
        return (
          <li key={move.code}>
            <MoveCard
              move={move}
              symbols={symbols}
              labels={cardLabels}
              onPress={onToggle && (() => onToggle(move.code))}
              pressed={isSelected}
              disabled={full && !isSelected}
            />
          </li>
        );
      })}
    </ul>
  );
}

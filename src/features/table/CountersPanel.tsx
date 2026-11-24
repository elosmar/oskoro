"use client";

import { useId } from "react";
import { format } from "@/lib/format";
import { START_HP, type GameState } from "@/lib/game-reducer";
import { Button, Stepper } from "@/ui";

export interface CountersTexts {
  turn: string;
  endTurn: string;
  endTurnNeedsMove: string;
  firstTurnHint: string;
  hp: string;
  decrease: string;
  increase: string;
}

export interface CountersPanelProps {
  state: GameState;
  texts: CountersTexts;
  onHp: (delta: number) => void;
  onEndTurn: () => void;
}

/** Presentational: turn (drives the blocked move) and a compact HP counter. */
export function CountersPanel({ state, texts, onHp, onEndTurn }: CountersPanelProps) {
  const hintId = useId();
  // Rules: you can't pass, so the turn ends only after marking the used move.
  const canEndTurn = state.usedMove !== null;
  return (
    <section className="space-y-3 rounded-card border border-border bg-surface p-3 shadow-card">
      <div className="flex items-center justify-between">
        <span className="font-bold">{format(texts.turn, { n: state.turn })}</span>
        <Button size="sm" onClick={onEndTurn} disabled={!canEndTurn} aria-describedby={canEndTurn ? undefined : hintId}>
          {texts.endTurn}
        </Button>
      </div>
      {!canEndTurn && (
        <p id={hintId} className="text-xs text-muted">
          {texts.endTurnNeedsMove}
        </p>
      )}
      {state.turn === 1 && <p className="text-xs text-muted">{texts.firstTurnHint}</p>}
      <Stepper
        label={texts.hp}
        value={state.hp}
        steps={[20, 10]}
        min={0}
        max={START_HP}
        onChange={onHp}
        decreaseLabel={texts.decrease}
        increaseLabel={texts.increase}
      />
    </section>
  );
}

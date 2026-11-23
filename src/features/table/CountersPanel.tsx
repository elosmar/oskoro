"use client";

import { format } from "@/lib/format";
import type { GameState } from "@/lib/game-reducer";
import { Button, Stepper } from "@/ui";

export interface CountersTexts {
  turn: string;
  endTurn: string;
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
  return (
    <section className="space-y-3 rounded-card border border-border bg-surface p-3 shadow-card">
      <div className="flex items-center justify-between">
        <span className="font-bold">{format(texts.turn, { n: state.turn })}</span>
        <Button size="sm" onClick={onEndTurn}>
          {texts.endTurn}
        </Button>
      </div>
      {state.turn === 1 && <p className="text-xs text-muted">{texts.firstTurnHint}</p>}
      <Stepper
        label={texts.hp}
        value={state.hp}
        steps={[20, 10]}
        onChange={onHp}
        decreaseLabel={texts.decrease}
        increaseLabel={texts.increase}
      />
    </section>
  );
}

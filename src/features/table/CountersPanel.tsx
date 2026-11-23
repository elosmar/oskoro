"use client";

import { format } from "@/lib/format";
import type { GameState } from "@/lib/game-reducer";
import { Button, SegmentedControl, Stepper } from "@/ui";

export interface CountersTexts {
  turn: string;
  endTurn: string;
  enekoro: string;
  enekoroHint: string;
  hp: string;
  whoStarts: string;
  meStarts: string;
  rivalStarts: string;
  decrease: string;
  increase: string;
}

export interface CountersPanelProps {
  state: GameState;
  texts: CountersTexts;
  onStarter: (starter: "me" | "rival") => void;
  onEnekoro: (delta: number) => void;
  onHp: (delta: number) => void;
  onEndTurn: () => void;
}

/** Presentational: Enekoro is the protagonist, HP stays compact. */
export function CountersPanel({ state, texts, onStarter, onEnekoro, onHp, onEndTurn }: CountersPanelProps) {
  return (
    <section className="space-y-3 rounded-card border border-border bg-surface p-3 shadow-card">
      <div className="flex items-center justify-between">
        <span className="font-bold">{format(texts.turn, { n: state.turn })}</span>
        <Button size="sm" onClick={onEndTurn}>
          {texts.endTurn}
        </Button>
      </div>

      {state.turn === 1 && state.starter === null && (
        <div className="space-y-1">
          <p className="text-sm font-semibold">{texts.whoStarts}</p>
          <SegmentedControl
            label={texts.whoStarts}
            value={null}
            onChange={onStarter}
            options={[
              { value: "me", label: texts.meStarts },
              { value: "rival", label: texts.rivalStarts },
            ]}
          />
        </div>
      )}

      <div className="flex flex-wrap items-end justify-around gap-4">
        <div className="flex flex-col items-center">
          <Stepper
            label={texts.enekoro}
            value={state.enekoro}
            onChange={onEnekoro}
            size="lg"
            decreaseLabel={texts.decrease}
            increaseLabel={texts.increase}
          />
          <p className="mt-1 max-w-48 text-center text-[11px] text-muted">{texts.enekoroHint}</p>
        </div>
        <Stepper
          label={texts.hp}
          value={state.hp}
          steps={[20, 10]}
          onChange={onHp}
          decreaseLabel={texts.decrease}
          increaseLabel={texts.increase}
        />
      </div>
    </section>
  );
}

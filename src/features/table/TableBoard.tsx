"use client";

import { useEffect, useReducer, useState } from "react";
import { MoveCard, type MoveCardLabels } from "@/components/MoveCard";
import { TypeBadge } from "@/components/TypeBadge";
import { ORIENTATIONS, type Orientation } from "@/lib/data/constants";
import { format } from "@/lib/format";
import { gameReducer, initialGameState } from "@/lib/game-reducer";
import type { MoveView, SymbolLabels } from "@/lib/move-view";
import { loadGame, saveGame } from "@/lib/session-store";
import type { TablePokemon } from "@/lib/table-view";
import { Button, SegmentedControl } from "@/ui";
import { CountersPanel, type CountersTexts } from "./CountersPanel";

export interface TableTexts extends CountersTexts {
  face: string;
  tabs: string;
  myCards: string;
  rivalCards: string;
  markUsed: string;
  used: string;
  blocked: string;
  reset: string;
  resetConfirm: string;
}

export interface TableBoardProps {
  storageKey: string;
  me: TablePokemon;
  myMoves: MoveView[];
  rival: TablePokemon;
  rivalMoves: MoveView[];
  symbols: SymbolLabels;
  cardLabels: MoveCardLabels;
  texts: TableTexts;
}

type Tab = "mine" | "rival";

export function TableBoard({
  storageKey,
  me,
  myMoves,
  rival,
  rivalMoves,
  symbols,
  cardLabels,
  texts,
}: TableBoardProps) {
  const [state, dispatch] = useReducer(gameReducer, storageKey, (key) => loadGame(key) ?? initialGameState);
  const [tab, setTab] = useState<Tab>("mine");
  // The face is only a reading aid: kept per tab, not persisted.
  const [faces, setFaces] = useState<Record<Tab, Orientation | null>>({ mine: null, rival: null });

  useEffect(() => saveGame(storageKey, state), [storageKey, state]);

  const face = faces[tab];
  const setFace = (value: Orientation | null) => setFaces((f) => ({ ...f, [tab]: value }));

  const reset = () => {
    if (window.confirm(texts.resetConfirm)) dispatch({ type: "reset" });
  };

  return (
    <div className="space-y-4">
      <CountersPanel
        state={state}
        texts={texts}
        onStarter={(starter) => dispatch({ type: "setStarter", starter })}
        onEnekoro={(delta) => dispatch({ type: "adjustEnekoro", delta })}
        onHp={(delta) => dispatch({ type: "adjustHp", delta })}
        onEndTurn={() => dispatch({ type: "endTurn" })}
      />

      <SegmentedControl
        label={texts.tabs}
        value={tab}
        onChange={setTab}
        options={[
          { value: "mine", label: texts.myCards },
          { value: "rival", label: format(texts.rivalCards, { name: rival.name }) },
        ]}
      />

      <div className="space-y-1">
        <p className="text-sm font-semibold">{texts.face}</p>
        <SegmentedControl
          label={texts.face}
          size="sm"
          value={face}
          onChange={setFace}
          onClear={() => setFace(null)}
          options={ORIENTATIONS.map((o) => ({ value: o, label: symbols.orientations[o].name }))}
        />
      </div>

      {tab === "mine" ? (
        <section className="space-y-2" aria-label={texts.myCards}>
          <h2 className="flex items-center gap-2 font-bold">
            <TypeBadge type={me.type} label={me.typeLabel} size="sm" />
            {me.name}
          </h2>
          <p className="text-sm text-muted">{texts.markUsed}</p>
          <ul className="grid gap-3 sm:grid-cols-2">
            {myMoves.map((move) => {
              const blocked = state.blockedMove === move.code;
              const used = state.usedMove === move.code;
              return (
                <li key={move.code}>
                  <MoveCard
                    move={move}
                    symbols={symbols}
                    labels={cardLabels}
                    onPress={() => dispatch({ type: "toggleUsedMove", code: move.code })}
                    pressed={used}
                    disabled={blocked}
                    highlight={face}
                    footer={
                      (blocked || used) && (
                        <p className={blocked ? "text-xs font-semibold text-danger" : "text-xs font-semibold text-accent"}>
                          {blocked ? texts.blocked : texts.used}
                        </p>
                      )
                    }
                  />
                </li>
              );
            })}
          </ul>
        </section>
      ) : (
        <section className="space-y-2" aria-label={format(texts.rivalCards, { name: rival.name })}>
          <h2 className="flex items-center gap-2 font-bold">
            <TypeBadge type={rival.type} label={rival.typeLabel} size="sm" />
            {rival.name}
          </h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {rivalMoves.map((move) => (
              <li key={move.code}>
                <MoveCard move={move} symbols={symbols} labels={cardLabels} highlight={face} />
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="flex justify-center pt-4">
        <Button variant="ghost" size="sm" onClick={reset}>
          {texts.reset}
        </Button>
      </div>
    </div>
  );
}

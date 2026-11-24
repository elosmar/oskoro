"use client";

import { useEffect, useReducer, useState } from "react";
import { MoveCard, type MoveCardLabels } from "@/components/MoveCard";
import { OrientationIcon } from "@/components/OrientationIcon";
import { TypeBadge } from "@/components/TypeBadge";
import { ORIENTATIONS, type Orientation } from "@/lib/data/constants";
import { format } from "@/lib/format";
import { gameReducer, initialGameState } from "@/lib/game-reducer";
import type { MoveView, SymbolLabels } from "@/lib/move-view";
import { loadGame, saveGame } from "@/lib/session-store";
import { TEAM_SIZE } from "@/lib/team-rules";
import type { TablePokemon } from "@/lib/table-view";
import { Button, SegmentedControl } from "@/ui";
import { CountersPanel, type CountersTexts } from "./CountersPanel";

export interface TableTexts extends CountersTexts {
  weakness: string;
  face: string;
  faceNeedsMove: string;
  faceNeedsRivalMove: string;
  markRivalMove: string;
  rivalSeen: string;
  rivalOthers: string;
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

/** Pokémon in play: type, name and its weakness (+20 from moves of that type). */
function PokemonHeading({ pokemon, weaknessLabel }: { pokemon: TablePokemon; weaknessLabel: string }) {
  return (
    <h2 className="flex flex-wrap items-center gap-2 font-bold">
      <TypeBadge type={pokemon.type} label={pokemon.typeLabel} size="sm" />
      {pokemon.name}
      <span className="ml-auto flex items-center gap-1 text-xs font-normal text-muted">
        {weaknessLabel}
        {/* Letter codes follow the TCG (F = Fighting), so spell the type out. */}
        <span aria-hidden className="contents">
          <TypeBadge type={pokemon.weakness} label={pokemon.weaknessLabel} size="sm" />
        </span>
        <span className="font-semibold text-foreground">{pokemon.weaknessLabel}</span>
      </span>
    </h2>
  );
}

/**
 * Brings the highlighted face row into view after the card opens. Scrolls
 * (doesn't move focus), skips if already visible, honors reduced motion.
 */
function scrollToHighlightedEffect() {
  // Two frames: one for React to commit, one for <details> to lay out.
  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      const row = document.querySelector<HTMLElement>("[data-highlighted]");
      if (!row) return;
      const { top, bottom } = row.getBoundingClientRect();
      if (top >= 0 && bottom <= window.innerHeight) return;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      row.scrollIntoView({ block: "center", behavior: reduced ? "auto" : "smooth" });
    }),
  );
}

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
  const setFace = (value: Orientation | null) => {
    setFaces((f) => ({ ...f, [tab]: value }));
    if (value) scrollToHighlightedEffect();
  };

  // Rival moves already played go first (first-seen order). A move first seen
  // THIS turn keeps its place until the next turn, so the card doesn't jump
  // under the finger while its effect is being read.
  const layoutSeen = state.rivalMoveIsNew ? state.rivalSeen.filter((c) => c !== state.rivalMove) : state.rivalSeen;
  const seenRivalMoves = layoutSeen.flatMap((code) => rivalMoves.find((m) => m.code === code) ?? []);
  const otherRivalMoves = rivalMoves.filter((m) => !layoutSeen.includes(m.code));
  // Rules: the rival has exactly 4 moves. Only once all are known can the rest be folded away.
  const foldOthers = seenRivalMoves.length >= TEAM_SIZE;

  const renderRivalMoves = (moves: MoveView[]) => (
    <ul className="grid gap-3 sm:grid-cols-2">
      {moves.map((move) => {
        const played = state.rivalMove === move.code;
        return (
          <li key={move.code}>
            <MoveCard
              move={move}
              symbols={symbols}
              labels={cardLabels}
              onPress={() => dispatch({ type: "toggleRivalMove", code: move.code })}
              pressed={played}
              highlight={played ? face : null}
            />
          </li>
        );
      })}
    </ul>
  );

  const reset = () => {
    if (window.confirm(texts.resetConfirm)) dispatch({ type: "reset" });
  };

  return (
    <div className="space-y-4">
      <CountersPanel
        state={state}
        texts={texts}
        onHp={(delta) => dispatch({ type: "adjustHp", delta })}
        onEndTurn={() => {
          dispatch({ type: "endTurn" });
          // A new turn means new rolls: clear both faces (the reducer clears the rival's mark).
          setFaces({ mine: null, rival: null });
        }}
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
          options={ORIENTATIONS.map((o) => ({
            value: o,
            label: symbols.orientations[o].name,
            icon: <OrientationIcon orientation={o} size="md" />,
          }))}
        />
        {face && !(tab === "mine" ? state.usedMove : state.rivalMove) && (
          <p className="text-xs font-semibold text-accent">
            {tab === "mine" ? texts.faceNeedsMove : texts.faceNeedsRivalMove}
          </p>
        )}
      </div>

      {tab === "mine" ? (
        <section className="space-y-2" aria-label={texts.myCards}>
          <PokemonHeading pokemon={me} weaknessLabel={texts.weakness} />
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
                    // The roll only matters for the move used this turn: open just that card.
                    highlight={used ? face : null}
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
          <PokemonHeading pokemon={rival} weaknessLabel={texts.weakness} />
          <p className="text-sm text-muted">{texts.markRivalMove}</p>
          {seenRivalMoves.length === 0 ? (
            renderRivalMoves(rivalMoves)
          ) : (
            <>
              <h3 className="text-sm font-semibold">{texts.rivalSeen}</h3>
              {renderRivalMoves(seenRivalMoves)}
              {otherRivalMoves.length > 0 &&
                (foldOthers ? (
                  <details>
                    <summary className="cursor-pointer py-2 text-sm font-semibold text-muted">
                      {format(texts.rivalOthers, { n: otherRivalMoves.length })}
                    </summary>
                    {renderRivalMoves(otherRivalMoves)}
                  </details>
                ) : (
                  <>
                    <h3 className="pt-2 text-sm font-semibold">
                      {format(texts.rivalOthers, { n: otherRivalMoves.length })}
                    </h3>
                    {renderRivalMoves(otherRivalMoves)}
                  </>
                ))}
            </>
          )}
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

"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import type { MoveCardLabels } from "@/components/MoveCard";
import { format } from "@/lib/format";
import type { MoveView, SymbolLabels } from "@/lib/move-view";
import { parseSetup, setupQuery } from "@/lib/setup-url";
import { isValidTeam, sanitizeMoves, TEAM_SIZE, toggleMove } from "@/lib/team-rules";
import { Button, ButtonLink } from "@/ui";
import { MoveGrid } from "./MoveGrid";

export interface MoveSelectorProps {
  lang: string;
  pokemonCode: string;
  moves: MoveView[];
  symbols: SymbolLabels;
  cardLabels: MoveCardLabels;
  texts: { counter: string; continue: string; hint: string };
}

export function MoveSelector({ lang, pokemonCode, moves, symbols, cardLabels, texts }: MoveSelectorProps) {
  const searchParams = useSearchParams();
  const allowed = moves.map((m) => m.code);

  // Restore the selection from the URL (e.g. after switching language).
  const [selected, setSelected] = useState<string[]>(() => {
    const setup = parseSetup(searchParams);
    return setup.me === pokemonCode ? sanitizeMoves(setup.moves, allowed) : [];
  });

  const toggle = (code: string) => {
    const next = toggleMove(selected, code, allowed);
    setSelected(next);
    // Native history: Next syncs useSearchParams without a server round trip.
    window.history.replaceState(null, "", `?${setupQuery({ me: pokemonCode, moves: next })}`);
  };

  const full = selected.length >= TEAM_SIZE;
  const ready = isValidTeam(selected, allowed);
  const counter = format(texts.counter, { count: selected.length, total: TEAM_SIZE });

  return (
    <>
      <p className="text-sm text-muted">{texts.hint}</p>
      <MoveGrid
        moves={moves}
        symbols={symbols}
        cardLabels={cardLabels}
        selected={selected}
        onToggle={toggle}
        full={full}
      />

      <div className="sticky bottom-0 -mx-4 mt-4 flex items-center justify-between gap-3 border-t border-border bg-background/95 px-4 py-3 backdrop-blur">
        <span aria-live="polite" className="text-lg font-bold tabular-nums">
          {counter}
        </span>
        {ready ? (
          <ButtonLink href={`/${lang}/rival/?${setupQuery({ me: pokemonCode, moves: selected })}`}>
            {texts.continue}
          </ButtonLink>
        ) : (
          <Button disabled>{texts.continue}</Button>
        )}
      </div>
    </>
  );
}

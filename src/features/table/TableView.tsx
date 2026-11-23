"use client";

import { useSearchParams } from "next/navigation";
import type { MoveCardLabels } from "@/components/MoveCard";
import type { SymbolLabels } from "@/lib/move-view";
import { gameKey } from "@/lib/session-store";
import { parseSetup, setupQuery } from "@/lib/setup-url";
import type { TableData } from "@/lib/table-view";
import { isValidTeam } from "@/lib/team-rules";
import { ButtonLink } from "@/ui";
import { TableBoard, type TableTexts } from "./TableBoard";

export interface TableViewProps {
  lang: string;
  data: TableData;
  symbols: SymbolLabels;
  cardLabels: MoveCardLabels;
  texts: TableTexts & { invalid: string; start: string; changeRival: string };
}

/** Reads and validates the setup from the URL, then mounts the board. */
export function TableView({ lang, data, symbols, cardLabels, texts }: TableViewProps) {
  const setup = parseSetup(useSearchParams());
  const me = data.pokemon.find((p) => p.code === setup.me);
  const rival = data.pokemon.find((p) => p.code === setup.rival);

  if (!me || !rival || !isValidTeam(setup.moves, me.moveCodes)) {
    return (
      <div className="space-y-3">
        <p>{texts.invalid}</p>
        <ButtonLink href={`/${lang}/elegir/`}>{texts.start}</ButtonLink>
      </div>
    );
  }

  const query = setupQuery(setup);

  return (
    <>
      <ButtonLink
        href={`/${lang}/rival/?${setupQuery({ me: setup.me, moves: setup.moves })}`}
        variant="ghost"
        size="sm"
      >
        ← {texts.changeRival}
      </ButtonLink>
      <TableBoard
        key={query} // a different setup is a different match
        storageKey={gameKey(query)}
        me={me}
        myMoves={setup.moves.map((c) => data.moves[c])}
        rival={rival}
        rivalMoves={rival.moveCodes.map((c) => data.moves[c])}
        symbols={symbols}
        cardLabels={cardLabels}
        texts={texts}
      />
    </>
  );
}

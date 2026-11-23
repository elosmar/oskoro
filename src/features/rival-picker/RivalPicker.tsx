"use client";

import { useSearchParams } from "next/navigation";
import { PokemonGrid, type PokemonGroup } from "@/features/pokemon-picker/PokemonGrid";
import { parseSetup, setupQuery } from "@/lib/setup-url";
import { TEAM_SIZE } from "@/lib/team-rules";
import { ButtonLink } from "@/ui";

export interface RivalPickerProps {
  lang: string;
  groups: PokemonGroup[];
  weaknessLabel: string;
  texts: { missingSetup: string; start: string; changeTeam: string };
}

export function RivalPicker({ lang, groups, weaknessLabel, texts }: RivalPickerProps) {
  const setup = parseSetup(useSearchParams());

  if (!setup.me || setup.moves.length !== TEAM_SIZE) {
    return (
      <div className="space-y-3">
        <p>{texts.missingSetup}</p>
        <ButtonLink href={`/${lang}/elegir/`}>{texts.start}</ButtonLink>
      </div>
    );
  }

  return (
    <>
      <ButtonLink
        href={`/${lang}/elegir/${setup.me}/?${setupQuery({ me: setup.me, moves: setup.moves })}`}
        variant="ghost"
        size="sm"
      >
        ← {texts.changeTeam}
      </ButtonLink>
      <PokemonGrid
        groups={groups}
        weaknessLabel={weaknessLabel}
        hrefFor={(code) => `/${lang}/mesa/?${setupQuery({ ...setup, rival: code })}`}
      />
    </>
  );
}

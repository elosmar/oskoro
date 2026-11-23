import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { TypeBadge } from "@/components/TypeBadge";
import { MoveGrid } from "@/features/team-builder/MoveGrid";
import { MoveSelector } from "@/features/team-builder/MoveSelector";
import { getDictionary } from "@/i18n";
import { getData, getPokemon } from "@/lib/data";
import type { Lang } from "@/lib/data/constants";
import { movesOf, toSymbolLabels } from "@/lib/move-view";
import { ButtonLink } from "@/ui";

type Props = PageProps<"/[lang]/elegir/[code]">;

export const dynamicParams = false;

export function generateStaticParams() {
  // Pokémon codes are the same in every language.
  return getData("en").pokemon.map((p) => ({ code: p.code }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, code } = await params;
  const pokemon = getPokemon(lang as Lang, code);
  return { title: pokemon ? `${pokemon.name} · ${getDictionary(lang as Lang).team.title}` : undefined };
}

/** Container: builds view models for the move selector. */
export default async function PickMovesPage({ params }: Props) {
  const { lang: rawLang, code } = await params;
  const lang = rawLang as Lang;
  const pokemon = getPokemon(lang, code);
  if (!pokemon) notFound();

  const t = getDictionary(lang);
  const bundle = getData(lang);
  const moves = movesOf(bundle, pokemon.code);
  const symbols = toSymbolLabels(bundle);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <TypeBadge type={pokemon.type} label={bundle.types[pokemon.type].name} />
          {pokemon.name}
        </h1>
        <ButtonLink href={`/${lang}/elegir/`} variant="ghost" size="sm">
          {t.team.changePokemon}
        </ButtonLink>
      </div>
      <h2 className="text-lg font-semibold">{t.team.title}</h2>
      {/* useSearchParams needs Suspense in a static export; the fallback is the
          same list without selection, so the cards are in the static HTML. */}
      <Suspense fallback={<MoveGrid moves={moves} symbols={symbols} cardLabels={t.card} />}>
        <MoveSelector
          lang={lang}
          pokemonCode={pokemon.code}
          moves={moves}
          symbols={symbols}
          cardLabels={t.card}
          texts={{ counter: t.team.counter, continue: t.team.continue, hint: t.team.hint }}
        />
      </Suspense>
    </div>
  );
}

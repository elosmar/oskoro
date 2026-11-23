import type { Metadata } from "next";
import { PokemonGrid, type PokemonGroup } from "@/features/pokemon-picker/PokemonGrid";
import { format, getDictionary } from "@/i18n";
import { getData, pokemonBySet } from "@/lib/data";
import type { Lang } from "@/lib/data/schema";

export async function generateMetadata({ params }: PageProps<"/[lang]/elegir">): Promise<Metadata> {
  const lang = (await params).lang as Lang;
  return { title: getDictionary(lang).pick.title };
}

/** Container: reads data and dictionary, builds view models, renders the feature. */
export default async function PickPokemonPage({ params }: PageProps<"/[lang]/elegir">) {
  const lang = (await params).lang as Lang;
  const t = getDictionary(lang);
  const { types } = getData(lang);

  const groups: PokemonGroup[] = pokemonBySet(lang).map(({ set, pokemon }) => ({
    id: set,
    title: t.sets[set],
    tiles: pokemon.map((p) => ({
      code: p.code,
      name: p.name,
      href: `/${lang}/elegir/${p.code}/`,
      type: { key: p.type, label: types[p.type].name },
      weakness: { key: p.weakness, label: types[p.weakness].name },
      moveCountLabel: format(t.pick.moveCount, { count: p.moveCodes.length }),
    })),
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t.pick.title}</h1>
      <PokemonGrid groups={groups} weaknessLabel={t.pick.weakness} />
    </div>
  );
}

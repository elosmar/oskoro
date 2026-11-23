import type { Metadata } from "next";
import { PokemonGrid } from "@/features/pokemon-picker/PokemonGrid";
import { getDictionary } from "@/i18n";
import { getData } from "@/lib/data";
import type { Lang } from "@/lib/data/constants";
import { toPokemonGroups } from "@/lib/pokemon-view";

export async function generateMetadata({ params }: PageProps<"/[lang]/elegir">): Promise<Metadata> {
  const lang = (await params).lang as Lang;
  return { title: getDictionary(lang).pick.title };
}

/** Container: reads data and dictionary, builds view models, renders the feature. */
export default async function PickPokemonPage({ params }: PageProps<"/[lang]/elegir">) {
  const lang = (await params).lang as Lang;
  const t = getDictionary(lang);
  const groups = toPokemonGroups(getData(lang), { sets: t.sets, moveCount: t.pick.moveCount });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t.pick.title}</h1>
      <PokemonGrid
        groups={groups}
        weaknessLabel={t.pick.weakness}
        hrefFor={(code) => `/${lang}/elegir/${code}/`}
      />
    </div>
  );
}

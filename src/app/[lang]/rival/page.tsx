import type { Metadata } from "next";
import { Suspense } from "react";
import { PokemonGrid } from "@/features/pokemon-picker/PokemonGrid";
import { RivalPicker } from "@/features/rival-picker/RivalPicker";
import { getDictionary } from "@/i18n";
import { getData } from "@/lib/data";
import type { Lang } from "@/lib/data/constants";
import { toPokemonGroups } from "@/lib/pokemon-view";

type Props = PageProps<"/[lang]/rival">;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const lang = (await params).lang as Lang;
  return { title: getDictionary(lang).rival.title };
}

export default async function RivalPage({ params }: Props) {
  const lang = (await params).lang as Lang;
  const t = getDictionary(lang);
  const groups = toPokemonGroups(getData(lang), { sets: t.sets, moveCount: t.pick.moveCount });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{t.rival.title}</h1>
      <p className="text-sm text-muted">{t.rival.hint}</p>
      <Suspense fallback={<PokemonGrid groups={groups} weaknessLabel={t.pick.weakness} />}>
        <RivalPicker
          lang={lang}
          groups={groups}
          weaknessLabel={t.pick.weakness}
          texts={{ missingSetup: t.rival.missingSetup, start: t.rival.start, changeTeam: t.rival.changeTeam }}
        />
      </Suspense>
    </div>
  );
}

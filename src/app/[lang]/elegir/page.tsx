import type { Metadata } from "next";
import Link from "next/link";
import { TypeBadge } from "@/components/TypeBadge";
import { format, getDictionary } from "@/i18n";
import { getData, pokemonBySet } from "@/lib/data";
import type { Lang } from "@/lib/data/schema";

export async function generateMetadata({ params }: PageProps<"/[lang]/elegir">): Promise<Metadata> {
  const lang = (await params).lang as Lang;
  return { title: getDictionary(lang).pick.title };
}

export default async function PickPokemon({ params }: PageProps<"/[lang]/elegir">) {
  const lang = (await params).lang as Lang;
  const t = getDictionary(lang);
  const { types } = getData(lang);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">{t.pick.title}</h1>
      {pokemonBySet(lang).map(({ set, pokemon }) => (
        <section key={set} aria-labelledby={`set-${set}`} className="space-y-3">
          <h2 id={`set-${set}`} className="text-sm font-semibold uppercase tracking-wide text-muted">
            {t.sets[set]}
          </h2>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {pokemon.map((p) => (
              <li key={p.code}>
                <Link
                  href={`/${lang}/elegir/${p.code}/`}
                  className="flex h-full flex-col gap-2 rounded-xl border border-border bg-surface p-3 transition hover:border-accent active:scale-[0.98]"
                >
                  <div className="flex items-center gap-2">
                    <TypeBadge type={p.type} label={types[p.type].name} />
                    <span className="truncate font-semibold">{p.name}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted">
                    <span>{format(t.pick.moveCount, { count: p.moveCodes.length })}</span>
                    <span className="flex items-center gap-1">
                      <span className="sr-only">{t.pick.weakness}:</span>
                      <span aria-hidden>⚠</span>
                      <TypeBadge type={p.weakness} label={types[p.weakness].name} size="sm" />
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

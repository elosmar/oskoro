import { TypeBadge } from "@/components/TypeBadge";
import type { EnergyType } from "@/lib/data/constants";
import { CardLink } from "@/ui";

export interface PokemonTile {
  code: string;
  name: string;
  href: string;
  type: { key: EnergyType; label: string };
  weakness: { key: EnergyType; label: string };
  moveCountLabel: string;
}

export interface PokemonGroup {
  id: string;
  title: string;
  tiles: PokemonTile[];
}

/** Presentational: receives ready-to-render view models, reads no data. */
export function PokemonGrid({ groups, weaknessLabel }: { groups: PokemonGroup[]; weaknessLabel: string }) {
  return (
    <div className="space-y-8">
      {groups.map((group) => (
        <section key={group.id} aria-labelledby={`set-${group.id}`} className="space-y-3">
          <h2 id={`set-${group.id}`} className="text-sm font-semibold uppercase tracking-wide text-muted">
            {group.title}
          </h2>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {group.tiles.map((tile) => (
              <li key={tile.code}>
                <CardLink href={tile.href} className="flex h-full flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <TypeBadge type={tile.type.key} label={tile.type.label} />
                    <span className="truncate font-semibold">{tile.name}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted">
                    <span>{tile.moveCountLabel}</span>
                    <span className="flex items-center gap-1">
                      <span className="sr-only">{weaknessLabel}:</span>
                      <span aria-hidden>⚠</span>
                      <TypeBadge type={tile.weakness.key} label={tile.weakness.label} size="sm" />
                    </span>
                  </div>
                </CardLink>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

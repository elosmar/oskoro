import { TypeBadge } from "@/components/TypeBadge";
import type { PokemonGroup, PokemonTile } from "@/lib/pokemon-view";
import { Card, CardLink } from "@/ui";

export type { PokemonGroup, PokemonTile };

function TileContent({ tile, weaknessLabel }: { tile: PokemonTile; weaknessLabel: string }) {
  return (
    <>
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
    </>
  );
}

/**
 * Presentational: receives ready-to-render view models, reads no data.
 * `hrefFor` turns tiles into links; without it they render as plain cards.
 */
export function PokemonGrid({
  groups,
  weaknessLabel,
  hrefFor,
}: {
  groups: PokemonGroup[];
  weaknessLabel: string;
  hrefFor?: (code: string) => string;
}) {
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
                {hrefFor ? (
                  <CardLink href={hrefFor(tile.code)} className="flex h-full flex-col gap-2">
                    <TileContent tile={tile} weaknessLabel={weaknessLabel} />
                  </CardLink>
                ) : (
                  <Card className="flex h-full flex-col gap-2">
                    <TileContent tile={tile} weaknessLabel={weaknessLabel} />
                  </Card>
                )}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

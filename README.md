# Oskoro

Unofficial companion for Plakoro matches. Read your Japanese Wazacards in Spanish or English, pick your 4 moves, check your rival's moves and track your counters while you play in person.

Not affiliated with Pokémon, Bandai or Nintendo.

## Development

```bash
npm install
npm run dev          # local dev server
npm test             # parser and data tests
npm run build        # static export to out/
```

### Data

Card data comes from [PlakoroDB](https://github.com/Jollto/PlakoroDB) pinned to a commit in `scripts/plakorodb.ts`. The generated JSON is committed, so builds never need the network.

```bash
npm run data:sync    # sparse clone of PlakoroDB text sources into vendor/
npm run data:build   # regenerate src/data/<lang>.json
```

See `docs/` for the discovery and architecture decisions.

## License

- **Code**: MIT, see `LICENSE`.
- **Card data** (`src/data/*.json`): adapted from [PlakoroDB](https://github.com/Jollto/PlakoroDB) by Jollto and contributors, licensed under [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/). Changes: converted from Markdown to JSON, normalized fields and merged translations with English fallback. Non-commercial use only.
- Pokémon names, Japanese card text and game terms belong to their respective owners.

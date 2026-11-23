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

- **Code**: MIT, see [`LICENSE`](LICENSE).
- **Card data** (`src/data/`): CC BY-NC 4.0, adapted from PlakoroDB. See [`LICENSE-DATA.md`](LICENSE-DATA.md).
- **Trademarks, credits and disclaimer**: see [`NOTICE.md`](NOTICE.md).

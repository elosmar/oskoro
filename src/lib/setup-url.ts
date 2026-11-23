/**
 * Match setup travels in the URL (no storage): survives reloads and language
 * switches. Example: ?me=STC04-001&moves=STW04-001,STW04-002,...&rival=STC01-001
 */
export interface Setup {
  me: string | null;
  moves: string[];
  rival: string | null;
}

type ParamsLike = { get(name: string): string | null };

export function parseSetup(params: ParamsLike): Setup {
  const moves = params.get("moves");
  return {
    me: params.get("me") || null,
    moves: moves ? moves.split(",").filter(Boolean) : [],
    rival: params.get("rival") || null,
  };
}

export function setupQuery(setup: Partial<Setup>): string {
  const params = new URLSearchParams();
  if (setup.me) params.set("me", setup.me);
  if (setup.moves?.length) params.set("moves", setup.moves.join(","));
  if (setup.rival) params.set("rival", setup.rival);
  // Keep commas readable: codes never contain characters that need escaping.
  return params.toString().replaceAll("%2C", ",");
}

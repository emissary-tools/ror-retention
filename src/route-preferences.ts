export const getCurrentRouteUrl = (): URL => {
  const state = globalThis.history.state as { emissarySearch?: unknown } | null;
  const search =
    typeof state?.emissarySearch === 'string'
      ? state.emissarySearch
      : globalThis.location.search;
  return new URL(
    `${globalThis.location.pathname}${search}${globalThis.location.hash}`,
    globalThis.location.origin,
  );
};

export const getCurrentRouteSearch = (): string =>
  getCurrentRouteUrl().search;

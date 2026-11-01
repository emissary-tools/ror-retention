export const getCurrentRouteUrl = (): URL => {
  const state = window.history.state as { __emissarySearch?: unknown } | null;
  const search =
    typeof state?.__emissarySearch === 'string'
      ? state.__emissarySearch
      : window.location.search;
  return new URL(
    `${window.location.pathname}${search}${window.location.hash}`,
    window.location.origin,
  );
};

export const getCurrentRouteSearch = (): string =>
  getCurrentRouteUrl().search;

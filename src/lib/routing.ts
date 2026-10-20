/** Vite base without trailing slash (e.g. `/manospring-site` or ``). */
export const BASE_URL = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');

/** Prefix an app path with the Vite base for GitHub Pages. */
export function appPath(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  if (!BASE_URL) return normalized;
  if (normalized === '/') return `${BASE_URL}/`;
  return `${BASE_URL}${normalized}`;
}

/** Strip the Vite base from the current browser pathname. */
export function currentAppPath(): string {
  let pathname = window.location.pathname;
  if (BASE_URL && (pathname === BASE_URL || pathname.startsWith(`${BASE_URL}/`))) {
    pathname = pathname.slice(BASE_URL.length) || '/';
  }
  if (!pathname.startsWith('/')) pathname = `/${pathname}`;
  return pathname;
}

export function navigateApp(path: string): void {
  window.history.pushState(null, '', appPath(path));
  window.dispatchEvent(new PopStateEvent('popstate'));
}

export function replaceApp(path: string): void {
  window.history.replaceState(null, '', appPath(path));
}

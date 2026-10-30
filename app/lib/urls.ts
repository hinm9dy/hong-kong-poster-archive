type ArchiveConfig = { basePath?: string; apiOrigin?: string; fallbackCatalog?: string };
declare global { interface Window { __HKPA_CONFIG__?: ArchiveConfig } }

function config(): ArchiveConfig {
  return typeof window === 'undefined' ? {} : window.__HKPA_CONFIG__ ?? {};
}

export function archivePath(path = '') {
  return `${config().basePath ?? '/'}${path.replace(/^\//, '')}`;
}

export function apiUrl(path: string) {
  return `${config().apiOrigin ?? ''}${path}`;
}

export function fallbackCatalogUrl() {
  return config().fallbackCatalog;
}

export const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
export const apiUrl = (path = '') => `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
export function installApiUrlResolver() {
  const nativeFetch = window.fetch.bind(window);
  window.fetch = (input, init) => {
    if (typeof input === 'string' && (input.startsWith('/api/') || input.startsWith('/uploads/') || input.startsWith('/exports/'))) input = apiUrl(input);
    else if (input instanceof URL && input.origin === window.location.origin && (input.pathname.startsWith('/api/') || input.pathname.startsWith('/uploads/') || input.pathname.startsWith('/exports/'))) input = apiUrl(`${input.pathname}${input.search}`);
    return nativeFetch(input, init);
  };
  const NativeEventSource = window.EventSource;
  if (NativeEventSource) window.EventSource = class extends NativeEventSource { constructor(url, config) { super(typeof url === 'string' && url.startsWith('/') ? apiUrl(url) : url, config); } };
}

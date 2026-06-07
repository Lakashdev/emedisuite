/** Thin, safe wrappers around localStorage */

export function getItem(key) {
  try { return localStorage.getItem(key); } catch { return null; }
}

export function setItem(key, value) {
  try { localStorage.setItem(key, value); } catch { /* quota exceeded — ignore */ }
}

export function removeItem(key) {
  try { localStorage.removeItem(key); } catch { /* ignore */ }
}

export function getJSON(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function setJSON(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* ignore */ }
}

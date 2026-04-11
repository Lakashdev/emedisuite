
import { useState, useEffect } from "react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

// Simple in-memory cache so Footer + About don't double-fetch
let _cache = null;
let _promise = null;

export function useStoreInfo() {
  const [info, setInfo] = useState(_cache);
  const [loading, setLoading] = useState(!_cache);

  useEffect(() => {
    if (_cache) { setInfo(_cache); setLoading(false); return; }
    if (!_promise) {
      _promise = fetch(`${API_BASE}/store-info`)
        .then((r) => r.json())
        .then((d) => { _cache = d; return d; });
    }
    _promise.then((d) => { setInfo(d); setLoading(false); });
  }, []);

  return { info, loading };
}





"use client";
import { useCallback, useEffect, useRef, useState } from "react";

export class ApiError extends Error {
  constructor(public status: number, public code: string) {
    super(code);
  }
}

export async function api<T>(url: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
  const method = init.method ?? "GET";
  const res = await fetch(url, {
    method,
    headers: method === "GET" ? undefined : { "content-type": "application/json" },
    body: method === "GET" ? undefined : (typeof init.body === "string" ? init.body : JSON.stringify(init.body ?? {})),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, data?.error ?? "SERVER_ERROR");
  return data as T;
}

export function useApi<T>(url: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(!!url);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!url) return;
    let live = true;
    setLoading(true);
    setError(null);
    api<T>(url)
      .then((d) => live && setData(d))
      .catch((e: ApiError) => live && setError(e.code))
      .finally(() => live && setLoading(false));
    return () => {
      live = false;
    };
  }, [url, tick]);
  return { data, error, loading, reload: useCallback(() => setTick((t) => t + 1), []) };
}

type PageResp<T> = { items: T[]; nextCursor: string | null };

/** Cursor-based infinite list: loads the next page when the sentinel nears the viewport. */
export function useInfinite<T extends { id: string }>(url: string) {
  const [items, setItems] = useState<T[]>([]);
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const cursor = useRef<string | null>(null);
  const busy = useRef(false);
  const gen = useRef(0);
  const seen = useRef(new Set<string>());
  const node = useRef<HTMLDivElement | null>(null);

  const load = useCallback(async () => {
    if (busy.current) return;
    busy.current = true;
    const g = gen.current;
    setState("loading");
    try {
      const u = new URL(url, window.location.origin);
      if (cursor.current) u.searchParams.set("cursor", cursor.current);
      const r = await api<PageResp<T>>(u.pathname + u.search);
      if (g !== gen.current) return;
      const fresh = r.items.filter((i) => !seen.current.has(i.id));
      fresh.forEach((i) => seen.current.add(i.id));
      setItems((p) => [...p, ...fresh]);
      cursor.current = r.nextCursor;
      setState(r.nextCursor ? "idle" : "done");
    } catch {
      if (g === gen.current) setState("error");
    } finally {
      if (g === gen.current) busy.current = false;
    }
  }, [url]);

  useEffect(() => {
    gen.current += 1;
    busy.current = false;
    cursor.current = null;
    seen.current = new Set();
    setItems([]);
    setState("idle");
    void load();
  }, [load]);

  // Re-observe after every page so a short list keeps filling until the viewport is covered.
  useEffect(() => {
    const el = node.current;
    if (!el || state !== "idle") return;
    const io = new IntersectionObserver((e) => e[0]?.isIntersecting && void load(), { rootMargin: "400px" });
    io.observe(el);
    return () => io.disconnect();
  }, [state, items.length, load]);

  const retry = useCallback(() => {
    busy.current = false;
    void load();
  }, [load]);
  return { items, state, sentinel: node, retry };
}

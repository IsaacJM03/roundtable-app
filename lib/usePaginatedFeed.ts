"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const PAGE_SIZE = 24;

type FeedState<T> = {
  items: T[];
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  loadMoreRef: (node: HTMLDivElement | null) => void;
};

export function usePaginatedFeed<T>(
  buildUrl: (page: number) => string,
  extract: (json: Record<string, unknown>) => T[],
  deps: unknown[] = []
): FeedState<T> {
  const [items, setItems] = useState<T[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const inFlight = useRef(false);

  const fetchPage = useCallback(
    async (pageNum: number, append: boolean) => {
      if (inFlight.current) return;
      inFlight.current = true;
      if (append) setLoadingMore(true);
      else setLoading(true);

      try {
        const res = await fetch(buildUrl(pageNum));
        const json = (await res.json()) as Record<string, unknown>;
        const batch = extract(json);
        setItems((prev) => (append ? [...prev, ...batch] : batch));
        setPage(pageNum);
        setHasMore(Boolean(json.hasMore));
      } finally {
        inFlight.current = false;
        setLoading(false);
        setLoadingMore(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [buildUrl, extract, ...deps]
  );

  useEffect(() => {
    setItems([]);
    setPage(1);
    setHasMore(true);
    fetchPage(1, false);
  }, [fetchPage]);

  const loadMoreRef = useCallback(
    (node: HTMLDivElement | null) => {
      sentinelRef.current = node;
    },
    []
  );

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasMore) return;

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting) && !inFlight.current) {
          fetchPage(page + 1, true);
        }
      },
      { rootMargin: "400px" }
    );
    io.observe(node);
    return () => io.disconnect();
  }, [fetchPage, hasMore, page, items.length]);

  return { items, loading, loadingMore, hasMore, loadMoreRef };
}

export { PAGE_SIZE };

"use client";

import { useId, useMemo, useRef, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { trackEvent } from "@/lib/analytics";
import { categories } from "@/data/mock/categories";

const HISTORY_KEY = "ml_search_history";

type SearchBarProps = {
  size?: "lg" | "sm";
  initialQuery?: string;
};

export default function SearchBar({ size = "lg", initialQuery }: SearchBarProps) {
  const router = useRouter();
  const params = useSearchParams();
  const [query, setQuery] = useState(initialQuery || params.get("q") || "");
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const [history, setHistory] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();

  useEffect(() => {
    const stored = window.localStorage.getItem(HISTORY_KEY);
    if (stored) {
      setHistory(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    const current = params.get("q") || "";
    setQuery(current);
  }, [params]);

  useEffect(() => {
    const handler = window.setTimeout(() => {
      setDebouncedQuery(query);
    }, 200);

    return () => window.clearTimeout(handler);
  }, [query]);

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  const suggestions = useMemo(() => {
    const base = [
      ...history,
      ...categories.map((category) => category.name),
      "frete grátis",
      "entrega rápida",
      "mais vendidos",
      "ofertas"
    ];

    const unique = Array.from(new Set(base.map((item) => item.trim())));
    if (!debouncedQuery) {
      return unique.slice(0, 6);
    }
    return unique
      .filter((item) =>
        item.toLowerCase().includes(debouncedQuery.toLowerCase())
      )
      .slice(0, 6);
  }, [history, debouncedQuery]);

  const storeHistory = (value: string) => {
    const next = [value, ...history.filter((item) => item !== value)].slice(0, 8);
    setHistory(next);
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const value = query.trim();
    if (!value) {
      return;
    }
    storeHistory(value);
    trackEvent("search_performed", { query: value });
    router.push(`/busca?q=${encodeURIComponent(value)}`);
    setIsOpen(false);
  };

  const sizeClasses =
    size === "lg"
      ? "h-14 rounded-2xl text-base"
      : "h-11 rounded-xl text-sm";

  return (
    <div ref={containerRef} className="relative w-full">
      <form onSubmit={handleSubmit} className="relative">
        <input
          aria-label="Buscar produtos"
          aria-controls={listboxId}
          aria-expanded={isOpen}
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className={`w-full border border-cloud bg-white px-4 pr-12 text-ink shadow-soft outline-none transition focus:border-brand-500 ${sizeClasses}`}
          placeholder="Busque por produto, marca ou categoria"
          autoComplete="off"
        />
        <button
          type="submit"
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg bg-brand-500 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition hover:bg-brand-700"
        >
          Buscar
        </button>
      </form>
      {isOpen && suggestions.length > 0 && (
        <div
          id={listboxId}
          role="listbox"
          className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border border-cloud bg-white shadow-soft"
        >
          {suggestions.map((item) => (
            <button
              key={item}
              role="option"
              type="button"
              onClick={() => {
                setQuery(item);
                setIsOpen(false);
              }}
              className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-slate-600 hover:bg-mist"
            >
              <span className="text-brand-700">&#x25CF;</span>
              {item}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

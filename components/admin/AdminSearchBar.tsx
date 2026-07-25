"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

// Reusable admin list toolbar: a search box + optional filter dropdowns that
// drive the page's URL search params (server component re-queries the DB from
// them). Text search is debounced; selects apply immediately. No submit button.
type Filter = { key: string; label: string; options: { value: string; label: string }[] };

export default function AdminSearchBar({
  placeholder = "ค้นหา...",
  filters = [],
}: {
  placeholder?: string;
  filters?: Filter[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");

  // Merge updates into the current params; an empty value drops the key. Reset
  // to page 1-equivalent by not carrying stale keys. scroll:false keeps place.
  const push = (updates: Record<string, string>) => {
    const next = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(updates)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  // Debounce the text box → URL (skip the initial mount).
  const mounted = useRef(false);
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    const t = setTimeout(() => push({ q }), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const hasActive = q !== "" || filters.some((f) => params.get(f.key));

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <div className="relative flex-1 min-w-[200px]">
        <i
          className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm"
          aria-hidden="true"
        />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
          autoComplete="off"
          spellCheck={false}
          className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary"
        />
      </div>

      {filters.map((f) => (
        <select
          key={f.key}
          value={params.get(f.key) ?? ""}
          onChange={(e) => push({ [f.key]: e.target.value })}
          aria-label={f.label}
          className="px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary"
        >
          <option value="">{f.label}</option>
          {f.options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      ))}

      {hasActive && (
        <button
          type="button"
          onClick={() => {
            setQ("");
            router.replace(pathname, { scroll: false });
          }}
          className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-500 hover:border-primary hover:text-primary transition"
        >
          ล้าง
        </button>
      )}
    </div>
  );
}

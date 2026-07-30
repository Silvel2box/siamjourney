"use client";

import { useState } from "react";

// Repeatable one-line text editor for the admin (province highlights).
// Same shape as GalleryField — add / remove / reorder, serialised to a hidden
// <input name> as a JSON string array so the server action can parse it.
export default function HighlightsField({
  name,
  label,
  hint,
  defaultValue,
}: {
  name: string;
  label: string;
  hint?: string;
  defaultValue: string[];
}) {
  const [items, setItems] = useState<string[]>(defaultValue);

  const add = () => setItems((prev) => [...prev, ""]);

  const setItem = (i: number, value: string) =>
    setItems((prev) => prev.map((it, idx) => (idx === i ? value : it)));

  const remove = (i: number) => setItems((prev) => prev.filter((_, idx) => idx !== i));

  const move = (i: number, dir: -1 | 1) =>
    setItems((prev) => {
      const j = i + dir;
      if (j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

  // Blank rows are dropped so an unfinished row never reaches the DB.
  const serialised = JSON.stringify(items.map((it) => it.trim()).filter(Boolean));

  return (
    <div className="flex flex-col gap-3">
      <input type="hidden" name={name} value={serialised} />
      <span className="text-sm font-medium text-gray-700">{label}</span>
      {hint && <span className="text-xs text-gray-400 -mt-2">{hint}</span>}

      {items.length > 0 && (
        <ul className="flex flex-col gap-2">
          {items.map((it, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="w-8 h-11 flex items-center justify-center text-gray-400 text-sm shrink-0">
                {i + 1}.
              </span>
              <input
                value={it}
                onChange={(e) => setItem(i, e.target.value)}
                placeholder="เช่น อุทยานประวัติศาสตร์มรดกโลก"
                className="px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-primary flex-1 min-w-0"
              />
              <div className="flex gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  aria-label="เลื่อนขึ้น"
                  className="px-2 py-2 rounded-md border border-gray-200 text-gray-500 hover:border-primary disabled:opacity-30 text-xs"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => move(i, 1)}
                  disabled={i === items.length - 1}
                  aria-label="เลื่อนลง"
                  className="px-2 py-2 rounded-md border border-gray-200 text-gray-500 hover:border-primary disabled:opacity-30 text-xs"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => remove(i)}
                  aria-label="ลบข้อนี้"
                  className="px-2 py-2 rounded-md text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100"
                >
                  ลบ
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        onClick={add}
        className="self-start px-4 py-2 rounded-xl bg-white border border-gray-300 text-gray-600 hover:border-primary transition text-sm"
      >
        + เพิ่มข้อ
      </button>
    </div>
  );
}

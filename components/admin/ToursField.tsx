"use client";

import { useState } from "react";

// Partner tours shown on a province page. Each item = { label, url, image? } —
// the same shape a place's single affiliate holds, kept as a list because a
// province is the top of the funnel and can carry several.
//
// No file upload here, unlike GalleryField: the photo is meant to be the
// partner's own, pasted straight from their feed, so it tracks the product if
// they reshoot it. Serialises to a hidden input for saveProvince to read.
type Item = { label: string; url: string; image?: string };

const MAX = 6;

export default function ToursField({
  name,
  label,
  defaultValue,
}: {
  name: string;
  label: string;
  defaultValue: Item[];
}) {
  const [items, setItems] = useState<Item[]>(defaultValue);

  const set = (i: number, patch: Partial<Item>) =>
    setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  const remove = (i: number) => setItems((prev) => prev.filter((_, idx) => idx !== i));
  const add = () =>
    setItems((prev) => (prev.length >= MAX ? prev : [...prev, { label: "", url: "" }]));
  const move = (i: number, dir: -1 | 1) =>
    setItems((prev) => {
      const j = i + dir;
      if (j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

  // Half-filled rows are dropped rather than saved: a tour with no link is a
  // card that goes nowhere.
  const serialised = JSON.stringify(
    items
      .filter((it) => it.label.trim() && it.url.trim())
      .map((it) =>
        it.image?.trim()
          ? { label: it.label.trim(), url: it.url.trim(), image: it.image.trim() }
          : { label: it.label.trim(), url: it.url.trim() },
      ),
  );

  const input =
    "px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-primary w-full text-sm";

  return (
    <div className="flex flex-col gap-3">
      <input type="hidden" name={name} value={serialised} />
      <span className="text-sm font-medium text-gray-700">{label}</span>

      {items.length > 0 && (
        <ul className="flex flex-col gap-3">
          {items.map((it, i) => (
            <li key={i} className="flex items-start gap-3 rounded-xl border border-gray-200 p-3">
              <div className="w-24 h-20 shrink-0 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                {it.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={it.image} alt="" className="object-cover w-full h-full" />
                ) : (
                  <span className="flex items-center justify-center w-full h-full text-xs text-gray-400">
                    ไม่มีรูป
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0 flex flex-col gap-2">
                <input
                  value={it.label}
                  onChange={(e) => set(i, { label: e.target.value })}
                  placeholder="ชื่อทัวร์ เช่น จองคอร์สปีนผาที่หาดไร่เลย์"
                  className={input}
                />
                <input
                  value={it.url}
                  onChange={(e) => set(i, { url: e.target.value })}
                  placeholder="ลิงก์สินค้า https://www.klook.com/th/activity/..."
                  className={input}
                />
                <input
                  value={it.image ?? ""}
                  onChange={(e) => set(i, { image: e.target.value })}
                  placeholder="รูปสินค้า (ไม่บังคับ) https://res.klook.com/..."
                  className={input}
                />
              </div>
              <div className="flex flex-col gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  aria-label="เลื่อนขึ้น"
                  className="px-2 py-1 rounded-md border border-gray-200 text-gray-500 hover:border-primary disabled:opacity-30 text-xs"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => move(i, 1)}
                  disabled={i === items.length - 1}
                  aria-label="เลื่อนลง"
                  className="px-2 py-1 rounded-md border border-gray-200 text-gray-500 hover:border-primary disabled:opacity-30 text-xs"
                >
                  ↓
                </button>
              </div>
              <button
                type="button"
                onClick={() => remove(i)}
                aria-label="ลบทัวร์"
                className="px-2 py-1 rounded-md text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 shrink-0"
              >
                ลบ
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={add}
          disabled={items.length >= MAX}
          className="px-4 py-2 rounded-xl bg-white border border-gray-300 text-gray-600 hover:border-primary disabled:opacity-40 text-sm transition"
        >
          + เพิ่มทัวร์
        </button>
        <span className="text-xs text-gray-400">
          สูงสุด {MAX} รายการ · ลิงก์จะถูกติดแท็ก affiliate ให้อัตโนมัติ
        </span>
      </div>
    </div>
  );
}

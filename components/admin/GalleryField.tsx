"use client";

import { useState } from "react";

// Multi-image gallery editor for the admin. Each item = { url, caption? }.
// Add via file upload (reuses /api/admin/upload → resized) or pasted URL,
// remove, reorder, and caption each. Serialises to a hidden <input name> as
// JSON so the server action (saveHotel) can parse it from FormData.
type Item = { url: string; caption?: string };

export default function GalleryField({
  name,
  label,
  defaultValue,
}: {
  name: string;
  label: string;
  defaultValue: Item[];
}) {
  const [items, setItems] = useState<Item[]>(defaultValue);
  const [urlInput, setUrlInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const add = (url: string) => {
    const u = url.trim();
    if (!u) return;
    setItems((prev) => [...prev, { url: u }]);
    setUrlInput("");
    setErr("");
  };

  const setCaption = (i: number, caption: string) =>
    setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, caption } : it)));

  const remove = (i: number) => setItems((prev) => prev.filter((_, idx) => idx !== i));

  const move = (i: number, dir: -1 | 1) =>
    setItems((prev) => {
      const j = i + dir;
      if (j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setErr("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) setErr(data.error || "อัปโหลดไม่สำเร็จ");
      else add(data.url);
    } catch {
      setErr("อัปโหลดไม่สำเร็จ");
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  }

  // Store only clean items; drop empty captions so the JSON stays tidy.
  const serialised = JSON.stringify(
    items.map((it) => (it.caption?.trim() ? { url: it.url, caption: it.caption.trim() } : { url: it.url })),
  );

  return (
    <div className="flex flex-col gap-3">
      <input type="hidden" name={name} value={serialised} />
      <span className="text-sm font-medium text-gray-700">{label}</span>

      {items.length > 0 && (
        <ul className="flex flex-col gap-3">
          {items.map((it, i) => (
            <li key={i} className="flex items-start gap-3 rounded-xl border border-gray-200 p-3">
              <div className="w-24 h-20 shrink-0 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={it.url} alt="" className="object-cover w-full h-full" />
              </div>
              <div className="flex-1 min-w-0">
                <input
                  value={it.caption ?? ""}
                  onChange={(e) => setCaption(i, e.target.value)}
                  placeholder="คำบรรยาย (ไม่บังคับ) เช่น สระว่ายน้ำ"
                  className="px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-primary w-full text-sm"
                />
                <p className="text-xs text-gray-400 mt-1 truncate">{it.url}</p>
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
                aria-label="ลบรูป"
                className="px-2 py-1 rounded-md text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 shrink-0"
              >
                ลบ
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <label className="px-4 py-2 rounded-xl bg-white border border-gray-300 text-gray-600 hover:border-primary cursor-pointer text-sm transition">
          {busy ? "กำลังอัปโหลด..." : "+ อัปโหลดรูปเพิ่ม"}
          <input type="file" accept="image/*" onChange={onFile} disabled={busy} className="hidden" />
        </label>
        <div className="flex gap-2 flex-1 min-w-[220px]">
          <input
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                add(urlInput);
              }
            }}
            placeholder="หรือวางลิงก์รูปแล้วกดเพิ่ม"
            className="px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:border-primary flex-1 text-sm"
          />
          <button
            type="button"
            onClick={() => add(urlInput)}
            className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-600 hover:border-primary transition text-sm"
          >
            เพิ่ม
          </button>
        </div>
      </div>

      {err && <p className="text-sm text-red-500">{err}</p>}
    </div>
  );
}

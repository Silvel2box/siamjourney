"use client";

import { useState } from "react";

// Image field for the admin forms: upload a file (auto-resized server-side) OR
// paste a URL. Submits whatever ends up in the text input under `name`.
export default function ImageUploadField({
  name,
  label,
  defaultValue,
}: {
  name: string;
  label: string;
  defaultValue: string;
}) {
  const [url, setUrl] = useState(defaultValue);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

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
      else setUrl(data.url);
    } catch {
      setErr("อัปโหลดไม่สำเร็จ");
    } finally {
      setBusy(false);
      e.target.value = ""; // allow re-selecting the same file
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={name} className="text-sm font-medium text-gray-700">
        {label}
      </label>

      {url && (
        <div className="w-full max-w-xs h-40 rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
          {/* plain img: url may be local (/uploads, /images) or remote; no optimizer needed for a preview */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt="ตัวอย่างรูป" className="object-cover w-full h-full" />
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <label className="px-4 py-2 rounded-xl bg-white border border-gray-300 text-gray-600 hover:border-primary cursor-pointer text-sm transition">
          {busy ? "กำลังอัปโหลด..." : "อัปโหลดรูปจากเครื่อง"}
          <input type="file" accept="image/*" onChange={onFile} disabled={busy} className="hidden" />
        </label>
        <span className="text-xs text-gray-400">หรือวางลิงก์รูปด้านล่าง</span>
      </div>

      <input
        id={name}
        name={name}
        required
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="/uploads/... , /images/... หรือ https://..."
        className="px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-primary w-full"
      />

      {err && <p className="text-sm text-red-500">{err}</p>}
    </div>
  );
}

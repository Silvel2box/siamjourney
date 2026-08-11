"use client";

import { useState } from "react";

// Upload a photo for the middle of an article. Same endpoint as
// ImageUploadField (admin-guarded, resized server-side); the difference is
// where the URL goes — this one writes the markdown into the body textarea at
// the cursor instead of into a field of its own.
const ALT_PLACEHOLDER = "คำอธิบายรูป";
const CAPTION_PLACEHOLDER = "คำบรรยายใต้รูป (ใส่เครดิตตรงนี้)";

export default function BodyImageUploader({
  textareaRef,
}: {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
}) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  function insert(url: string) {
    const el = textareaRef.current;
    if (!el) return;
    const snippet = `\n![${ALT_PLACEHOLDER}](${url} "${CAPTION_PLACEHOLDER}")\n`;
    const start = el.selectionStart;
    el.setRangeText(snippet, start, el.selectionEnd, "end");
    // Leave the alt text selected so the next keystroke replaces it.
    const altAt = start + snippet.indexOf(ALT_PLACEHOLDER);
    el.setSelectionRange(altAt, altAt + ALT_PLACEHOLDER.length);
    el.focus();
  }

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
      else insert(data.url);
    } catch {
      setErr("อัปโหลดไม่สำเร็จ");
    } finally {
      setBusy(false);
      e.target.value = ""; // allow re-selecting the same file
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3 -mt-2">
      <label className="px-4 py-2 rounded-xl bg-white border border-gray-300 text-gray-600 hover:border-primary cursor-pointer text-sm transition">
        {busy ? "กำลังอัปโหลด..." : "แทรกรูปตรงตำแหน่งเคอร์เซอร์"}
        <input type="file" accept="image/*" onChange={onFile} disabled={busy} className="hidden" />
      </label>
      <span className="text-xs text-gray-400">
        รูปจะวางเป็นบรรทัดของตัวเอง แล้วแก้คำอธิบาย/คำบรรยายในข้อความได้เลย
      </span>
      {err && <p className="text-sm text-red-500 w-full">{err}</p>}
    </div>
  );
}

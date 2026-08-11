"use client";

import { useState } from "react";

// Picks the provinces a guide covers. 77 checkboxes would bury the rest of the
// form, so this is a select-to-add plus removable chips — same hidden-input
// contract as GalleryField/HighlightsField (a JSON string the action parses).
export default function ProvincePickerField({
  name,
  label,
  hint,
  options,
  defaultValue,
}: {
  name: string;
  label: string;
  hint?: string;
  options: { slug: string; name: string }[];
  defaultValue: string[];
}) {
  const [picked, setPicked] = useState<string[]>(defaultValue);
  const nameOf = Object.fromEntries(options.map((o) => [o.slug, o.name]));
  const remaining = options.filter((o) => !picked.includes(o.slug));

  return (
    <div className="flex flex-col gap-3">
      <input type="hidden" name={name} value={JSON.stringify(picked)} />
      <span className="text-sm font-medium text-gray-700">{label}</span>
      {hint && <span className="text-xs text-gray-400 -mt-2">{hint}</span>}

      {picked.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {picked.map((slug) => (
            <li key={slug}>
              <button
                type="button"
                onClick={() => setPicked((prev) => prev.filter((s) => s !== slug))}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm hover:bg-primary/20 transition"
              >
                {/* A slug with no matching province still shows, so a province
                    renamed or deleted later is visible instead of silent. */}
                {nameOf[slug] ?? slug}
                <span aria-hidden="true">×</span>
                <span className="sr-only">เอาออก</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <select
        value=""
        onChange={(e) => {
          const v = e.target.value;
          if (v) setPicked((prev) => [...prev, v]);
        }}
        disabled={remaining.length === 0}
        aria-label={label}
        className="px-4 py-3 rounded-xl border border-gray-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 w-full sm:max-w-xs disabled:bg-gray-100 disabled:text-gray-400"
      >
        <option value="">{remaining.length ? "+ เพิ่มจังหวัด" : "เลือกครบทุกจังหวัดแล้ว"}</option>
        {remaining.map((o) => (
          <option key={o.slug} value={o.slug}>
            {o.name}
          </option>
        ))}
      </select>
    </div>
  );
}

"use client";

import { useEffect, useRef } from "react";
import { adsense, adUnitsEnabled } from "@/lib/adsense";

// A single in-content ad placement. Renders a real Google AdSense unit once the
// account is configured (lib/adsense.ts); until then it shows a dashed
// placeholder in dev only and nothing at all on the live site — so unfilled ad
// areas never clutter production. The container reserves height to avoid layout
// shift when an ad loads.
export default function AdSlot({
  label = "โฆษณา",
  slot = adsense.slots.inContent,
  className = "",
}: {
  label?: string;
  slot?: string;
  className?: string;
}) {
  const pushed = useRef(false);

  useEffect(() => {
    if (!adUnitsEnabled || pushed.current) return;
    try {
      const w = window as unknown as { adsbygoogle?: unknown[] };
      (w.adsbygoogle = w.adsbygoogle || []).push({});
      pushed.current = true;
    } catch {
      // AdSense not ready yet — the loader retries on its own.
    }
  }, []);

  if (!adUnitsEnabled) {
    // Dev: show where ads will appear. Prod: render nothing (keep it clean).
    if (process.env.NODE_ENV !== "development") return null;
    return (
      <div
        className={`w-full min-h-[90px] rounded-2xl border border-dashed border-gray-300 bg-white/50 flex items-center justify-center text-gray-400 text-sm ${className}`}
        data-ad-slot
      >
        พื้นที่โฆษณา
      </div>
    );
  }

  return (
    <div className={`w-full text-center ${className}`}>
      <span className="block text-[11px] uppercase tracking-wide text-gray-400 mb-1">
        {label}
      </span>
      <ins
        className="adsbygoogle"
        style={{ display: "block", minHeight: 90 }}
        data-ad-client={adsense.client}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}

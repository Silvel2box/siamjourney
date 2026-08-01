// Single source of truth for Google AdSense.
//
// Two independent switches, because AdSense has two stages:
//   - publisher ID set  → loader script ships (this is what site verification
//     and the account review look for). Ad units stay invisible.
//   - slot ID also set  → real ad units render (only after approval, when the
//     dashboard actually gives you a slot ID).
//
// Both switches are on. Units only fill once the account itself is approved —
// until then AdSense serves nothing and the placement stays blank.
export const adsense = {
  // Publisher ID. The publisher ID is public (it ships in the page HTML), so a
  // plain constant is fine — no env var needed.
  client: "ca-pub-1938381370106852",
  // Per-placement ad unit slot IDs from the AdSense dashboard.
  slots: {
    // "siamjourney-incontent" — Display, responsive. Matches the format AdSlot
    // renders (data-ad-format="auto" + full-width-responsive).
    inContent: "1608333357",
  },
} as const;

// Loader switch: no publisher ID → the whole ad system stays dormant.
export const adsenseEnabled = adsense.client.length > 0;

// Ad-unit switch: rendering <ins> without a real slot ID produces broken units,
// so placements wait for the slot even while the loader is live.
export const adUnitsEnabled = adsenseEnabled && adsense.slots.inContent.length > 0;

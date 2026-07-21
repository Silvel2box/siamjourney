// Single source of truth for Google AdSense.
//
// Two independent switches, because AdSense has two stages:
//   - publisher ID set  → loader script ships (this is what site verification
//     and the account review look for). Ad units stay invisible.
//   - slot ID also set  → real ad units render (only after approval, when the
//     dashboard actually gives you a slot ID).
//
// Remaining step (once the account is approved):
//   1. Create an in-content ad unit in AdSense → paste its slot ID into slots.
//   2. git pull + rebuild on Plesk.
export const adsense = {
  // Publisher ID. The publisher ID is public (it ships in the page HTML), so a
  // plain constant is fine — no env var needed.
  client: "ca-pub-1938381370106852",
  // Per-placement ad unit slot IDs from the AdSense dashboard.
  slots: {
    inContent: "",
  },
} as const;

// Loader switch: no publisher ID → the whole ad system stays dormant.
export const adsenseEnabled = adsense.client.length > 0;

// Ad-unit switch: rendering <ins> without a real slot ID produces broken units,
// so placements wait for the slot even while the loader is live.
export const adUnitsEnabled = adsenseEnabled && adsense.slots.inContent.length > 0;

// Single source of truth for Google AdSense. Empty until we have an approved
// account — while `client` is blank the loader script never loads and no ad
// markup renders (see components/AdSlot.tsx). Fill these in and redeploy to go
// live; nothing else needs to change.
//
// Activation checklist (when the AdSense account is approved):
//   1. Paste the publisher ID below (looks like "ca-pub-1234567890123456").
//   2. Create an in-content ad unit in AdSense → paste its slot ID into slots.
//   3. Add public/ads.txt: `google.com, pub-1234567890123456, DIRECT, f08c47fec0942fa0`
//   4. git pull + rebuild on Plesk.
export const adsense = {
  // Publisher ID. The publisher ID is public (it ships in the page HTML), so a
  // plain constant is fine — no env var needed.
  client: "",
  // Per-placement ad unit slot IDs from the AdSense dashboard.
  slots: {
    inContent: "",
  },
} as const;

// Master switch: no publisher ID → the whole ad system stays dormant.
export const adsenseEnabled = adsense.client.length > 0;

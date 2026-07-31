// Single source of truth for Google Analytics 4.
//
// The measurement ID is public (it ships in the page HTML), so a plain constant
// is fine — no env var needed. Same reasoning as lib/adsense.ts.
//
// SPA navigations are covered by GA4's enhanced measurement ("page changes based
// on browser history events", on by default), so App Router route changes report
// page_view without a client-side listener here.
export const ga4MeasurementId = "G-QP3PRNDD29";

// Empty ID → the whole tag stays off, so a local build never reports into the
// production property.
export const analyticsEnabled = ga4MeasurementId.length > 0;

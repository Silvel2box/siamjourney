// Central affiliate config. Fill in your real affiliate IDs here ONCE — every
// affiliate link across the site (154+ places) picks them up automatically.
// The raw/deep URL stays in each place's markdown; this only appends tracking.
//
// Per network you set:
//   id        = your affiliate ID from that program (empty = not signed up yet)
//   idParam   = the query param that program expects for the affiliate ID
//   subIdParam= the param that program uses for a "sub id" (per-click label)
// ⚠️ ตรวจชื่อ idParam/subIdParam กับเอกสารของแต่ละโปรแกรมก่อนใช้จริง — ค่าด้านล่างเป็นค่าเริ่มต้นทั่วไป
type NetworkCfg = {
  match: string; // substring of the hostname
  idParam: string;
  id: string;
  subIdParam: string;
};

export const affiliateConfig = {
  utmSource: "siamjourney",
  networks: [
    { match: "klook.com", idParam: "aid", id: "", subIdParam: "aff_sub" },
    { match: "agoda.com", idParam: "cid", id: "", subIdParam: "tag" },
    { match: "booking.com", idParam: "aid", id: "", subIdParam: "label" },
    { match: "shopee.", idParam: "af_siteid", id: "", subIdParam: "af_sub_siteid" },
    { match: "lazada.", idParam: "sub_aff_id", id: "", subIdParam: "sub_id" },
  ] as NetworkCfg[],
};

// Returns the outbound URL with affiliate id (if configured), a per-place sub id
// for click attribution, and UTM params for our own analytics.
export function buildAffiliateUrl(rawUrl: string, placeSlug: string): string {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return rawUrl; // leave non-URLs untouched
  }

  const net = affiliateConfig.networks.find((n) =>
    url.hostname.includes(n.match),
  );

  // affiliate ID — only when you've filled it in
  if (net?.id && !url.searchParams.has(net.idParam)) {
    url.searchParams.set(net.idParam, net.id);
  }

  // per-place sub id → see which place drives clicks in the affiliate dashboard
  const subParam = net?.subIdParam ?? "subid";
  if (!url.searchParams.has(subParam)) {
    url.searchParams.set(subParam, placeSlug);
  }

  // UTM for our own analytics (GA etc. later)
  if (!url.searchParams.has("utm_source")) {
    url.searchParams.set("utm_source", affiliateConfig.utmSource);
  }
  if (!url.searchParams.has("utm_medium")) {
    url.searchParams.set("utm_medium", "affiliate");
  }

  return url.toString();
}

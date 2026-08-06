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
  // Some programs don't take the affiliate id on the destination URL at all.
  // Klook hands out a redirect endpoint that carries the id and swallows the
  // real page in a `k_site` param. Set this to that endpoint to get a wrapped
  // link; leave it off and the id is appended to the destination instead.
  redirectBase?: string;
  // A sub id the program will only accept if it was created in their dashboard
  // first. Klook silently drops the visitor on its homepage — not the product
  // page — when it doesn't recognise the aff_label1 it is handed, so the value
  // cannot be the place slug. Leave unset to keep using the per-place slug.
  // Which page a click came from is answered by GA4 outbound clicks instead.
  fixedSubId?: string;
  // Some programs hand out links that already carry every bit of tracking they
  // need — Shopee's affiliate short links are one. Appending our own params to
  // those can only cost us the attribution they arrived with, so they go out
  // byte for byte as given.
  preTracked?: boolean;
};

export const affiliateConfig = {
  utmSource: "siamjourney",
  networks: [
    {
      match: "klook.com",
      idParam: "aid",
      id: "129762",
      subIdParam: "aff_label1",
      fixedSubId: "sj01",
      redirectBase: "https://affiliate.klook.com/redirect",
    },
    { match: "agoda.com", idParam: "cid", id: "", subIdParam: "tag" },
    { match: "booking.com", idParam: "aid", id: "", subIdParam: "label" },
    // Ahead of the generic shopee entry on purpose — "s.shopee.co.th" matches
    // both, and the first match wins.
    { match: "s.shopee.", idParam: "", id: "", subIdParam: "", preTracked: true },
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

  // Already tracked by whoever generated it — hands off.
  if (net?.preTracked) return rawUrl;

  // Wrapped programs (Klook): the destination goes in untouched and all the
  // tracking rides on the wrapper.
  if (net?.id && net.redirectBase) {
    const wrapper = new URL(net.redirectBase);
    wrapper.searchParams.set(net.idParam, net.id);
    wrapper.searchParams.set("_currency", "THB");
    wrapper.searchParams.set("k_site", url.toString());
    wrapper.searchParams.set(net.subIdParam, net.fixedSubId ?? placeSlug);
    return wrapper.toString();
  }

  // affiliate ID — only when you've filled it in
  if (net?.id && !url.searchParams.has(net.idParam)) {
    url.searchParams.set(net.idParam, net.id);
  }

  // per-place sub id → see which place drives clicks in the affiliate dashboard.
  // Only once there is an affiliate id for it to hang off: a sub id on its own
  // reports to nobody, and until today every Shopee link on the site was going
  // out carrying one.
  if (net?.id && !url.searchParams.has(net.subIdParam)) {
    url.searchParams.set(net.subIdParam, placeSlug);
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

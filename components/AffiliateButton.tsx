import { buildAffiliateUrl } from "@/lib/affiliate";

// Outbound partner link ("ติดแท๊กขาย"). The raw URL comes from the place's
// markdown; buildAffiliateUrl centrally adds your affiliate id + per-place
// tracking. rel="sponsored nofollow" marks the monetized link honestly.
export default function AffiliateButton({
  label,
  url,
  placeSlug,
}: {
  label: string;
  url: string;
  placeSlug: string;
}) {
  const href = buildAffiliateUrl(url, placeSlug);
  return (
    <a
      href={href}
      target="_blank"
      rel="sponsored nofollow noopener"
      className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-full font-medium hover:bg-yellow-600 transition shadow-lg shadow-primary/30"
    >
      <i className="fas fa-tag" />
      {label}
    </a>
  );
}

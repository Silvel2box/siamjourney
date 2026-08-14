import Image from "next/image";
import { buildAffiliateUrl, trackedHref } from "@/lib/affiliate";

// Outbound partner link ("ติดแท๊กขาย"). The raw URL comes from the place's
// markdown; buildAffiliateUrl centrally adds your affiliate id + per-place
// tracking. rel="sponsored nofollow" marks the monetized link honestly.
//
// Given a product photo it renders as a card, which reads as an offer rather
// than a link and is far likelier to be clicked. That is also why the card
// carries a visible "พาร์ทเนอร์" badge: a photo makes it look like our own
// editorial, and the moment it does, saying who is paying stops being optional.
export default function AffiliateButton({
  label,
  url,
  image,
  placeSlug,
}: {
  label: string;
  url: string;
  image?: string;
  placeSlug: string;
}) {
  // The finished partner URL, then wrapped in our own /go so the click is
  // counted in a table we keep — GA4 sees these too, but not when a visitor
  // blocks it.
  const href = trackedHref(buildAffiliateUrl(url, placeSlug), placeSlug);
  const common = { href, target: "_blank", rel: "sponsored nofollow noopener" } as const;

  // Named from the destination rather than hardcoded — this same card is what
  // Shopee or a booking site would get once their feed brings photos too.
  let partner = "";
  try {
    partner = new URL(url).hostname.replace(/^www\./, "");
  } catch {
    /* a malformed url still renders; buildAffiliateUrl passes it through */
  }

  if (!image) {
    return (
      <a
        {...common}
        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-full font-medium hover:bg-primary-dark transition shadow-lg shadow-primary/30"
      >
        <i className="fas fa-tag" />
        {label}
      </a>
    );
  }

  return (
    <a
      {...common}
      className="block sm:flex items-stretch h-full bg-white rounded-2xl shadow-sm hover:shadow-lg transition overflow-hidden"
    >
      <div className="relative h-44 sm:h-auto sm:w-52 shrink-0">
        <Image
          src={image}
          alt={label}
          fill
          sizes="(max-width: 640px) 100vw, 208px"
          className="object-cover"
        />
      </div>
      <div className="flex flex-col justify-center gap-2 p-5">
        <span className="text-xs text-gray-500 tracking-wide">
          พาร์ทเนอร์{partner && ` · ${partner}`}
        </span>
        <span className="font-heading font-bold text-lg text-dark leading-snug">
          {label}
        </span>
        <span className="inline-flex items-center gap-2 text-primary font-medium">
          <i className="fas fa-tag" />
          ดูรายละเอียดและจอง
        </span>
      </div>
    </a>
  );
}

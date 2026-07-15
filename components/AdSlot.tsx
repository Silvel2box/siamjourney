// Placeholder ad slot. Swap the inner markup for a Google AdSense unit (or a
// direct-sold banner) later. Reserves layout space now so nothing shifts then.
export default function AdSlot({
  label = "พื้นที่โฆษณา",
  className = "",
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={`w-full min-h-[90px] rounded-2xl border border-dashed border-gray-300 bg-white/50 flex items-center justify-center text-gray-400 text-sm ${className}`}
      data-ad-slot
    >
      {label}
    </div>
  );
}

"use client";

// Small delete form with a native confirm(). The server action is passed in so
// this stays generic for places and provinces. `disabledReason` shows a tooltip
// and blocks deletion (e.g. a province that still has places).
export default function DeleteButton({
  action,
  id,
  name,
  disabledReason,
}: {
  action: (fd: FormData) => void | Promise<void>;
  id: number;
  name: string;
  disabledReason?: string;
}) {
  if (disabledReason) {
    return (
      <span
        title={disabledReason}
        className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-400 cursor-not-allowed"
      >
        ลบ
      </span>
    );
  }
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(`ลบ "${name}" ? การลบนี้ย้อนกลับไม่ได้`)) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="px-3 py-1 rounded-full text-xs font-medium bg-red-600 text-white hover:bg-red-700 transition"
      >
        ลบ
      </button>
    </form>
  );
}

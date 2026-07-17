"use client";

import { useActionState } from "react";
import { updateShop } from "@/app/actions/shop";

type State = { error: string } | { ok: true } | null;
type Option = { slug: string; name: string };

export type ShopValues = {
  shopName: string;
  description: string;
  province: string;
  category: string;
  address: string;
  phone: string;
  website: string;
  image: string;
};

const inputClass =
  "px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-primary";

// Merchant-facing form to edit the shop profile. Prefilled with current values;
// the server action reads the merchant from the session, not from this form.
export default function ShopForm({
  values,
  provinces,
  categories,
}: {
  values: ShopValues;
  provinces: Option[];
  categories: Option[];
}) {
  const [state, formAction, pending] = useActionState<State, FormData>(
    updateShop,
    null,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="shopName" className="text-sm font-medium text-gray-700">
          ชื่อร้าน *
        </label>
        <input
          id="shopName"
          name="shopName"
          required
          defaultValue={values.shopName}
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="description" className="text-sm font-medium text-gray-700">
          รายละเอียดร้าน
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          defaultValue={values.description}
          placeholder="เล่าเกี่ยวกับร้านของคุณ สินค้าหรือบริการเด่น ๆ"
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="province" className="text-sm font-medium text-gray-700">
            จังหวัด
          </label>
          <select
            id="province"
            name="province"
            defaultValue={values.province}
            className={inputClass}
          >
            <option value="">— เลือกจังหวัด —</option>
            {provinces.map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="category" className="text-sm font-medium text-gray-700">
            หมวดร้าน
          </label>
          <select
            id="category"
            name="category"
            defaultValue={values.category}
            className={inputClass}
          >
            <option value="">— เลือกหมวด —</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="address" className="text-sm font-medium text-gray-700">
          ที่อยู่
        </label>
        <input
          id="address"
          name="address"
          defaultValue={values.address}
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="phone" className="text-sm font-medium text-gray-700">
            เบอร์โทร
          </label>
          <input
            id="phone"
            name="phone"
            defaultValue={values.phone}
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="website" className="text-sm font-medium text-gray-700">
            เว็บไซต์ / โซเชียล
          </label>
          <input
            id="website"
            name="website"
            type="url"
            defaultValue={values.website}
            placeholder="https://"
            className={inputClass}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="image" className="text-sm font-medium text-gray-700">
          รูปร้าน (ลิงก์รูป)
        </label>
        <input
          id="image"
          name="image"
          type="url"
          defaultValue={values.image}
          placeholder="https://"
          className={inputClass}
        />
      </div>

      {state && "error" in state && (
        <p className="text-sm text-red-500">{state.error}</p>
      )}
      {state && "ok" in state && (
        <p className="text-sm text-green-600">บันทึกข้อมูลร้านแล้ว</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 self-start px-8 py-3 bg-dark text-white rounded-full font-medium hover:bg-primary transition disabled:opacity-60"
      >
        {pending ? "กำลังบันทึก..." : "บันทึกข้อมูลร้าน"}
      </button>
    </form>
  );
}

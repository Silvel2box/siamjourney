"use client";

import { useActionState } from "react";
import { savePlace } from "@/app/actions/content";

type State = { error: string } | null;
type Option = { slug: string; name: string };

export type PlaceFormValues = {
  id?: number;
  slug: string;
  name: string;
  category: string;
  province: string;
  summary: string;
  image: string;
  imageCreditAuthor: string;
  imageCreditSource: string;
  imageCreditSourceUrl: string;
  imageCreditLicense: string;
  address: string;
  hours: string;
  priceRange: string;
  lat: string;
  lng: string;
  affiliateLabel: string;
  affiliateUrl: string;
  sponsored: string;
  body: string;
};

const input =
  "px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-primary w-full";
const labelCls = "text-sm font-medium text-gray-700";

function Field({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className={labelCls}>
        {label}
      </label>
      {children}
    </div>
  );
}

export default function PlaceForm({
  values,
  provinces,
  categories,
  mode,
}: {
  values: PlaceFormValues;
  provinces: Option[];
  categories: Option[];
  mode: "create" | "edit";
}) {
  const [state, formAction, pending] = useActionState<State, FormData>(savePlace, null);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {values.id != null && <input type="hidden" name="id" value={values.id} />}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field id="name" label="ชื่อสถานที่ *">
          <input id="name" name="name" required defaultValue={values.name} className={input} />
        </Field>
        <Field id="slug" label={mode === "edit" ? "slug (แก้ไม่ได้)" : "slug * (a-z 0-9 -)"}>
          <input
            id="slug"
            name="slug"
            required
            readOnly={mode === "edit"}
            defaultValue={values.slug}
            placeholder="เช่น chiang-mai-doi-suthep"
            className={`${input} ${mode === "edit" ? "bg-gray-100 text-gray-500" : ""}`}
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Field id="category" label="หมวด *">
          <select id="category" name="category" required defaultValue={values.category} className={input}>
            <option value="">— เลือก —</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
        <Field id="province" label="จังหวัด *">
          <select id="province" name="province" required defaultValue={values.province} className={input}>
            <option value="">— เลือก —</option>
            {provinces.map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.name}
              </option>
            ))}
          </select>
        </Field>
        <Field id="sponsored" label="สถานะ">
          <select id="sponsored" name="sponsored" defaultValue={values.sponsored || "0"} className={input}>
            <option value="0">ปกติ</option>
            <option value="1">แนะนำ (ขึ้นบน)</option>
            <option value="2">พาร์ทเนอร์ (จ่ายเงิน)</option>
          </select>
        </Field>
      </div>

      <Field id="summary" label="คำโปรย (สรุปสั้น) *">
        <input id="summary" name="summary" required defaultValue={values.summary} className={input} />
      </Field>

      <Field id="body" label="เนื้อหา (รองรับ markdown) *">
        <textarea id="body" name="body" required rows={6} defaultValue={values.body} className={input} />
      </Field>

      <Field id="image" label="รูป (URL หรือ /images/...) *">
        <input id="image" name="image" required defaultValue={values.image} className={input} />
      </Field>

      <fieldset className="border border-gray-200 rounded-2xl p-4">
        <legend className="text-sm font-medium text-gray-600 px-2">เครดิตรูป (ถ้ามี)</legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field id="imageCreditAuthor" label="ผู้ถ่าย / เจ้าของ">
            <input id="imageCreditAuthor" name="imageCreditAuthor" defaultValue={values.imageCreditAuthor} className={input} />
          </Field>
          <Field id="imageCreditSource" label="แหล่ง (เช่น Wikimedia Commons / Pexels)">
            <input id="imageCreditSource" name="imageCreditSource" defaultValue={values.imageCreditSource} className={input} />
          </Field>
          <Field id="imageCreditSourceUrl" label="ลิงก์แหล่งที่มา">
            <input id="imageCreditSourceUrl" name="imageCreditSourceUrl" defaultValue={values.imageCreditSourceUrl} className={input} />
          </Field>
          <Field id="imageCreditLicense" label="ไลเซนส์ (เช่น CC BY 4.0)">
            <input id="imageCreditLicense" name="imageCreditLicense" defaultValue={values.imageCreditLicense} className={input} />
          </Field>
        </div>
      </fieldset>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Field id="address" label="ที่อยู่">
          <input id="address" name="address" defaultValue={values.address} className={input} />
        </Field>
        <Field id="hours" label="เวลาเปิด-ปิด">
          <input id="hours" name="hours" defaultValue={values.hours} className={input} />
        </Field>
        <Field id="priceRange" label="ช่วงราคา">
          <input id="priceRange" name="priceRange" defaultValue={values.priceRange} className={input} />
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field id="lat" label="ละติจูด (lat)">
          <input id="lat" name="lat" defaultValue={values.lat} placeholder="เช่น 18.8047" className={input} />
        </Field>
        <Field id="lng" label="ลองจิจูด (lng)">
          <input id="lng" name="lng" defaultValue={values.lng} placeholder="เช่น 98.9217" className={input} />
        </Field>
      </div>

      <fieldset className="border border-gray-200 rounded-2xl p-4">
        <legend className="text-sm font-medium text-gray-600 px-2">ลิงก์พาร์ทเนอร์ / affiliate (ถ้ามี)</legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field id="affiliateLabel" label="ข้อความปุ่ม">
            <input id="affiliateLabel" name="affiliateLabel" defaultValue={values.affiliateLabel} placeholder="เช่น จองที่พัก" className={input} />
          </Field>
          <Field id="affiliateUrl" label="ลิงก์ (http...)">
            <input id="affiliateUrl" name="affiliateUrl" type="url" defaultValue={values.affiliateUrl} placeholder="https://" className={input} />
          </Field>
        </div>
      </fieldset>

      {state && "error" in state && <p className="text-sm text-red-500">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 self-start px-8 py-3 bg-dark text-white rounded-full font-medium hover:bg-primary transition disabled:opacity-60"
      >
        {pending ? "กำลังบันทึก..." : mode === "create" ? "เพิ่มสถานที่" : "บันทึกการแก้ไข"}
      </button>
    </form>
  );
}

"use client";

import { useActionState } from "react";
import { saveGuide } from "@/app/actions/content";
import ImageUploadField from "@/components/admin/ImageUploadField";
import ProvincePickerField from "@/components/admin/ProvincePickerField";

type State = { error: string } | null;
type Option = { slug: string; name: string };

export type GuideFormValues = {
  id?: number;
  slug: string;
  title: string;
  summary: string;
  image: string;
  imageCreditAuthor: string;
  imageCreditSource: string;
  imageCreditSourceUrl: string;
  imageCreditLicense: string;
  provinces: string[];
  featured: boolean;
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

export default function GuideForm({
  values,
  provinces,
  mode,
}: {
  values: GuideFormValues;
  provinces: Option[];
  mode: "create" | "edit";
}) {
  const [state, formAction, pending] = useActionState<State, FormData>(saveGuide, null);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {values.id != null && <input type="hidden" name="id" value={values.id} />}

      <Field id="title" label="หัวข้อบทความ *">
        <input id="title" name="title" required defaultValue={values.title} className={input} />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field id="slug" label={mode === "edit" ? "slug (แก้ไม่ได้)" : "slug * (a-z 0-9 -)"}>
          <input
            id="slug"
            name="slug"
            required
            readOnly={mode === "edit"}
            defaultValue={values.slug}
            placeholder="เช่น chiang-mai-3-days"
            className={`${input} ${mode === "edit" ? "bg-gray-100 text-gray-500" : ""}`}
          />
        </Field>
        <div className="flex items-end">
          <label className="flex items-center gap-3 px-4 py-3 text-gray-700">
            <input
              type="checkbox"
              name="featured"
              defaultChecked={values.featured}
              className="w-5 h-5 accent-[var(--color-primary)]"
            />
            แนะนำ (ขึ้นบนสุดในหน้ารวมบทความ)
          </label>
        </div>
      </div>

      <Field id="summary" label="คำโปรย (สรุปสั้น — ใช้เป็น meta description ด้วย) *">
        <input id="summary" name="summary" required defaultValue={values.summary} className={input} />
      </Field>

      <Field id="body" label="เนื้อหา (markdown — ใช้ได้เฉพาะย่อหน้า, ## หัวข้อ, - รายการ และลิงก์) *">
        <textarea id="body" name="body" required rows={18} defaultValue={values.body} className={input} />
      </Field>

      <ImageUploadField name="image" label="รูปปกบทความ *" defaultValue={values.image} />

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

      <ProvincePickerField
        name="provinces"
        label="จังหวัดที่บทความนี้พูดถึง"
        hint="บทความจะไปโผล่ในหน้าจังหวัดที่เลือก และหน้าบทความจะแสดงการ์ดจังหวัดเหล่านี้"
        options={provinces}
        defaultValue={values.provinces}
      />

      {state && "error" in state && <p className="text-sm text-red-500">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 self-start px-8 py-3 bg-dark text-white rounded-full font-medium hover:bg-primary transition disabled:opacity-60"
      >
        {pending ? "กำลังบันทึก..." : mode === "create" ? "เพิ่มบทความ" : "บันทึกการแก้ไข"}
      </button>
    </form>
  );
}

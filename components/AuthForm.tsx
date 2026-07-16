"use client";

import { useActionState } from "react";
import Link from "next/link";

type State = { error: string } | null;
type Action = (prev: State, formData: FormData) => Promise<State>;

// Shared credential form for both /register and /login.
export default function AuthForm({
  mode,
  action,
}: {
  mode: "register" | "login";
  action: Action;
}) {
  const [state, formAction, pending] = useActionState(action, null);
  const isRegister = mode === "register";

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {isRegister && (
        <div className="flex flex-col gap-1">
          <label htmlFor="shopName" className="text-sm font-medium text-gray-700">
            ชื่อร้าน
          </label>
          <input
            id="shopName"
            name="shopName"
            required
            placeholder="เช่น ร้านกาแฟดอยคำ"
            className="px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-primary"
          />
        </div>
      )}

      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-sm font-medium text-gray-700">
          อีเมล
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          placeholder="you@example.com"
          className="px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-primary"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="text-sm font-medium text-gray-700">
          รหัสผ่าน
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={isRegister ? 8 : undefined}
          placeholder={isRegister ? "อย่างน้อย 8 ตัวอักษร" : "รหัสผ่าน"}
          className="px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-primary"
        />
      </div>

      {state?.error && <p className="text-sm text-red-500">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 px-8 py-3 bg-dark text-white rounded-full font-medium hover:bg-primary transition disabled:opacity-60"
      >
        {pending
          ? "กำลังดำเนินการ..."
          : isRegister
            ? "สมัครร้านค้า"
            : "เข้าสู่ระบบ"}
      </button>

      <p className="text-sm text-gray-500 text-center">
        {isRegister ? (
          <>
            มีบัญชีอยู่แล้ว?{" "}
            <Link href="/login" className="text-primary hover:underline">
              เข้าสู่ระบบ
            </Link>
          </>
        ) : (
          <>
            ยังไม่มีบัญชีร้านค้า?{" "}
            <Link href="/register" className="text-primary hover:underline">
              สมัครร้านค้า
            </Link>
          </>
        )}
      </p>
    </form>
  );
}

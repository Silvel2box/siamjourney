"use client";

import { useActionState } from "react";
import { subscribe } from "@/app/actions/newsletter";

export default function NewsletterForm() {
  const [state, formAction, pending] = useActionState(subscribe, null);

  return (
    <div className="max-w-2xl mx-auto">
      <form
        action={formAction}
        className="flex flex-col sm:flex-row gap-4 justify-center"
      >
        <input
          type="email"
          name="email"
          required
          placeholder="กรอกอีเมลของคุณ"
          className="px-6 py-4 rounded-full border border-gray-300 w-full sm:w-2/3 focus:outline-none focus:border-primary"
        />
        <button
          type="submit"
          disabled={pending}
          className="px-8 py-4 bg-dark text-white rounded-full font-medium hover:bg-primary transition w-full sm:w-1/3 disabled:opacity-60"
        >
          {pending ? "กำลังส่ง..." : "ติดตามข่าวสาร"}
        </button>
      </form>
      {state && (
        <p
          className={`mt-4 text-sm ${state.ok ? "text-green-600" : "text-red-500"}`}
        >
          {state.message}
        </p>
      )}
    </div>
  );
}

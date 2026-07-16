import type { Metadata } from "next";
import { redirect } from "next/navigation";
import PageBanner from "@/components/PageBanner";
import AuthForm from "@/components/AuthForm";
import { login } from "@/app/actions/auth";
import { getMerchant } from "@/lib/auth";

export const metadata: Metadata = {
  title: "เข้าสู่ระบบร้านค้า",
  description: "เข้าสู่ระบบเพื่อจัดการร้านค้าของคุณบน SiamJourney",
  robots: { index: false },
};

export default async function LoginPage() {
  if (await getMerchant()) redirect("/dashboard");

  return (
    <>
      <PageBanner
        title="เข้าสู่ระบบร้านค้า"
        subtitle="จัดการร้านค้าของคุณบน SiamJourney"
        crumbs={[{ label: "เข้าสู่ระบบ" }]}
      />
      <section className="py-16 bg-light">
        <div className="container mx-auto px-6 md:px-12 max-w-md">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <AuthForm mode="login" action={login} />
          </div>
        </div>
      </section>
    </>
  );
}

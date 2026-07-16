import type { Metadata } from "next";
import { redirect } from "next/navigation";
import PageBanner from "@/components/PageBanner";
import AuthForm from "@/components/AuthForm";
import { register } from "@/app/actions/auth";
import { getMerchant } from "@/lib/auth";

export const metadata: Metadata = {
  title: "สมัครร้านค้า",
  description: "ลงทะเบียนร้านค้าเพื่อโปรโมตธุรกิจของคุณบน SiamJourney",
  robots: { index: false },
};

export default async function RegisterPage() {
  if (await getMerchant()) redirect("/dashboard");

  return (
    <>
      <PageBanner
        title="สมัครร้านค้า"
        subtitle="ลงทะเบียนเพื่อโปรโมตร้านของคุณบน SiamJourney"
        crumbs={[{ label: "สมัครร้านค้า" }]}
      />
      <section className="py-16 bg-light">
        <div className="container mx-auto px-6 md:px-12 max-w-md">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <AuthForm mode="register" action={register} />
          </div>
        </div>
      </section>
    </>
  );
}

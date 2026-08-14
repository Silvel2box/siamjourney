import { site } from "@/lib/site";

// Outgoing mail through Resend's HTTP API.
//
// An API call rather than SMTP because Node cannot speak SMTP without a library,
// and mail sent from a shared Plesk address lands in junk often enough to make
// "we sent you a link" a lie. Everything here is one fetch.
//
// Setup (all in Plesk's environment variables, nothing in the repo):
//   RESEND_API_KEY = the key from resend.com
//   EMAIL_FROM     = "SiamJourney <noreply@siam-journey.com>"
// The domain has to be verified at Resend first (they give the DNS records).
// With either variable missing the site keeps working — mail is skipped and the
// link is written to the log instead, which is also how it is read in dev.

const ENDPOINT = "https://api.resend.com/emails";

export const emailConfigured = Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);

export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
}): Promise<boolean> {
  if (!emailConfigured) {
    console.warn(`[email] ยังไม่ได้ตั้ง RESEND_API_KEY/EMAIL_FROM — ไม่ได้ส่งถึง ${opts.to}`);
    return false;
  }

  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: process.env.EMAIL_FROM, ...opts }),
      // A slow provider must not hold a form submit open.
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
      console.error(`[email] ส่งไม่สำเร็จ ${res.status}`, await res.text().catch(() => ""));
      return false;
    }
    return true;
  } catch (e) {
    console.error("[email] ส่งไม่สำเร็จ", e);
    return false;
  }
}

// The one message the site sends. Kept here so the link and the wording live
// together with the transport that carries them.
export async function sendVerifyEmail(to: string, token: string): Promise<boolean> {
  const link = `${site.url}/verify?token=${encodeURIComponent(token)}`;
  console.info(`[email] ลิงก์ยืนยันของ ${to}: ${link}`);

  return sendEmail({
    to,
    subject: `ยืนยันอีเมลสำหรับร้านค้าบน ${site.name}`,
    html: `
      <div style="font-family:sans-serif;line-height:1.7;color:#222">
        <p>ขอบคุณที่สมัครร้านค้ากับ ${site.name} ครับ</p>
        <p>กดลิงก์ด้านล่างเพื่อยืนยันว่าอีเมลนี้เป็นของคุณจริง ลิงก์ใช้ได้ 24 ชั่วโมง</p>
        <p><a href="${link}" style="color:#c28e46">${link}</a></p>
        <p style="color:#666;font-size:14px">ถ้าคุณไม่ได้สมัคร ไม่ต้องทำอะไร บัญชีจะไม่ถูกใช้งาน</p>
      </div>
    `,
  });
}

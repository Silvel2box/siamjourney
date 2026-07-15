import Link from "next/link";
import { site } from "@/lib/site";
import { regions } from "@/lib/regions";

export default function Footer() {
  return (
    <footer
      id="contact"
      className="bg-dark text-white pt-20 pb-10 border-t border-white/10"
    >
      <div className="container mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="md:col-span-1">
            <Link
              href="/"
              className="font-heading font-bold text-2xl tracking-wider mb-6 block"
            >
              SIAM<span className="text-primary">JOURNEY</span>
            </Link>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
              {site.description}
            </p>
            <div className="flex space-x-4">
              {[
                { icon: "facebook-f", href: site.social.facebook },
                { icon: "instagram", href: site.social.instagram },
                { icon: "twitter", href: site.social.twitter },
              ].map((s) => (
                <a
                  key={s.icon}
                  href={s.href}
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-primary transition"
                >
                  <i className={`fab fa-${s.icon}`} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-heading font-medium text-lg mb-6">เมนูหลัก</h4>
            <ul className="space-y-3 text-gray-400 text-sm">
              <li><Link href="/" className="hover:text-primary transition">หน้าแรก</Link></li>
              <li><Link href="/#destinations" className="hover:text-primary transition">จุดหมายยอดฮิต</Link></li>
              <li><Link href="/#regions" className="hover:text-primary transition">ภูมิภาค</Link></li>
              <li><Link href="/#about" className="hover:text-primary transition">เกี่ยวกับเรา</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-medium text-lg mb-6">ภูมิภาค</h4>
            <ul className="space-y-3 text-gray-400 text-sm">
              {regions.map((r) => (
                <li key={r.slug}>
                  <Link href={`/${r.slug}`} className="hover:text-primary transition">
                    {r.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-medium text-lg mb-6">ติดต่อเรา</h4>
            <ul className="space-y-3 text-gray-400 text-sm">
              <li className="flex items-start gap-3">
                <i className="fas fa-map-marker-alt mt-1 text-primary" />
                <span>กรุงเทพมหานคร, ประเทศไทย</span>
              </li>
              <li className="flex items-center gap-3">
                <i className="fas fa-envelope text-primary" />
                <span>{site.email}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <p>&copy; 2026 {site.name}. All rights reserved.</p>
          <div className="flex space-x-6">
            <Link href="/privacy" className="hover:text-white transition">นโยบายความเป็นส่วนตัว</Link>
            <Link href="/terms" className="hover:text-white transition">เงื่อนไขการให้บริการ</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

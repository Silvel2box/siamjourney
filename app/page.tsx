import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getAllProvinces, getFeaturedProvinces } from "@/lib/content";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};
import ProvinceCard from "@/components/ProvinceCard";
import RegionGrid from "@/components/RegionGrid";
import ProvinceSearch from "@/components/ProvinceSearch";
import AdSlot from "@/components/AdSlot";
import NewsletterForm from "@/components/NewsletterForm";

export default function Home() {
  const featured = getFeaturedProvinces();
  const provinces = getAllProvinces().map((p) => ({
    slug: p.slug,
    name: p.name,
    region: p.region,
  }));

  return (
    <>
      {/* Hero */}
      <section
        className="relative h-screen bg-parallax flex items-center justify-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=1920&q=80')",
        }}
      >
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto mt-20 reveal">
          <span className="text-primary font-heading tracking-widest uppercase text-sm md:text-base font-semibold mb-4 block">
            Unseen Thailand
          </span>
          <h1 className="text-5xl md:text-7xl font-heading font-bold text-white mb-6 leading-tight">
            สัมผัสความงาม
            <br />
            ของประเทศไทย
          </h1>
          <p className="text-lg md:text-xl text-gray-200 mb-10 font-light max-w-2xl mx-auto">
            ค้นพบสถานที่ท่องเที่ยว ร้านอาหาร คาเฟ่ และสินค้า OTOP ประจำท้องถิ่นทั่วแดนสยาม 77 จังหวัด
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="#destinations"
              className="px-8 py-4 bg-primary text-white rounded-full font-medium hover:bg-yellow-600 transition shadow-lg shadow-primary/30 flex items-center justify-center gap-2"
            >
              ออกเดินทาง <i className="fas fa-arrow-right" />
            </Link>
            <Link
              href="#regions"
              className="px-8 py-4 bg-white/20 backdrop-blur-md text-white rounded-full font-medium hover:bg-white hover:text-dark transition"
            >
              ค้นหาจังหวัด
            </Link>
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-24 bg-white">
        <div className="container mx-auto px-6 md:px-12">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2 reveal">
              <div className="relative img-zoom-container rounded-3xl shadow-2xl h-[500px]">
                <Image
                  src="https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1000&q=80"
                  alt="วัฒนธรรมไทย"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
                <div className="absolute -bottom-10 -right-10 bg-white p-6 rounded-2xl shadow-xl hidden md:block border border-gray-100">
                  <p className="font-heading font-bold text-4xl text-primary">77</p>
                  <p className="text-gray-600">จังหวัดให้คุณค้นหา</p>
                </div>
              </div>
            </div>
            <div className="lg:w-1/2 reveal delay-100">
              <h2 className="text-4xl font-heading font-bold text-dark mb-6">
                ความมหัศจรรย์ที่รอคุณอยู่
                <br />
                ในทุกมุมของประเทศ
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed text-lg text-justify">
                ไม่ว่าคุณจะหลงใหลในเกาะสวรรค์ทางภาคใต้ ทะเลหมอกทางภาคเหนือ อารยธรรมโบราณในภาคอีสาน หรือสีสันของเมืองหลวง เราคัดสถานที่ท่องเที่ยว ร้านอาหาร คาเฟ่ และของดีประจำถิ่นมาให้คุณครบในที่เดียว
              </p>
              <ul className="space-y-4">
                {[
                  { icon: "mountain", text: "ธรรมชาติที่อุดมสมบูรณ์" },
                  { icon: "utensils", text: "อาหารท้องถิ่นรสเลิศ" },
                  { icon: "store", text: "สินค้า OTOP ประจำท้องถิ่น" },
                ].map((item) => (
                  <li key={item.icon} className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <i className={`fas fa-${item.icon}`} />
                    </div>
                    <span className="text-lg font-medium">{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Popular destinations */}
      <section id="destinations" className="py-24 bg-light">
        <div className="container mx-auto px-6 md:px-12">
          <div className="text-center max-w-2xl mx-auto mb-16 reveal">
            <span className="text-primary font-medium tracking-wider mb-2 block">
              TOP DESTINATIONS
            </span>
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-dark mb-4">
              จุดหมายปลายทางยอดฮิต
            </h2>
            <p className="text-gray-600 text-lg">
              เริ่มต้นแรงบันดาลใจในการเดินทางกับจังหวัดที่คัดมาแล้ว
            </p>
          </div>

          {featured.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featured.map((p) => (
                <ProvinceCard key={p.slug} province={p} />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500">เร็วๆ นี้</p>
          )}

          <div className="mt-12">
            <AdSlot />
          </div>
        </div>
      </section>

      {/* Regions + search */}
      <section
        id="regions"
        className="py-24 bg-dark text-white relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/20 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4" />

        <div className="container mx-auto px-6 md:px-12 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between mb-16 gap-8">
            <div className="lg:w-1/2 reveal">
              <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6">
                เที่ยวทั่วไทย ไปได้ทุกที่
                <br />
                <span className="text-primary">ทั้ง 77 จังหวัด</span>
              </h2>
              <p className="text-gray-400 text-lg mb-8 max-w-lg">
                ค้นหาสถานที่ท่องเที่ยวและของดีประจำถิ่น พิมพ์ชื่อจังหวัด หรือเลือกตามภูมิภาคได้เลย
              </p>
              <ProvinceSearch provinces={provinces} />
            </div>
            <div className="lg:w-1/2 w-full reveal delay-100">
              <RegionGrid />
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter CTA (static placeholder — no backend yet) */}
      <section className="py-24 bg-white text-center">
        <div className="container mx-auto px-6 max-w-4xl reveal">
          <h2 className="text-4xl md:text-5xl font-heading font-bold text-dark mb-6">
            พร้อมออกเดินทางแล้วหรือยัง?
          </h2>
          <p className="text-xl text-gray-600 mb-10">
            สมัครรับข่าวสารการท่องเที่ยวและโปรโมชั่นพิเศษก่อนใคร
          </p>
          <NewsletterForm />
        </div>
      </section>
    </>
  );
}

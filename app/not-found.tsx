import Link from "next/link";

export default function NotFound() {
  return (
    <section className="relative min-h-[80vh] flex items-center justify-center bg-dark text-white overflow-hidden pt-24">
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/20 rounded-full blur-[120px] -translate-y-1/3 translate-x-1/3" />
      <div className="relative z-10 text-center px-6 max-w-xl">
        <p className="font-heading font-bold text-8xl md:text-9xl text-primary mb-4">
          404
        </p>
        <h1 className="text-3xl md:text-4xl font-heading font-bold mb-4">
          ไม่พบหน้าที่คุณกำลังหา
        </h1>
        <p className="text-gray-400 text-lg mb-10">
          หน้านี้อาจถูกย้ายหรือไม่มีอยู่แล้ว ลองกลับไปเริ่มต้นการเดินทางใหม่อีกครั้ง
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link
            href="/"
            className="px-8 py-4 bg-primary text-white rounded-full font-medium hover:bg-yellow-600 transition shadow-lg shadow-primary/30 flex items-center justify-center gap-2"
          >
            <i className="fas fa-house" /> กลับหน้าแรก
          </Link>
          <Link
            href="/#regions"
            className="px-8 py-4 bg-white/10 backdrop-blur-md text-white rounded-full font-medium hover:bg-white hover:text-dark transition"
          >
            ค้นหาจังหวัด
          </Link>
        </div>
      </div>
    </section>
  );
}

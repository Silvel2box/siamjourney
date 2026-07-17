"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { site } from "@/lib/site";

const links = [
  { href: "/#destinations", label: "จุดหมายยอดฮิต" },
  { href: "/#regions", label: "ภูมิภาค" },
  { href: "/#about", label: "เกี่ยวกับเรา" },
  { href: "/dashboard", label: "สำหรับร้านค้า" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled ? "nav-scrolled py-3" : "py-4"
      }`}
    >
      <div className="container mx-auto px-6 md:px-12 flex justify-between items-center">
        <Link
          href="/"
          className="font-heading font-bold text-2xl nav-text text-white tracking-wider"
        >
          SIAM<span className="text-primary">JOURNEY</span>
        </Link>

        <div className="hidden md:flex space-x-8 items-center">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="nav-text text-white hover:text-primary transition font-medium"
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/#regions"
            className="px-6 py-2 bg-primary text-white rounded-full hover:bg-yellow-600 transition shadow-lg"
          >
            เริ่มต้นเดินทาง
          </Link>
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          aria-label="เมนู"
          className="md:hidden text-2xl nav-text text-white"
        >
          <i className={`fas ${open ? "fa-times" : "fa-bars"}`} />
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-dark/95 backdrop-blur-md mt-3 mx-4 rounded-2xl p-4 flex flex-col gap-3">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="text-white hover:text-primary transition font-medium py-1"
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}

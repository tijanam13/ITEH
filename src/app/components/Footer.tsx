"use client";

import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-[#AD8B73] text-[#FFFBE9]">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="Insensitivo Makeup"
            width={40}
            height={40}
          />
        </Link>


        <div className="flex flex-col items-end gap-2">

          <div className="flex items-center gap-4">
            <a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer">
              <Image src="/facebook1.png" alt="Facebook" width={24} height={24} />
            </a>
            <a href="https://www.instagram.com/insensitivo?igsh=bnU4cHhueWVlemNu" target="_blank" rel="noopener noreferrer">
              <Image src="/instagram.png" alt="Instagram" width={24} height={24} />
            </a>
            <a href="https://www.pinterest.com/" target="_blank" rel="noopener noreferrer">
              <Image src="/pinterest.png" alt="Pinterest" width={24} height={24} />
            </a>
            <a href="mailto:insensitivo.makeup@gmail.com">
              <Image src="/email.png" alt="Email" width={24} height={24} />
            </a>
          </div>


          <p className="opacity-90 text-sm">
            {new Date().getFullYear()} Insensitivo Makeup
          </p>
        </div>
      </div>
    </footer>
  );
}

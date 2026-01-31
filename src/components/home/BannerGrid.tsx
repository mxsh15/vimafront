"use client";

import Image from "next/image";
import Link from "next/link";

const BANNERS = [
  {
    id: 1,
    src: "/images/casio-banner.webp", 
    alt: "ساعت کاسیو",
    href: "/category/watch",
  },
  {
    id: 2,
    src: "/images/mylady-banner.webp",
    alt: "دستمال کاغذی مایلیدی",
    href: "/category/dastmal",
  },
  {
    id: 3,
    src: "/images/kasra-banner.webp",
    alt: "کسرا بنر",
    href: "/category/kasra",
  },
  {
    id: 4,
    src: "/images/karetamiz-banner.webp",
    alt: "لوازم خانگی",
    href: "/category/digital",
  },
];

export function BannerGrid() {
  return (
    <div className="container mx-auto px-4 mb-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {BANNERS.map((banner) => (
          <Link
            key={banner.id}
            href={banner.href}
            className="group block relative rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-md transition-all duration-300"
          >
            <div className="relative aspect-[16/9] w-full">
              <Image
                src={banner.src}
                alt={banner.alt}
                width={0}
                height={0}
                sizes="(max-width: 768px) 50vw, 25vw"
                style={{ width: "100%", height: "auto" }}
                className="group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
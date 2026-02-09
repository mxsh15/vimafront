"use client";

import { Stories } from "./Stories";
import { QuickServices } from "./QuickServices";
import { BannerGrid } from "./BannerGrid";
import { CategoryGrid } from "./CategoryGrid";
import { DoubleBanner } from "./DoubleBanner";
import { AmazingSlider } from "./AmazingSlider";
import { HeroSlider } from "./HeroSlider";


export const categories = [
  { id: 1, title: "موبایل", icon: "📱" },
  { id: 2, title: "کالای دیجیتال", icon: "💻" },
  { id: 3, title: "خانه و آشپزخانه", icon: "🏠" },
  { id: 4, title: "مد و پوشاک", icon: "👕" },
  { id: 5, title: "کالاهای سوپرمارکتی", icon: "🍎" },
  { id: 6, title: "کتاب و لوازم تحریر", icon: "📚" },
  { id: 7, title: "اسباب بازی", icon: "🧸" },
  { id: 8, title: "زیبایی و سلامت", icon: "💄" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#fcfcfc] font-sans" dir="rtl">
      <main>
        <Stories />
        <HeroSlider items={[]} />
        <div className="mx-auto w-full max-w-[1336px] px-4">
          <QuickServices />
          <AmazingSlider />
          <BannerGrid />
          <CategoryGrid />
          <DoubleBanner />
        </div>
        <div className="container mx-auto px-4 py-8 border-t border-gray-200">
          <h2 className="text-center text-lg font-bold mb-4 text-gray-500">...سایر بخش‌ها...</h2>
        </div>
      </main>
    </div>
  );
}

"use client";
import { categories } from "./Home";

export function CategoryGrid() {
  return (
    <div className="container mx-auto px-4 mb-12 text-center">
      <h2 className="text-xl font-bold mb-8">خرید بر اساس دسته‌بندی</h2>
      <div className="grid grid-cols-4 md:grid-cols-8 gap-8">
        {categories.map((cat) => (
          <div key={cat.id} className="flex flex-col items-center gap-3 cursor-pointer group">
            <div className="w-24 h-24 bg-gray-50 rounded-full p-4 group-hover:shadow-md transition duration-300">
              <div className="w-full h-full flex items-center justify-center text-4xl">{cat.icon}</div>
            </div>
            <span className="text-sm font-medium text-gray-800">{cat.title}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

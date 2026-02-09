"use client";


export function Stories() {
  return (
    <div className="container mx-auto px-4 py-4 overflow-x-auto no-scrollbar">
      <div className="flex items-center gap-6 min-w-max">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-2 cursor-pointer group">
            <div className="w-20 h-20 rounded-full border-2 border-red-500 p-[2px] group-hover:scale-105 transition-transform">
              <img
                src={`https://placehold.co/80x80?text=Story+${i + 1}`}
                alt="Story"
                className="w-full h-full rounded-full object-cover" />
            </div>
            <span className="text-xs text-gray-700 font-medium">عنوان استوری</span>
          </div>
        ))}
      </div>
    </div>
  );
}

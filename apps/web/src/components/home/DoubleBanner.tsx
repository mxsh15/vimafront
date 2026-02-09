"use client";
export function DoubleBanner() {
  return (
    <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
      <div className="rounded-2xl overflow-hidden cursor-pointer">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://placehold.co/800x300/e0f7fa/006064?text=Promo+1"
          className="w-full"
          alt="Promo" />
      </div>
      <div className="rounded-2xl overflow-hidden cursor-pointer">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://placehold.co/800x300/fce4ec/880e4f?text=Promo+2"
          className="w-full"
          alt="Promo" />
      </div>
    </div>
  );
}

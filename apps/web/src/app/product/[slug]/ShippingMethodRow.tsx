"use client";

import { useState } from "react";
import { ChevronLeft, Dot, PackageCheck, Truck } from "lucide-react";
import { ShippingMethodModal } from "./ShippingMethodModal";

export function ShippingMethodRow() {
    const [open, setOpen] = useState(false);

    return (
        <>
            <div
                className="px-4 w-full relative cursor-pointer"
                role="button"
                tabIndex={0}
                onClick={() => setOpen(true)}
                onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") setOpen(true);
                }}
            >
                <div className="border-t border-t-[var(--color-neutral-200)] py-3">
                    <div className="flex flex-row justify-start items-center mb-2">
                        <div className="flex ml-3 mr-px">
                            <div className="cube-font-icon w-[24px] h-[24px] text-[24px] font-normal">
                                <PackageCheck
                                    size={23}
                                    strokeWidth={2}
                                    className="text-[var(--color-icon-secondary)]"
                                />
                            </div>
                        </div>

                        <p className="text-button-2 text-neutral-700">روش و هزینه ارسال</p>

                        <div className="flex mr-auto text-neutral-400">
                            <ChevronLeft size={18} strokeWidth={2} className="text-icon-high-emphasis" />
                        </div>
                    </div>

                    <ul className="flex flex-col">
                        <li className="flex items-center ml-3">
                            <div className="relative flex items-center justify-center self-stretch ml-3">
                                <div className="flex">
                                    <Dot size={23} strokeWidth={2} className="text-[var(--color-icon-secondary)]" />
                                </div>
                                <span className="absolute block bg-neutral-200 top-0 left-1/2 -translate-x-1/2 w-[1px] h-[calc(50%-5px)]"></span>
                            </div>

                            <div className="flex">
                                <Truck size={18} strokeWidth={2} className="scale-x-[-1] text-[var(--color-delivery-express)]" />
                            </div>

                            <div className="flex ellipsis-1 items-center mr-1">
                                <span className="text-body-2 text-neutral-500">توسط دیجی‌کالا</span>
                                <span className="text-neutral-650 text-body2-strong">
                                    <span className="text-neutral-500">
                                        <span className="text-neutral-500"> • </span>
                                        تامین از 1 روز کاری دیگر
                                    </span>
                                </span>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>

            <ShippingMethodModal open={open} onClose={() => setOpen(false)} />
        </>
    );
}

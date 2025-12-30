"use client";

import DatePicker, { DateObject } from "react-multi-date-picker";
import TimePicker from "react-multi-date-picker/plugins/time_picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import gregorian from "react-date-object/calendars/gregorian";

type Props = {
    label: string;
    valueIso: string | null;
    onChangeIso: (iso: string | null) => void;
    showTime?: boolean;
    placeholder?: string;
    disabled?: boolean;
};

function isoToDateObject(iso: string): DateObject {
    const d = new Date(iso);
    return new DateObject({ date: d, calendar: persian, locale: persian_fa });
}

export function PersianDateTimeField({
    label,
    valueIso,
    onChangeIso,
    showTime = true,
    placeholder = "انتخاب تاریخ",
    disabled,
}: Props) {
    const value = valueIso ? isoToDateObject(valueIso) : null;

    return (
        <div className="space-y-1">
            <label className="block text-xs">{label}</label>

            <div className="rounded border border-gray-300 bg-white px-2 py-1">
                <DatePicker
                    value={value}
                    onChange={(val) => {
                        if (!val) return onChangeIso(null);

                        const v = Array.isArray(val) ? val[0] : val;
                        if (!v) return onChangeIso(null);

                        // خروجی را به میلادی تبدیل کن و ISO استاندارد بده
                        const jsDate = new Date(v.convert(gregorian).toDate());
                        onChangeIso(jsDate.toISOString());
                    }}
                    calendar={persian}
                    locale={persian_fa}
                    calendarPosition="bottom-right"
                    format={showTime ? "YYYY/MM/DD HH:mm" : "YYYY/MM/DD"}
                    plugins={showTime ? [<TimePicker position="bottom" key="tp" />] : []}
                    editable={false}
                    placeholder={placeholder}
                    disabled={disabled}
                    inputClass="w-full text-sm outline-none"
                    containerClassName="w-full"
                />
            </div>

            {valueIso ? (
                <div className="text-[10px] text-slate-500" dir="ltr">
                    ISO → {valueIso}
                </div>
            ) : null}
        </div>
    );
}

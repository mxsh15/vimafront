"use client";

import { useMemo, useState, type ChangeEvent } from "react";
import { Combobox } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";

const fallback = [
  "Asia/Tehran",
  "Asia/Dubai",
  "Asia/Baghdad",
  "Europe/Helsinki",
  "Europe/Istanbul",
  "Europe/London",
  "Europe/Berlin",
  "Europe/Paris",
  "America/New_York",
  "America/Los_Angeles",
  "Asia/Tokyo",
  "Asia/Shanghai",
];

type Props = {
  value: string;
  onChange: (tz: string) => void;
  name?: string;
  placeholder?: string;
};

export default function TimezoneSelect({
  value,
  onChange,
  name,
  placeholder = "انتخاب TimeZone...",
}: Props) {
  const safeValue = value ?? "";
  const [query, setQuery] = useState("");

  const zones = useMemo(() => {
    const anyIntl = Intl as any;
    const list: string[] = anyIntl?.supportedValuesOf?.("timeZone") ?? fallback;
    return list;
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return zones;
    return zones.filter((z: string) => z.toLowerCase().includes(q));
  }, [query, zones]);

  return (
    <div className="relative">
      {name ? <input type="hidden" name={name} value={safeValue} /> : null}

      <Combobox value={safeValue} onChange={(v: string) => onChange(v)}>
        <div className="relative">
          <Combobox.Input
            className="w-full rounded-md border border-gray-200 px-3 py-2 pr-10 text-sm text-slate-700 shadow-xs outline-none focus:ring-2 focus:ring-indigo-500"
            displayValue={(v: string) => v ?? ""}
            onChange={(event: ChangeEvent<HTMLInputElement>) => setQuery(event.target.value)}
            placeholder={placeholder}
          />

          <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
            <ChevronUpDownIcon className="h-5 w-5 text-slate-400" />
          </Combobox.Button>
        </div>

        <Combobox.Options className="absolute z-50 mt-2 max-h-64 w-full overflow-auto rounded-md border border-gray-200 bg-white py-1 text-sm shadow-lg">
          {filtered.length === 0 ? (
            <div className="px-3 py-2 text-xs text-slate-500">موردی پیدا نشد</div>
          ) : (
            filtered.map((tz: string) => (
              <Combobox.Option
                key={tz}
                value={tz}
                className={({ active }: { active: boolean }) =>
                  `cursor-pointer select-none px-3 py-2 ${
                    active ? "bg-indigo-50 text-indigo-700" : "text-slate-700"
                  }`
                }
              >
                {({ selected }: { selected: boolean }) => (
                  <div className="flex items-center justify-between">
                    <span className={selected ? "font-semibold" : "font-normal"}>{tz}</span>
                    {selected ? <CheckIcon className="h-4 w-4 text-indigo-600" /> : null}
                  </div>
                )}
              </Combobox.Option>
            ))
          )}
        </Combobox.Options>
      </Combobox>
    </div>
  );
}

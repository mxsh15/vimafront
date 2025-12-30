import type { AttributeGroupDto } from "../types";

export function AttributeGroupHeader({ group }: { group: AttributeGroupDto }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
      <div>
        <h1 className="text-sm font-semibold text-slate-900">
          ویژگی‌های گروه: {group.name}
        </h1>
        <p className="mt-1 text-[11px] text-slate-400">
          ست ویژگی: {group.attributeSetName}
        </p>
      </div>
    </div>
  );
}

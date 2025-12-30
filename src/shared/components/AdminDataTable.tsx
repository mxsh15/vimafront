import type { ReactNode } from "react";

type AdminDataTableProps<T> = {
  data: T[];
  page: number;
  pageSize: number;
  columns: {
    id: string;
    header: string;
    cell: (row: T) => ReactNode;
    headerClassName?: string;
    cellClassName?: string;
  }[];
  rowMenuCell?: (row: T) => ReactNode;
  rowMenuHeader?: ReactNode;
  showIndex?: boolean;
  emptyMessage?: string;
};

export function AdminDataTable<T>({
  data,
  page,
  pageSize,
  columns,
  rowMenuCell,
  rowMenuHeader = "…",
  showIndex = true,
  emptyMessage = "موردی یافت نشد.",
}: AdminDataTableProps<T>) {
  const hasMenu = !!rowMenuCell;

  return (
    <div className="relative overflow-x-auto overflow-y-visible">
      <table className="min-w-full text-xs">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] text-slate-500">
            {showIndex && (
              <th className="w-10 py-3 pl-2 pr-4 text-center">#</th>
            )}
            {columns.map((col) => (
              <th
                key={col.id}
                className={
                  col.headerClassName ??
                  "py-3 px-2 text-right whitespace-nowrap"
                }
              >
                {col.header}
              </th>
            ))}
            {hasMenu && (
              <th className="w-10 px-2 text-center">{rowMenuHeader}</th>
            )}
          </tr>
        </thead>
        <tbody className="text-[11px] text-slate-700">
          {data.length === 0 && (
            <tr>
              <td
                colSpan={
                  columns.length + (showIndex ? 1 : 0) + (hasMenu ? 1 : 0)
                }
                className="py-6 text-center text-slate-400"
              >
                {emptyMessage}
              </td>
            </tr>
          )}

          {data.map((row, idx) => {
            const globalIndex = (page - 1) * pageSize + (idx + 1);
            return (
              <tr
                key={(row as any).id ?? idx}
                className="border-b border-slate-50 odd:bg-slate-50/50"
              >
                {showIndex && (
                  <td className="py-3 pl-2 pr-4 text-center text-slate-400">
                    {globalIndex}
                  </td>
                )}
                {columns.map((col) => (
                  <td
                    key={col.id}
                    className={
                      col.cellClassName ??
                      "px-2 py-3 whitespace-nowrap align-middle"
                    }
                  >
                    {col.cell(row)}
                  </td>
                ))}
                {hasMenu && (
                  <td className="w-12 px-2 py-3 text-right align-middle">
                    {rowMenuCell(row)}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

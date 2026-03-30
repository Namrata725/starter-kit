"use client";
import React from "react";

interface Column<T> {
  key: keyof T;
  label: string;
}

interface Action<T> {}

interface TableSkeletonProps<T> {
  columns: ReadonlyArray<Column<T>>;
  actions?: ReadonlyArray<Action<T>>;
  rows?: number;
}

export function TableSkeleton<T>({
  columns,
  actions,
  rows = 5,
}: TableSkeletonProps<T>) {
  return (
    <>
      {Array.from({ length: rows }).map((_, idx) => (
        <tr key={idx} className="animate-pulse">
          {columns.map((col) => (
            <td key={String(col.key)} className="px-6 py-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </td>
          ))}
          {actions && actions.length > 0 && (
            <td className="px-6 py-4 flex gap-2">
              {actions.map((_, i) => (
                <div key={i} className="h-8 w-8 bg-gray-200 rounded-lg" />
              ))}
            </td>
          )}
        </tr>
      ))}
    </>
  );
}

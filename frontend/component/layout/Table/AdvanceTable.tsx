"use client";
import React, { useState } from "react";
import { Eye, Edit2, Trash2, MessageSquareWarning } from "lucide-react";
import { TableSkeleton } from "./TableSkeleton";
import { Pagination } from "./Pagination";
import DeleteConfirmationModal from "@/component/admin/modals/DeleteConfirmationModal";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  horizontalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Column<T> {
  key: Extract<keyof T, string | number>;
  label: string;
  render?: (row: T) => React.ReactNode;
}

interface Action<T> {
  label: string;
  handler: (row: T) => void;
  className?: string;
  icon?: React.ReactNode;
}

interface TableProps<T> {
  columns: ReadonlyArray<Column<T>>;
  data: ReadonlyArray<T>;
  actions?: ReadonlyArray<Action<T>>;
  loading?: boolean;
}

const defaultIconMap: Record<string, React.ReactNode> = {
  View: <Eye size={16} />,
  Edit: <Edit2 size={16} />,
  Delete: <Trash2 size={16} />,
};

// sortable Header
function SortableHeader({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: "grab",
  };
  return (
    <th
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="px-6 py-3 text-left text-sm font-semibold tracking-wide"
    >
      {children}
    </th>
  );
}

export function AdvanceTable<T>({
  columns,
  data,
  actions,
  loading = false,
}: TableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<T | null>(null);
  const [selectedAction, setSelectedAction] = useState<Action<T> | null>(null);
  const [columnOrder, setColumnOrder] = useState<string[]>(
    columns.map((c) => String(c.key)),
  );
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);

  const totalPages = Math.ceil(data.length / rowsPerPage);
  const startIdx = (currentPage - 1) * rowsPerPage;
  const endIdx = startIdx + rowsPerPage;
  const totalColumns = columns.length + (actions?.length ? 1 : 0);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  //handle drag and drop
  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = columnOrder.indexOf(active.id);
      const newIndex = columnOrder.indexOf(over.id);
      setColumnOrder(arrayMove(columnOrder, oldIndex, newIndex));
    }
  };

  // order columns based on columnOrder state
  const orderedColumns = columnOrder.map(
    (key) => columns.find((c) => String(c.key) === key)!,
  );

  // sort on the baiss of data
  let sortedData = [...data];
  if (sortConfig) {
    sortedData.sort((a, b) => {
      const aVal = a[sortConfig.key as keyof T];
      const bVal = b[sortConfig.key as keyof T];

      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortConfig.direction === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortConfig.direction === "asc" ? aVal - bVal : bVal - aVal;
      }
      return 0;
    });
  }

  const currentData = sortedData.slice(startIdx, endIdx);

  const handleActionClick = (action: Action<T>, row: T) => {
    if (action.label === "Delete") {
      setSelectedRow(row);
      setSelectedAction(action);
      setIsModalOpen(true);
    } else {
      action.handler(row);
    }
  };

  const handleConfirmDelete = () => {
    if (selectedAction && selectedRow) selectedAction.handler(selectedRow);
    setIsModalOpen(false);
    setSelectedRow(null);
    setSelectedAction(null);
  };

  return (
    <div className="overflow-x-auto rounded-lg shadow-lg border border-gray-200">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <table className="min-w-full divide-y divide-gray-200 bg-white">
          <thead className="bg-primary text-secondary">
            <SortableContext
              items={columnOrder}
              strategy={horizontalListSortingStrategy}
            >
              <tr>
                {orderedColumns.map((col) => (
                  <SortableHeader key={String(col.key)} id={String(col.key)}>
                    <div
                      className="flex items-center gap-1 cursor-pointer select-none"
                      onClick={() => {
                        if (sortConfig?.key === String(col.key)) {
                          setSortConfig({
                            key: String(col.key),
                            direction:
                              sortConfig.direction === "asc" ? "desc" : "asc",
                          });
                        } else {
                          setSortConfig({
                            key: String(col.key),
                            direction: "asc",
                          });
                        }
                      }}
                    >
                      {col.label}
                      {sortConfig?.key === String(col.key)
                        ? sortConfig.direction === "asc"
                          ? "▲"
                          : "▼"
                        : null}
                    </div>
                  </SortableHeader>
                ))}
                {actions && actions.length > 0 && (
                  <th className="px-6 py-3 text-left text-sm font-semibold tracking-wide">
                    Actions
                  </th>
                )}
              </tr>
            </SortableContext>
          </thead>

          <tbody className="min-h-80 relative">
            {loading ? (
              <TableSkeleton columns={columns} actions={actions} rows={5} />
            ) : currentData.length > 0 ? (
              currentData.map((row, idx) => (
                <tr
                  key={startIdx + idx}
                  className="hover:bg-gray-50 transition-colors duration-150"
                >
                  {orderedColumns.map((col) => (
                    <td
                      key={String(col.key)}
                      className="px-6 py-4 text-sm text-gray-700"
                    >
                      {col.render ? col.render(row) : String(row[col.key])}
                    </td>
                  ))}
                  {actions && actions.length > 0 && (
                    <td className="px-6 py-4 flex gap-2">
                      {actions.map((action, i) => (
                        <button
                          key={i}
                          onClick={() => handleActionClick(action, row)}
                          className={`flex items-center justify-center p-2 rounded-lg text-sm font-medium transition-colors duration-150 cursor-pointer ${
                            action.className ||
                            "bg-primary text-secondary hover:opacity-80"
                          }`}
                          title={action.label}
                        >
                          {action.icon || defaultIconMap[action.label] || null}
                        </button>
                      ))}
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={totalColumns} className="p-0">
                  <div className="flex flex-col items-center justify-center h-64 w-full gap-2">
                    <MessageSquareWarning className="w-16 h-16 animate-bounce-infinite text-primary" />
                    <span className="text-sm text-gray-400">
                      No data available
                    </span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </DndContext>

      {!loading && data.length > 10 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          rowsPerPage={rowsPerPage}
          onPageChange={setCurrentPage}
          onRowsPerPageChange={(rows) => {
            setRowsPerPage(rows);
            setCurrentPage(1);
          }}
        />
      )}

      {selectedRow && selectedAction && selectedAction.label === "Delete" && (
        <DeleteConfirmationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConfirm={handleConfirmDelete}
          itemName={String(selectedRow[columns[0].key])}
        />
      )}
    </div>
  );
}

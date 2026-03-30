"use client";
import React, { useState, useEffect } from "react";
import { Eye, MessageSquareWarning } from "lucide-react";
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
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TableSkeleton } from "./TableSkeleton";
import { Pagination } from "./Pagination";
import DeleteConfirmationModal from "@/component/admin/modals/DeleteConfirmationModal";

// column structure definition
interface Column<T> {
  key: Extract<keyof T, string | number>;
  label: string;
  render?: (row: T) => React.ReactNode;
}

// action button structure
interface Action<T> {
  label: string;
  handler: (row: T) => void;
  className?: string;
  icon?: React.ReactNode;
}

// main table props
interface TableProps<T> {
  columns: ReadonlyArray<Column<T>>;
  data: ReadonlyArray<T>;
  actions?: ReadonlyArray<Action<T>>;
  loading?: boolean;
  draggable?: boolean; 
}

// default icons for actions
const defaultIconMap: Record<string, React.ReactNode> = {
  View: <Eye size={16} />,
  Edit: <Eye size={16} />,
  Delete: <Eye size={16} />,
};

// sortable header component for draggable columns
function SortableHeader({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  // hook to make header draggable
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  // apply drag animation styles
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

// sortable row component for draggable rows
function SortableRow({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  // hook to make row draggable
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  // apply drag animation styles
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: "grab",
  };

  return (
    <tr ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </tr>
  );
}

// main advanced table component
export function AdvanceTable<T>({
  columns,
  data,
  actions,
  loading = false,
  draggable = false,
}: TableProps<T>) {
  // pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // modal states for delete confirmation
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<T | null>(null);
  const [selectedAction, setSelectedAction] = useState<Action<T> | null>(null);

  // column order state for drag reorder
  const [columnOrder, setColumnOrder] = useState<string[]>(
    columns.map((c) => String(c.key)),
  );

  // table data state
  const [tableData, setTableData] = useState<T[]>([...data]);

  // sorting state
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);

  // update table data when prop changes
  useEffect(() => {
    setTableData([...data]);
  }, [data]);

  // pagination calculations
  const totalPages = Math.ceil(tableData.length / rowsPerPage);
  const startIdx = (currentPage - 1) * rowsPerPage;
  const endIdx = startIdx + rowsPerPage;

  // total columns including actions
  const totalColumns = columns.length + (actions?.length ? 1 : 0);

  // drag sensors setup
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  // handle drag end for both columns and rows
  const handleDragEnd = (event: any) => {
    if (!draggable) return;

    const { active, over } = event;
    if (!over) return;

    // check if dragging columns
    if (columnOrder.includes(active.id)) {
      if (active.id !== over.id) {
        const oldIndex = columnOrder.indexOf(active.id);
        const newIndex = columnOrder.indexOf(over.id);
        setColumnOrder(arrayMove(columnOrder, oldIndex, newIndex));
      }
    } else {
      // otherwise dragging rows
      const oldIndex = tableData.findIndex((_, i) => String(i) === active.id);
      const newIndex = tableData.findIndex((_, i) => String(i) === over.id);
      setTableData(arrayMove(tableData, oldIndex, newIndex));
    }
  };

  // reorder columns based on drag state
  const orderedColumns = columnOrder.map(
    (key) => columns.find((c) => String(c.key) === key)!,
  );

  // sorting logic
  let sortedData = [...tableData];
  if (sortConfig) {
    sortedData.sort((a, b) => {
      const aVal = a[sortConfig.key as keyof T];
      const bVal = b[sortConfig.key as keyof T];

      if (typeof aVal === "string" && typeof bVal === "string")
        return sortConfig.direction === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);

      if (typeof aVal === "number" && typeof bVal === "number")
        return sortConfig.direction === "asc" ? aVal - bVal : bVal - aVal;

      return 0;
    });
  }

  // slice data for current page
  const currentData = sortedData.slice(startIdx, endIdx);

  // handle action click
  const handleActionClick = (action: Action<T>, row: T) => {
    if (action.label === "Delete") {
      setSelectedRow(row);
      setSelectedAction(action);
      setIsModalOpen(true);
    } else {
      action.handler(row);
    }
  };

  // confirm delete action
  const handleConfirmDelete = () => {
    if (selectedAction && selectedRow) selectedAction.handler(selectedRow);
    setIsModalOpen(false);
    setSelectedRow(null);
    setSelectedAction(null);
  };

  // table ui content
  const TableContent = (
    <table className="min-w-full divide-y divide-gray-200 bg-white">
      <thead className="bg-primary text-secondary">
        {draggable ? (
          <SortableContext
            items={columnOrder}
            strategy={horizontalListSortingStrategy}
          >
            <tr>
              {orderedColumns.map((col) => (
                <SortableHeader key={String(col.key)} id={String(col.key)}>
                  {/* column sorting click */}
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
                    {/* show sort indicator */}
                    {sortConfig?.key === String(col.key)
                      ? sortConfig.direction === "asc"
                        ? "▲"
                        : "▼"
                      : null}
                  </div>
                </SortableHeader>
              ))}

              {/* actions column */}
              {actions && actions.length > 0 && (
                <th className="px-6 py-3 text-left text-sm font-semibold tracking-wide">
                  Actions
                </th>
              )}
            </tr>
          </SortableContext>
        ) : (
          <tr>
            {orderedColumns.map((col) => (
              <th
                key={String(col.key)}
                className="px-6 py-3 text-left text-sm font-semibold tracking-wide"
              >
                {col.label}
              </th>
            ))}

            {actions && actions.length > 0 && (
              <th className="px-6 py-3 text-left text-sm font-semibold tracking-wide">
                Actions
              </th>
            )}
          </tr>
        )}
      </thead>

      <tbody className="min-h-80 relative">
        {/* loading state */}
        {loading ? (
          <TableSkeleton columns={columns} actions={actions} rows={5} />
        ) : currentData.length > 0 ? (
          draggable ? (
            <SortableContext
              items={currentData.map((_, idx) => String(startIdx + idx))}
              strategy={verticalListSortingStrategy}
            >
              {currentData.map((row, idx) => (
                <SortableRow key={startIdx + idx} id={String(startIdx + idx)}>
                  {orderedColumns.map((col) => (
                    <td
                      key={String(col.key)}
                      className="px-6 py-4 text-sm text-gray-700"
                    >
                      {/* custom or default cell render */}
                      {col.render ? col.render(row) : String(row[col.key])}
                    </td>
                  ))}

                  {/* action buttons */}
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
                </SortableRow>
              ))}
            </SortableContext>
          ) : (
            currentData.map((row, idx) => (
              <tr key={startIdx + idx}>
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
          )
        ) : (
          // empty state
          <tr>
            <td colSpan={totalColumns} className="p-0">
              <div className="flex flex-col items-center justify-center h-64 w-full gap-2">
                <MessageSquareWarning className="w-16 h-16 animate-bounce-infinite text-primary" />
                <span className="text-sm text-gray-400">No data available</span>
              </div>
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );

  return (
    <div className="overflow-x-auto rounded-lg shadow-lg border border-gray-200">
      {/* wrap with dnd context if draggable */}
      {draggable ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          {TableContent}
        </DndContext>
      ) : (
        TableContent
      )}

      {/* pagination */}
      {!loading && tableData.length > 10 && (
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

      {/* delete confirmation modal */}
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
import React, { useState } from "react";
import { Eye, Edit2, Trash2, MessageSquareWarning } from "lucide-react";
import { TableSkeleton } from "./TableSkeleton";
import { Pagination } from "./Pagination";
import DeleteConfirmationModal from "@/component/admin/modals/DeleteConfirmationModal";

interface Column<T> {
  key: keyof T;
  label: string;
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

export function Table<T>({
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

  const totalPages = Math.ceil(data.length / rowsPerPage);
  const startIdx = (currentPage - 1) * rowsPerPage;
  const endIdx = startIdx + rowsPerPage;
  const currentData = data.slice(startIdx, endIdx);

  const totalColumns = columns.length + (actions?.length ? 1 : 0);

  // automatically show confirmation modal for Delete actions
  const handleActionClick = (action: Action<T>, row: T) => {
    if (action.label === "Delete") {
      setSelectedRow(row);
      setSelectedAction(action);
      setIsModalOpen(true);
    } else {
      action.handler(row);
    }
  };

  // handle delete confirmation

  const handleConfirmDelete = () => {
    if (selectedAction && selectedRow) {
      selectedAction.handler(selectedRow);
    }
    setIsModalOpen(false);
    setSelectedRow(null);
    setSelectedAction(null);
  };

  return (
    <div className="overflow-x-auto rounded-lg shadow-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200 bg-white">
        {/* table head */}
        <thead className="bg-primary text-secondary">
          <tr>
            {columns.map((col) => (
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
        </thead>

        {/* table body */}

        <tbody className="min-h-80 relative">
          {loading ? (
            <TableSkeleton columns={columns} actions={actions} rows={5} />
          ) : currentData.length > 0 ? (
            currentData.map((row, idx) => (
              <tr
                key={startIdx + idx}
                className="hover:bg-gray-50 transition-colors duration-150"
              >
                {columns.map((col) => (
                  <td
                    key={String(col.key)}
                    className="px-6 py-4 text-sm text-gray-700"
                  >
                    {String(row[col.key])}
                  </td>
                ))}
                {actions && actions.length > 0 && (
                  <td className="px-6 py-4 flex gap-2">
                    {actions.map((action, i) => (
                      <button
                        key={i}
                        onClick={() => handleActionClick(action, row)}
                        className={`flex items-center justify-center p-2 rounded-lg text-sm font-medium transition-colors duration-150 cursor-pointer
                          ${action.className || "bg-primary text-secondary hover:opacity-80"}`}
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

      {/* Pagination */}
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

      {/* Delete Confirmation Modal */}
      {selectedRow && selectedAction && selectedAction.label === "Delete" && (
        <DeleteConfirmationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConfirm={handleConfirmDelete}
          itemName={String(selectedRow[columns[0].key])} // show first column as item name
        />
      )}
    </div>
  );
}

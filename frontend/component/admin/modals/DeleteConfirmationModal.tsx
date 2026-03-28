"use client";
import React from "react";
import { Trash2, XCircle } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName?: string;
}

const DeleteConfirmationModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onConfirm,
  itemName = "this item",
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4 sm:px-6">
      <div
        className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md animate-fadeIn border-t-4"
        style={{ borderTopColor: "var(--primary)" }}
      >
        <div className="flex items-center gap-3 mb-4">
          <XCircle className="text-red-500" size={28} />
          <h2 className="text-2xl font-semibold text-gray-800">
            Confirm Delete
          </h2>
        </div>
        <p className="text-gray-700 mb-6">
          Are you sure you want to delete <strong>{itemName}</strong>? This
          action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition flex items-center gap-2 cursor-pointer"
          >
            <Trash2 size={18} /> Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;

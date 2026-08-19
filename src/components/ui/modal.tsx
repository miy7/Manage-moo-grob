"use client";

type ModalProps = {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
};

export function Modal({ title, onClose, children }: ModalProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4"
    >
      <div className="w-full max-w-md rounded-t-2xl bg-white p-4 sm:rounded-2xl">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="ปิด"
            className="rounded-lg px-2 py-1 text-stone-500"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export const inputClass =
  "w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-base outline-none focus:border-amber-600";

export const primaryButtonClass =
  "w-full rounded-xl bg-amber-700 px-4 py-2.5 text-sm font-semibold text-white active:bg-amber-800 disabled:opacity-60";

export const secondaryButtonClass =
  "rounded-lg border border-stone-300 px-3 py-1.5 text-sm font-medium text-stone-700 disabled:opacity-60";

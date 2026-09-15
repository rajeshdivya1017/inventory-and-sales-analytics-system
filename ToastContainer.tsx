
import { X } from "lucide-react";

import { useToast } from "../hooks/useToast";

const ToastContainer = () => {
  const { toast, hideToast } = useToast();

  if (!toast) {
    return null;
  }

  const typeStyles = {
    success: "border-green-200 bg-green-50 text-green-800",
    error: "border-red-200 bg-red-50 text-red-800",
    info: "border-blue-200 bg-blue-50 text-blue-800",
  };

  return (
    <div
      className="fixed right-4 top-4 z-[100] w-full max-w-sm"
      role="status"
      aria-live="polite"
    >
      <div
        className={`flex items-start justify-between gap-3 rounded-lg border p-4 shadow-lg ${
          typeStyles[toast.type]
        }`}
      >
        <div>
          <p className="font-medium capitalize">{toast.type}</p>

          <p className="mt-1 text-sm">{toast.message}</p>
        </div>

        <button
          type="button"
          onClick={hideToast}
          aria-label="Close notification"
          className="rounded-md p-1 transition-colors hover:bg-black/5"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
};

export default ToastContainer;


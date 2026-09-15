
import { useUIStore } from "../store/useUIStore";

export const useToast = () => {
  const toast = useUIStore((state) => state.toast);
  const showToast = useUIStore((state) => state.showToast);
  const hideToast = useUIStore((state) => state.hideToast);

  return {
    toast,
    showToast,
    hideToast,
  };
};


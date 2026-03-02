"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, CheckCircle, XCircle, Info, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

// ==========================================
// Types
// ==========================================

type DialogVariant = "info" | "success" | "warning" | "danger";

interface DialogOptions {
  title: string;
  message: string;
  variant?: DialogVariant;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
}

interface ToastOptions {
  message: string;
  variant?: DialogVariant;
  duration?: number;
}

interface DialogContextType {
  confirm: (options: DialogOptions) => Promise<boolean>;
  alert: (options: Omit<DialogOptions, "showCancel">) => Promise<void>;
  toast: (options: ToastOptions) => void;
}

// ==========================================
// Context
// ==========================================

const DialogContext = createContext<DialogContextType | undefined>(undefined);

export function useDialog() {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error("useDialog must be used within a DialogProvider");
  }
  return context;
}

// ==========================================
// Icons & Styles
// ==========================================

const variantConfig: Record<
  DialogVariant,
  { icon: typeof Info; bg: string; iconColor: string; toastBg: string }
> = {
  info: {
    icon: Info,
    bg: "bg-blue-100",
    iconColor: "text-blue-600",
    toastBg: "bg-blue-600",
  },
  success: {
    icon: CheckCircle,
    bg: "bg-green-100",
    iconColor: "text-green-600",
    toastBg: "bg-green-600",
  },
  warning: {
    icon: AlertTriangle,
    bg: "bg-yellow-100",
    iconColor: "text-yellow-600",
    toastBg: "bg-yellow-600",
  },
  danger: {
    icon: XCircle,
    bg: "bg-red-100",
    iconColor: "text-red-600",
    toastBg: "bg-red-600",
  },
};

// ==========================================
// Provider Component
// ==========================================

export function DialogProvider({ children }: { children: ReactNode }) {
  // Dialog State
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    options: DialogOptions | null;
    resolve: ((value: boolean) => void) | null;
    isLoading: boolean;
  }>({
    isOpen: false,
    options: null,
    resolve: null,
    isLoading: false,
  });

  // Toast State
  const [toasts, setToasts] = useState<
    { id: number; message: string; variant: DialogVariant }[]
  >([]);

  // Confirm Dialog
  const confirm = useCallback((options: DialogOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setDialogState({
        isOpen: true,
        options: { ...options, showCancel: true },
        resolve,
        isLoading: false,
      });
    });
  }, []);

  // Alert Dialog (no cancel button)
  const alert = useCallback(
    (options: Omit<DialogOptions, "showCancel">): Promise<void> => {
      return new Promise((resolve) => {
        setDialogState({
          isOpen: true,
          options: {
            ...options,
            showCancel: false,
            confirmText: options.confirmText || "OK",
          },
          resolve: () => resolve(),
          isLoading: false,
        });
      });
    },
    [],
  );

  // Toast Notification
  const toast = useCallback((options: ToastOptions) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [
      ...prev,
      { id, message: options.message, variant: options.variant || "info" },
    ]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, options.duration || 3000);
  }, []);

  // Handle Close
  const handleClose = useCallback(
    (confirmed: boolean) => {
      if (dialogState.resolve) {
        dialogState.resolve(confirmed);
      }
      setDialogState((prev) => ({ ...prev, isOpen: false, isLoading: false }));
    },
    [dialogState.resolve],
  );

  // Handle Confirm with async support
  const handleConfirm = useCallback(async () => {
    if (dialogState.options?.onConfirm) {
      setDialogState((prev) => ({ ...prev, isLoading: true }));
      try {
        await dialogState.options.onConfirm();
      } catch (e) {
        console.error(e);
      }
    }
    handleClose(true);
  }, [dialogState.options, handleClose]);

  const { options, isOpen, isLoading } = dialogState;
  const config = options?.variant
    ? variantConfig[options.variant]
    : variantConfig.info;
  const Icon = config.icon;

  return (
    <DialogContext.Provider value={{ confirm, alert, toast }}>
      {children}

      {/* Dialog Modal */}
      <AnimatePresence>
        {isOpen && options && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => options.showCancel && handleClose(false)}
              className="fixed inset-0 bg-black/50 z-[100]"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white z-[101] shadow-2xl rounded-lg overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center gap-4 p-5 border-b border-gray-100">
                <div
                  className={`w-12 h-12 rounded-full ${config.bg} flex items-center justify-center flex-shrink-0`}
                >
                  <Icon className={`w-6 h-6 ${config.iconColor}`} />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-gray-900">
                    {options.title}
                  </h3>
                </div>
              </div>

              {/* Body */}
              <div className="p-5">
                <p className="text-gray-600 leading-relaxed">
                  {options.message}
                </p>
              </div>

              {/* Footer */}
              <div className="flex gap-3 p-4 border-t border-gray-100 bg-gray-50">
                {options.showCancel && (
                  <Button
                    variant="secondary"
                    onClick={() => {
                      options.onCancel?.();
                      handleClose(false);
                    }}
                    disabled={isLoading}
                    className="flex-1"
                  >
                    {options.cancelText || "Cancel"}
                  </Button>
                )}
                <Button
                  variant={
                    options.variant === "danger" ? "destructive" : "primary"
                  }
                  onClick={handleConfirm}
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading
                    ? "Processing..."
                    : options.confirmText || "Confirm"}
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Toast Container */}
      <div className="fixed bottom-4 right-4 z-[102] flex flex-col gap-2">
        <AnimatePresence>
          {toasts.map((t) => {
            const toastConfig = variantConfig[t.variant];
            const ToastIcon = toastConfig.icon;
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, x: 100, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 100, scale: 0.9 }}
                className={`${toastConfig.toastBg} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[280px]`}
              >
                <ToastIcon className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm flex-grow">{t.message}</span>
                <button
                  onClick={() =>
                    setToasts((prev) => prev.filter((tt) => tt.id !== t.id))
                  }
                  className="hover:opacity-70 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </DialogContext.Provider>
  );
}

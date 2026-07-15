import { createPortal } from "react-dom";
import type { LucideIcon } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  icon?: LucideIcon;
  variant?: "danger" | "success" | "warning" | "info";
}

const variantStyles = {
  danger: {
    iconColor: "text-rose-500",
    buttonBg: "bg-rose-500/10 hover:bg-rose-500/20",
    buttonText: "text-rose-500",
    buttonBorder: "border-rose-500/20",
  },
  success: {
    iconColor: "text-emerald-500",
    buttonBg: "bg-emerald-500/10 hover:bg-emerald-500/20",
    buttonText: "text-emerald-500",
    buttonBorder: "border-emerald-500/20",
  },
  warning: {
    iconColor: "text-amber-500",
    buttonBg: "bg-amber-500/10 hover:bg-amber-500/20",
    buttonText: "text-amber-500",
    buttonBorder: "border-amber-500/20",
  },
  info: {
    iconColor: "text-blue-500",
    buttonBg: "bg-blue-500/10 hover:bg-blue-500/20",
    buttonText: "text-blue-500",
    buttonBorder: "border-blue-500/20",
  },
};

export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Ya, Lanjutkan",
  cancelText = "Batal",
  icon: Icon,
  variant = "info",
}: ConfirmModalProps) => {
  if (!isOpen) return null;

  const styles = variantStyles[variant];

  const handleConfirm = () => {
    onConfirm();
  };

  return createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
      style={{ zIndex: 9999 }}
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-white/10 rounded-xl p-5 sm:p-6 max-w-sm w-full shadow-2xl space-y-4 animate-slideUp mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`flex items-center gap-3 ${styles.iconColor}`}>
          {Icon && <Icon className="w-5 h-5 sm:w-6 sm:h-6" />}
          <h3 className="font-serif font-bold text-base sm:text-lg text-white">
            {title}
          </h3>
        </div>

        <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
          {message}
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button
            onClick={onClose}
            className="w-full sm:flex-1 px-4 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-sm font-medium transition cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            className={`w-full sm:flex-1 px-4 py-2.5 rounded-lg ${styles.buttonBg} ${styles.buttonText} text-sm font-medium border ${styles.buttonBorder} transition cursor-pointer`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

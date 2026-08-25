import { useState } from "react";
import { createPortal } from "react-dom";
import { Loader2, CalendarDays, X } from "lucide-react";

interface IntervalModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemTitle: string;
  onSubmit: (intervalDays: number) => Promise<void>;
  isLoading: boolean;
}

const INTERVAL_OPTIONS = [
  { label: "1 hari", value: 1 },
  { label: "2 hari", value: 2 },
  { label: "3 hari", value: 3 },
  { label: "5 hari", value: 5 },
  { label: "7 hari", value: 7 },
  { label: "14 hari", value: 14 },
  { label: "30 hari", value: 30 },
];

export const IntervalModal = ({
  isOpen,
  onClose,
  itemTitle,
  onSubmit,
  isLoading,
}: IntervalModalProps) => {
  const [selectedDays, setSelectedDays] = useState(3);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    await onSubmit(selectedDays);
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-md"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-lg animate-in fade-in zoom-in-95 duration-300">
        <div className="absolute -inset-px rounded-[2.5rem] bg-linear-to-br from-purple-500/30 via-cyan-500/20 to-transparent blur-sm pointer-events-none" />
        <div className="relative rounded-[2.5rem] sm:rounded-[2.5rem] bg-[#0E1420] border border-white/10 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.9)] overflow-hidden p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white transition-all"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="text-center">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center mx-auto mb-4">
              <CalendarDays className="w-7 h-7 sm:w-8 sm:h-8 text-purple-400" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
              Mulai Ujian Interval
            </h3>
            <p className="text-gray-400 text-xs sm:text-sm mb-6 leading-relaxed">
              Pilih interval review untuk "{itemTitle}"
            </p>

            {/* Interval Options */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
              {INTERVAL_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSelectedDays(option.value)}
                  disabled={isLoading}
                  className={`px-4 py-3 rounded-xl border text-sm font-bold transition-all ${
                    selectedDays === option.value
                      ? "bg-purple-500/20 border-purple-500/50 text-purple-400"
                      : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:border-white/20"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white text-sm font-medium transition disabled:opacity-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="flex-1 px-5 py-3 rounded-xl bg-linear-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white text-sm font-bold transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  "Mulai Interval"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};

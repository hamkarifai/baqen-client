import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Loader2, AlertCircle, CalendarDays } from "lucide-react";
import { alquranService } from "@/features/alquran/services/alquran.services";
import type { EditIntervalDaysPayload, EditIntervalDaysResponse } from "@/features/alquran/types/quran.types";

interface EditIntervalModalProps {
  isOpen: boolean;
  itemId: string;
  currentIntervalDays: number;
  onClose: () => void;
  onSuccess: (updatedItem: EditIntervalDaysResponse["data"]) => void;
}

export const EditIntervalModal = ({
  isOpen,
  itemId,
  currentIntervalDays,
  onClose,
  onSuccess,
}: EditIntervalModalProps) => {
  const [intervalDays, setIntervalDays] = useState(currentIntervalDays);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setIntervalDays(currentIntervalDays);
      setError(null);
    }
  }, [isOpen, currentIntervalDays]);

  const handleSubmit = async () => {
    if (intervalDays < 1) {
      setError("Interval days minimal 1 hari");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload: EditIntervalDaysPayload = {
        interval_days: intervalDays,
      };

      const response = await alquranService.editIntervalDays(itemId, payload);
      onSuccess(response.data);
      onClose();
    } catch (err: unknown) {
      const message =
        (err as any)?.response?.data?.message || "Gagal mengupdate interval";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/85 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="rounded-3xl border border-white/10 bg-linear-to-br from-[#1A2232] via-[#151B28] to-[#111826] shadow-[0_40px_100px_rgba(0,0,0,0.7)] p-6 md:p-8">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <CalendarDays className="w-6 h-6 text-amber-400" />
              <h3 className="text-2xl font-black text-white">
                Edit Interval Review
              </h3>
            </div>
            <p className="text-gray-400 text-sm">
              Atur berapa hari interval review untuk item ini
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl border border-rose-400/30 bg-rose-500/10 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <p className="text-rose-300 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-5">
            {/* Current Value Display */}
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <p className="text-sm text-amber-200 mb-1">Interval Saat Ini</p>
              <p className="text-3xl font-black text-amber-400">
                {currentIntervalDays} hari
              </p>
            </div>

            {/* Interval Days Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Interval Baru (dalam hari)
              </label>
              <input
                type="number"
                value={intervalDays}
                onChange={(e) => setIntervalDays(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 transition-all"
                placeholder="7"
                min="1"
              />
              <p className="text-xs text-gray-500 mt-1">
                Contoh: 7 = review setiap 7 hari
              </p>
            </div>

            {/* Quick Presets */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Preset Cepat
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[1, 3, 7, 14].map((days) => (
                  <button
                    key={days}
                    type="button"
                    onClick={() => setIntervalDays(days)}
                    className={`px-3 py-2 rounded-lg font-medium text-sm transition-all ${
                      intervalDays === days
                        ? "bg-amber-500 text-white"
                        : "bg-white/5 text-gray-300 hover:bg-white/10"
                    }`}
                  >
                    {days} hari
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-8">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-gray-300 font-semibold hover:bg-white/10 transition-colors disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 px-4 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-white font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                "Simpan Interval"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};

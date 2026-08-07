import { useState } from "react";
import { X, CalendarDays, ChevronRight, Loader2 } from "lucide-react";
import { useStartInterval } from "@/features/alquran/hooks/useStartInterval";

interface StartIntervalModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemId: string;
  itemTitle: string; // Supaya user tau hafalan mana yang akan di-set
  onSuccess?: () => void; // Callback opsional → bisa dipakai untuk refresh data
}

/**
 * StartIntervalModal
 *
 * Modal ini mengikuti pola yang sama dengan AddHafalanModal:
 * - Props dari luar: isOpen, onClose, data yang dibutuhkan
 * - State internal: hanya form state (intervalDays)
 * - Logic async: didelegasikan ke custom hook (useStartInterval)
 * - Setelah sukses: tutup modal + panggil onSuccess callback
 */
export const StartIntervalModal = ({
  isOpen,
  onClose,
  itemId,
  itemTitle,
  onSuccess,
}: StartIntervalModalProps) => {
  const [intervalDays, setIntervalDays] = useState<number>(7);
  const { startInterval, loading, error } = useStartInterval();

  const handleSubmit = async () => {
    if (intervalDays < 1) return;

    try {
      await startInterval(itemId, intervalDays);
      onSuccess?.(); // Panggil callback jika ada (opsional, makanya pakai ?.)
      onClose();
      // Reset setelah animasi close selesai
      setTimeout(() => setIntervalDays(7), 300);
    } catch {
      // Error sudah dihandle oleh hook (state error diisi),
      // jadi modal tetap terbuka supaya user bisa lihat pesannya.
    }
  };

  if (!isOpen) return null;

  // Preset pilihan hari yang umum, supaya UX lebih cepat
  const PRESETS = [1, 3, 7, 14, 30];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop — klik di luar modal untuk tutup */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-sm bg-[#0F1218] border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-500">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Mulai Latihan Interval</h2>
              <p className="text-xs text-gray-400 truncate max-w-[180px]">
                {itemTitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Tampilan angka hari yang dipilih */}
          <div className="text-center">
            <span className="text-6xl font-mono font-bold text-white">
              {intervalDays}
            </span>
            <p className="text-sm text-gray-400 mt-1">hari sekali murajaah</p>
          </div>

          {/* Preset buttons — UX shortcut */}
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 block">
              Pilih cepat
            </label>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((preset) => (
                <button
                  key={preset}
                  onClick={() => setIntervalDays(preset)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
                    intervalDays === preset
                      ? "bg-amber-500/20 border-amber-500/50 text-amber-400"
                      : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
                  }`}
                >
                  {preset}h
                </button>
              ))}
            </div>
          </div>

          {/* Input manual — untuk nilai kustom */}
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 block">
              Atau masukkan manual
            </label>
            <input
              type="number"
              min={1}
              max={365}
              value={intervalDays}
              onChange={(e) =>
                setIntervalDays(Math.max(1, parseInt(e.target.value) || 1))
              }
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-center text-lg font-mono focus:outline-none focus:border-amber-500/50 focus:bg-amber-500/5 transition-all"
            />
          </div>

          {/* Error message */}
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
              <p className="text-red-400 text-sm text-center">{error}</p>
            </div>
          )}

          {/* Submit button */}
          <button
            onClick={handleSubmit}
            disabled={loading || intervalDays < 1}
            className="w-full py-4 rounded-xl bg-linear-to-r from-amber-500 to-orange-600 text-black font-bold shadow-lg shadow-amber-900/20 hover:shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Memulai...</span>
              </>
            ) : (
              <>
                <span>Mulai Interval</span>
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

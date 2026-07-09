import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { BookOpen, ChevronDown, Loader2, PlusCircle, X } from "lucide-react";

interface AddJuzToClassModalProps {
  isOpen: boolean;
  classId: string;
  isLoading?: boolean;
  errorMessage?: string | null;
  onClose: () => void;
  onSubmit: (juzIndex: number) => void | Promise<void>;
}

export const AddJuzToClassModal = ({
  isOpen,
  classId,
  isLoading = false,
  errorMessage,
  onClose,
  onSubmit,
}: AddJuzToClassModalProps) => {
  const [selectedJuz, setSelectedJuz] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setSelectedJuz("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!selectedJuz) return;
    void onSubmit(Number(selectedJuz));
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative w-full max-w-xl overflow-hidden rounded-[2rem] border border-white/10 bg-[#0A1120] shadow-[0_40px_100px_rgba(0,0,0,0.7)]">
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="absolute right-4 top-4 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-gray-300 transition hover:bg-white/10 disabled:opacity-50"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="px-6 py-6 sm:px-8 sm:py-8">
          <div className="mb-8 rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="flex items-center gap-3 text-cyan-300">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-500/10">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300/80">
                  Kelas Quran
                </p>
                <h2 className="text-2xl font-black text-white">
                  Tambahkan Juz
                </h2>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-gray-400">
              Pilih juz yang akan ditambahkan ke kelas ini. Juz akan dibuat
              dengan scope kelas saat ini.
            </p>
            <p className="mt-2 text-[11px] text-gray-500">
              Class ID: {classId}
            </p>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-white">
              Pilih Juz
            </label>
            <div className="relative">
              <select
                value={selectedJuz}
                onChange={(e) => setSelectedJuz(e.target.value)}
                disabled={isLoading}
                className="w-full appearance-none rounded-2xl border border-white/10 bg-white/5 py-4 pl-4 pr-10 text-white outline-none transition focus:border-cyan-400 focus:bg-white/10 disabled:opacity-50"
              >
                <option value="">-- Pilih Juz --</option>
                {Array.from({ length: 30 }, (_, i) => i + 1).map((juz) => (
                  <option key={juz} value={juz.toString()}>
                    Juz {juz}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400">
                <ChevronDown className="h-4 w-4" />
              </div>
            </div>
          </div>

          {errorMessage ? (
            <div className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">
              {errorMessage}
            </div>
          ) : null}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading || !selectedJuz}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-amber-400 to-amber-600 px-4 py-4 font-bold uppercase tracking-wider text-black transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:from-gray-700 disabled:to-gray-800 disabled:text-gray-500"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <PlusCircle className="h-5 w-5" />
                Tambahkan Juz
              </>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

import { useState } from "react";
import { PlusCircle, X, CheckCircle, Loader2 } from "lucide-react";
import { useCreateJuz } from "@/features/alquran/hooks/useCreateJuz";
import { ErrorMessage } from "@/components/ui/ErrorMessage";

interface CreateJuzFormProps {
  onClose: () => void;
  onSuccess?: () => void;
  classId?: string;
}


import { useCreateClassJuz } from "@/features/alquran/hooks/useClassJuz";

export const CreateJuzForm = ({ onClose, onSuccess, classId }: CreateJuzFormProps) => {
  const { createJuz, loading: personalLoading, data: personalData, error: personalError } = useCreateJuz();
  const { createClassJuz, loading: classLoading, data: classData, error: classError } = useCreateClassJuz();
  const [selectedJuz, setSelectedJuz] = useState("");

  const loading = classId ? classLoading : personalLoading;
  const data = classId ? classData : personalData;
  const error = classId ? classError : personalError;

  const handleJuzChange = (juz: string) => {
    setSelectedJuz(juz);
  };

  const handleSubmit = async () => {
    if (!selectedJuz) return;
    if (classId) {
      await createClassJuz(Number(selectedJuz), classId);
    } else {
      await createJuz(Number(selectedJuz));
    }
    onSuccess?.();
  };

  const selectedJuzLabel = (() => {
    const juzData = data?.data as
      | { index?: number; Index?: number }
      | undefined;
    return juzData?.index ?? juzData?.Index ?? selectedJuz;
  })();

  // SUCCESS STATE
  if (data) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
        <div className="w-full max-w-md bg-[#0F1115] border border-emerald-500/30 rounded-3xl p-8 shadow-[0_0_100px_-20px_rgba(16,185,129,0.2)] text-center relative overflow-hidden">
          {/* Background effect */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-emerald-500/20 rounded-full blur-[50px]" />

          <div className="relative z-10 flex flex-col items-center">
            <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 animate-in zoom-in duration-500">
              <CheckCircle className="w-10 h-10 text-emerald-400" />
            </div>

            <h2 className="text-2xl font-serif text-white mb-2">
              Alhamdulillah!
            </h2>
            <p className="text-gray-400 mb-8">
              Juz{" "}
              <span className="text-emerald-400 font-bold">
                {selectedJuzLabel}
              </span>{" "}
              berhasil ditambahkan.
              <br />
              Selamat memulai hafalan baru!
            </p>

            <button
              onClick={onClose}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-900/20 cursor-pointer"
            >
              Mulai Menghafal
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-[550px] bg-[rgba(10,12,15,0.95)] border border-amber-500/30 backdrop-blur-3xl rounded-3xl p-10 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.9)]">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-4">
          <h1 className="text-xl font-serif text-white">Hafalan Baru</h1>
          <button
            onClick={onClose}
            className="text-gray-500 cursor-pointer hover:text-white transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Juz Selection */}
        <div className="mb-6">
          <label className="block font-mono text-xs text-amber-400 uppercase tracking-widest mb-2">
            1. Pilih Juz
          </label>
          <select
            value={selectedJuz}
            onChange={(e) => handleJuzChange(e.target.value)}
            disabled={loading}
            className="w-full bg-white/5 border border-white/10 text-white px-3.5 py-3.5 rounded-xl font-inter cursor-pointer appearance-none transition-colors hover:bg-white/10 focus:outline-none focus:border-amber-400 focus:bg-amber-500/5 disabled:opacity-50"
          >
            <option value="">-- Pilih Juz --</option>
            {Array.from({ length: 30 }, (_, i) => 30 - i).map((juz) => (
              <option key={juz} value={juz.toString()}>
                Juz {juz}
              </option>
            ))}
          </select>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={loading || !selectedJuz}
          className="w-full py-4 bg-linear-to-r from-amber-400 to-amber-600 disabled:from-gray-700 disabled:to-gray-800 disabled:text-gray-500 text-black font-bold uppercase rounded-xl transition-transform hover:-translate-y-0.5 hover:shadow-[0_5px_20px_rgba(245,158,11,0.2)] tracking-wider flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Menyimpan...
            </>
          ) : (
            <>
              <PlusCircle className="w-5 h-5" />
              Tambahkan Juz
            </>
          )}
        </button>
        <ErrorMessage message={error} />
      </div>
    </div>
  );
};

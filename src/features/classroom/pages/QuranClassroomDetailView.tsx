import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, BookOpen, LibraryBig, Plus, Sparkles, Users } from "lucide-react";
import { Sidebar } from "@/components/ui/Sidebar";
import { Button } from "@/components/ui/button";
import { JuzCard } from "@/features/alquran/components/JuzCard";
import type { LifecycleStats } from "@/features/alquran/types/quran.types";
import { useGetClassJuz, useCreateClassJuz } from "@/features/alquran/hooks/useClassJuz";
import { tones, toneStyles, statusLabel } from "../constants";
import type { ClassItem } from "../types";
import BackgroundAmbience from "../components/shared/BackgroundAmbience";
import { AddJuzToClassModal } from "../components/dashboard/modals/AddJuzToClassModal";
import { ErrorMessage } from "@/components/ui/ErrorMessage";

interface QuranClassroomDetailViewProps {
  classroom: ClassItem;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
}

export const QuranClassroomDetailView = ({
  classroom,
  isSidebarOpen,
  setIsSidebarOpen,
}: QuranClassroomDetailViewProps) => {
  const navigate = useNavigate();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const { data, loading, error, getClassJuz } = useGetClassJuz(classroom.id);
  const {
    loading: isCreating,
    error: createError,
    createClassJuz,
  } = useCreateClassJuz();

  const theme = toneStyles[tones[classroom.id.charCodeAt(0) % tones.length]];

  useEffect(() => {
    void getClassJuz();
  }, [getClassJuz]);

  const juzCards = useMemo(() => {
    return (data?.data ?? []).map((juz) => ({
      juz,
      stats: {
        menghafal: juz.menghafal,
        murajaah: juz.interval,
        terjaga: juz.fsrs_active,
        selesai: juz.graduate,
      } satisfies LifecycleStats,
    }));
  }, [data]);

  const handleAddJuz = async (juzIndex: number) => {
    try {
      const response = await createClassJuz(juzIndex, classroom.id);
      setActionMessage(response.message || `Juz ${juzIndex} berhasil ditambahkan.`);
      await getClassJuz();
      setIsAddModalOpen(false);
    } catch (err) {
      const fallback =
        createError ||
        error ||
        "Gagal menambahkan juz ke kelas ini. Coba lagi beberapa saat.";
      setActionMessage(fallback);
      throw err;
    }
  };

  return (
    <div className="min-h-screen bg-[#06080C] text-slate-200 font-sans antialiased selection:bg-indigo-500/40 pb-12">
      <BackgroundAmbience />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="sticky z-40 bg-[#06080C]/80 backdrop-blur-md border-b border-white/[0.06] px-4 sm:px-6 lg:px-10 py-4">
        <div className="max-w-7xl mx-auto gap-4 mb-4 mt-4 px-6">
          <div className="flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-200 transition hover:border-amber-500/40 hover:bg-amber-500/10"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali
            </button>
            <span
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-widest ${theme.border} ${theme.softBg} ${theme.text}`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              Kelas Quran
            </span>
          </div>
        </div>
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-6">
        <div className="relative rounded-2xl overflow-hidden border border-white/[0.08] bg-[#0B0F19] min-h-[180px] md:min-h-[220px] flex items-center shadow-2xl">
          <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:32px_32px]" />
          <div
            className={`absolute -right-12 -top-12 h-56 w-56 rounded-full bg-gradient-to-br ${theme.softBg} blur-[80px] opacity-30`}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/60 to-transparent z-10" />

          <div className="relative z-20 w-full p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-3xl">
              <div className="flex items-center gap-2.5">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border backdrop-blur-md ${theme.border} ${theme.softBg} ${theme.text}`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
                  {classroom.is_active ? statusLabel.active : statusLabel.draft}
                </span>
                <span className="text-xs text-slate-400/80 font-medium">
                  Materi Al-Qur'an
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-tight">
                {classroom.name}
              </h2>
              <p className="text-sm text-slate-300/90 leading-relaxed max-w-2xl">
                {classroom.description ||
                  "Kelas Quran ini berisi daftar juz yang terhubung langsung dengan kelas."}
              </p>
            </div>
          </div>
        </div>

        {(actionMessage || error) && (
          <ErrorMessage
            title={actionMessage ? "Info" : "Gagal memuat data"}
            message={actionMessage || error}
          />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-4 space-y-4">
            <div className="p-5 rounded-xl border border-white/[0.06] bg-[#0E131F]/40 backdrop-blur-xl space-y-4 shadow-md">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                Pengajar & Ringkasan
              </p>
              <div className="flex items-center gap-3">
                <div
                  className={`h-11 w-11 flex items-center justify-center rounded-xl border ${theme.border} ${theme.iconBg} text-white shadow-inner`}
                >
                  <LibraryBig className={`h-5 w-5 ${theme.text}`} />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-sm text-white truncate">
                    {classroom.owner_name}
                  </p>
                  <p className="text-xs text-indigo-400/80 font-medium mt-0.5">
                    Pengelola kelas Quran
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-5 rounded-xl border border-white/[0.06] bg-[#0E131F]/40 shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-8 w-8 rounded-lg flex items-center justify-center bg-white/5 text-slate-400">
                    <Users className="h-4 w-4" />
                  </div>
                </div>
                <p className="text-2xl font-black text-white tracking-tight">
                  {classroom.student_count}
                </p>
                <p className="text-[11px] font-semibold text-slate-400 mt-1 uppercase tracking-wide">
                  Santri
                </p>
              </div>

              <div className="p-5 rounded-xl border border-white/[0.06] bg-[#0E131F]/40 shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-8 w-8 rounded-lg flex items-center justify-center bg-white/5 text-slate-400">
                    <BookOpen className="h-4 w-4" />
                  </div>
                </div>
                <p className="text-2xl font-black text-white tracking-tight">
                  {data?.data.length ?? 0}
                </p>
                <p className="text-[11px] font-semibold text-slate-400 mt-1 uppercase tracking-wide">
                  Juz Aktif
                </p>
              </div>
            </div>

            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl h-11 px-5 shadow-lg shadow-amber-600/20 transition-all gap-2"
            >
              <Plus className="h-4 w-4" />
              Tambahkan Juz
            </Button>
          </div>

          <div className="lg:col-span-8 p-6 rounded-xl border border-white/[0.08] bg-[#0A0E17]/60 backdrop-blur-2xl shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between sm:items-center border-b border-white/[0.08] pb-4">
              <div>
                <h3 className="text-base font-bold text-white">
                  Daftar Juz Kelas Quran
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Juz yang sudah dibuat untuk kelas ini akan muncul di bawah.
                </p>
              </div>
              {loading ? (
                <span className="text-xs text-slate-500">Memuat juz...</span>
              ) : null}
            </div>

            {juzCards.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {juzCards.map(({ juz, stats }) => (
                  <JuzCard
                    key={juz.juz_id}
                    juzNumber={juz.juz_index}
                    itemCount={juz.total_items}
                    stats={stats}
                    onClick={() => navigate("/dashboard/alquran")}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-white/10 bg-white/3 p-8 text-center text-sm text-slate-400">
                Belum ada juz yang ditambahkan ke kelas ini.
              </div>
            )}
          </div>
        </div>
      </main>

      <AddJuzToClassModal
        isOpen={isAddModalOpen}
        classId={classroom.id}
        isLoading={isCreating}
        errorMessage={createError}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddJuz}
      />
    </div>
  );
};

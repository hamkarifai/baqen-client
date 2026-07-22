import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Plus, ImageIcon, Sparkles, BookOpen } from "lucide-react";
import { useGetJuz } from "@/features/alquran/hooks/useGetJuz";
import { JuzCard } from "@/features/alquran/components/JuzCard";
import type { CardJuzData } from "@/features/alquran/types/quran.types";
import { CreateJuzForm } from "@/features/alquran/components/CreateJuzForm";

import BackgroundAmbience from "@/features/classroom/components/shared/BackgroundAmbience";
import { Sidebar } from "@/components/ui/Sidebar";
import MobileSidebarOverlay from "@/features/classroom/components/navigation/MobileSidebarOverlay";
import { TopNavigationBar } from "@/features/classroom/components/navigation/TopNavigationBar";

import { toneStyles, tones, statusLabel } from "@/features/classroom/constants";

interface StudentQuranClassroomDetailViewProps {
  classroom: any;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
}

export const StudentQuranClassroomDetailView = ({
  classroom,
  isSidebarOpen,
  setIsSidebarOpen,
}: StudentQuranClassroomDetailViewProps) => {
  const navigate = useNavigate();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { data: juzData, getJuz, loading: juzLoading } = useGetJuz(classroom.id);

  useEffect(() => {
    void getJuz();
  }, [getJuz, classroom.id]);

  const handleJuzClick = (juz: { id: string; index: number }) => {
    navigate(`/dashboard/kelas/${classroom.id}/juz/${juz.id}?juzIndex=${juz.index}`);
  };

  const handleCreateSuccess = () => {
    setShowCreateForm(false);
    void getJuz();
  };

  const toneIndex = classroom.id.charCodeAt(0) % tones.length;
  const theme = toneStyles[tones[toneIndex]];

  return (
    <div className="min-h-screen bg-[#06080C] text-slate-200 font-sans antialiased selection:bg-indigo-500/40 pb-12">
      <BackgroundAmbience />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <MobileSidebarOverlay
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />

      {/* Top Nav Bar */}
      <div className="sticky z-40 bg-[#06080C]/80 backdrop-blur-md border-b border-white/[0.06] px-4 sm:px-6 lg:px-10 py-4">
        <div className="max-w-7xl mx-auto gap-4 mb-4 mt-4 px-6">
          <TopNavigationBar
            info={classroom.name}
            setIsSidebarOpen={setIsSidebarOpen}
          />
        </div>
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-6">
        {/* HERO BANNER */}
        <div className="relative rounded-2xl overflow-hidden border border-white/[0.08] bg-[#0B0F19] min-h-[180px] md:min-h-[220px] flex items-center shadow-2xl">
          {classroom.cover_image ? (
            <>
              <img
                src={classroom.cover_image}
                alt={classroom.name}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/70 to-transparent z-10" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#06080C] via-transparent to-transparent z-10" />
            </>
          ) : (
            <>
              <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:32px_32px]" />
              <div
                className={`absolute -right-12 -top-12 h-56 w-56 rounded-full bg-gradient-to-br ${theme.softBg} blur-[80px] opacity-30`}
              />
              <div className="absolute right-8 md:right-16 bottom-0 top-0 my-auto h-24 w-24 md:h-32 md:w-32 flex items-center justify-center text-white/[0.03] pointer-events-none">
                <ImageIcon className="w-full h-full stroke-[1]" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/40 to-transparent z-10" />
            </>
          )}

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
                  Kelas Al-Quran
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-tight">
                {classroom.name}
              </h2>
              <p className="text-sm text-slate-300/90 leading-relaxed max-w-2xl">
                {classroom.description ||
                  "Belum ada deskripsi detail yang disematkan untuk kelas ini."}
              </p>
            </div>
          </div>
        </div>

        {/* LAYOUT GRID UTAMA */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* PANEL KIRI: Metadata */}
          <div className="lg:col-span-4 space-y-4">
            <div className="p-5 rounded-xl border border-white/[0.06] bg-[#0E131F]/40 backdrop-blur-xl space-y-4 shadow-md">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                Pengajar / Muhaffizh
              </p>
              <div className="flex items-center gap-3">
                <div
                  className={`h-11 w-11 flex items-center justify-center rounded-xl border ${theme.border} ${theme.iconBg} text-white shadow-inner`}
                >
                  <Sparkles className={`h-5 w-5 ${theme.text}`} />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-sm text-white truncate">
                    {classroom.owner_name}
                  </p>
                  <p className="text-xs text-indigo-400/80 font-medium mt-0.5">
                    Guru Pembimbing Hafalan
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-xl border border-white/[0.06] bg-[#0E131F]/20 text-center space-y-1">
              <p className="text-2xl font-bold text-white tracking-tight">
                {juzData?.data?.length || 0}
              </p>
              <p className="text-xs text-slate-400">
                Juz Hafalan Terdaftar
              </p>
            </div>
          </div>

          {/* PANEL KANAN: Ruang Kerja Tab */}
          <div className="lg:col-span-8 p-6 rounded-xl border border-white/[0.08] bg-[#0A0E17]/60 backdrop-blur-2xl shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between sm:items-center border-b border-white/[0.08] pb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  Daftar Juz Hafalan Kelas
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Tambahkan dan pantau progres hafalan juz Anda di kelas ini.
                </p>
              </div>

              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg h-9 px-4 self-start sm:self-center flex items-center gap-2 transition-all shadow-lg shadow-emerald-900/20"
              >
                <Plus className="h-4 w-4" /> Tambah Juz
              </button>
            </div>

            {/* TAB CONTENT: JUZ WORKSPACE */}
            <div className="space-y-6">
              {juzLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="h-40 rounded-2xl bg-white/5 animate-pulse"
                    />
                  ))}
                </div>
              ) : juzData?.data && juzData.data.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {juzData.data.map((juz: CardJuzData) => (
                    <JuzCard
                      key={juz.juz_id}
                      juzNumber={juz.juz_index}
                      itemCount={juz.total_items}
                      stats={{
                        menghafal: juz.menghafal,
                        murajaah: juz.interval,
                        terjaga: juz.fsrs_active,
                        selesai: juz.graduate,
                      }}
                      onClick={() =>
                        handleJuzClick({ id: juz.juz_id, index: juz.juz_index })
                      }
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border border-dashed border-white/5 rounded-xl bg-slate-950/10">
                  <BookOpen className="h-8 w-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-xs text-slate-400">
                    Belum ada juz hafalan yang ditambahkan di kelas ini.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {showCreateForm && (
        <CreateJuzForm
          classId={classroom.id}
          onClose={() => setShowCreateForm(false)}
          onSuccess={handleCreateSuccess}
        />
      )}
    </div>
  );
};

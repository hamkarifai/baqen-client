import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft,
  BookOpen,
  LibraryBig,
  Plus,
  Sparkles,
  Users,
  GraduationCap,
  CheckCircle2,
  XCircle,
  Clock,
  BookMarked,
  User,
  Calendar,
  Activity,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Sidebar } from "@/components/ui/Sidebar";
import { Button } from "@/components/ui/button";
import { JuzCard } from "@/features/alquran/components/JuzCard";
import type { LifecycleStats } from "@/features/alquran/types/quran.types";
import {
  useGetClassJuz,
  useCreateClassJuz,
} from "@/features/alquran/hooks/useClassJuz";
import { tones, toneStyles, statusLabel } from "../constants";
import type { ClassItem, PendingGraduation } from "../types";
import BackgroundAmbience from "../components/shared/BackgroundAmbience";
import { AddJuzToClassModal } from "../components/dashboard/modals/AddJuzToClassModal";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import {
  useGetPendingGraduations,
  useApproveGraduation,
  useRejectGraduation,
} from "../hooks/useClassroom";
import { useAuthStore } from "@/features/auth/stores/auth.store";

interface QuranClassroomDetailViewProps {
  classroom: ClassItem;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
}

// Helper to parse content_ref like "surah:1:1-7"
function parseContentRef(ref: string): string {
  const parts = ref.split(":");
  if (parts.length >= 3) {
    return `Surah ${parts[1]}, Ayat ${parts[2]}`;
  }
  return ref;
}

type GraduationAction = {
  item: PendingGraduation;
  action: "approve" | "reject";
} | null;

export const QuranClassroomDetailView = ({
  classroom,
  isSidebarOpen,
  setIsSidebarOpen,
}: QuranClassroomDetailViewProps) => {
  const navigate = useNavigate();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [actionMessageType, setActionMessageType] = useState<
    "success" | "error"
  >("success");
  const [pendingAction, setPendingAction] = useState<GraduationAction>(null);
  const [isGraduationOpen, setIsGraduationOpen] = useState(true);

  const userRole = useAuthStore((state) => state.user?.role);
  const isTeacher = userRole === "teacher";

  const { data, loading, error, getClassJuz } = useGetClassJuz(classroom.id);
  const {
    loading: isCreating,
    error: createError,
    createClassJuz,
  } = useCreateClassJuz();

  const theme = toneStyles[tones[classroom.id.charCodeAt(0) % tones.length]];

  // Graduation hooks
  const {
    data: pendingGraduations,
    isLoading: isLoadingGraduations,
    error: graduationError,
    refetch: refetchGraduations,
  } = useGetPendingGraduations(isTeacher ? classroom.id : "");
  const { mutateAsync: approve, isPending: isApproving } =
    useApproveGraduation();
  const { mutateAsync: reject, isPending: isRejecting } = useRejectGraduation();

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
      setActionMessage(
        response.message || `Juz ${juzIndex} berhasil ditambahkan.`,
      );
      setActionMessageType("success");
      await getClassJuz();
      setIsAddModalOpen(false);
    } catch (err) {
      const fallback =
        createError ||
        error ||
        "Gagal menambahkan juz ke kelas ini. Coba lagi beberapa saat.";
      setActionMessage(fallback);
      setActionMessageType("error");
      throw err;
    }
  };

  const handleGraduationAction = async () => {
    if (!pendingAction) return;
    const { item, action } = pendingAction;
    try {
      if (action === "approve") {
        await approve({ classId: classroom.id, itemId: item.item_id });
        setActionMessage(
          `Kelulusan ${item.student_name} untuk ${parseContentRef(item.content_ref)} berhasil disetujui! 🎉`,
        );
        setActionMessageType("success");
      } else {
        await reject({ classId: classroom.id, itemId: item.item_id });
        setActionMessage(
          `Kelulusan ${item.student_name} untuk ${parseContentRef(item.content_ref)} ditolak.`,
        );
        setActionMessageType("error");
      }
      refetchGraduations();
    } catch {
      setActionMessage("Terjadi kesalahan. Coba lagi.");
      setActionMessageType("error");
    } finally {
      setPendingAction(null);
      setTimeout(() => setActionMessage(null), 5000);
    }
  };

  const pendingCount = pendingGraduations?.length ?? 0;

  return (
    <div className="min-h-screen bg-[#06080C] text-slate-200 font-sans antialiased selection:bg-indigo-500/40 pb-12">
      <BackgroundAmbience />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="sticky z-40 bg-[#06080C]/80 backdrop-blur-md border-b border-white/[0.06] px-4 sm:px-6 lg:px-10 py-4">
        <div className="max-w-7xl mx-auto gap-4 mb-4 mt-4 px-6">
          <div className="flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => navigate(`/dashboard/kelas/`)}
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
        {/* Hero Banner */}
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

        {/* Action messages */}
        {actionMessage && (
          <div
            className={`flex items-start gap-3 p-4 rounded-xl border text-sm font-medium animate-fadeIn ${
              actionMessageType === "success"
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                : "bg-red-500/10 border-red-500/20 text-red-400"
            }`}
          >
            {actionMessageType === "success" ? (
              <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            )}
            {actionMessage}
          </div>
        )}

        {(error) && (
          <ErrorMessage title="Gagal memuat data" message={error} />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Panel */}
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

            {isTeacher && (
              <div className="p-5 rounded-xl border border-amber-500/20 bg-amber-500/5 shadow-md">
                <div className="flex items-center gap-3 mb-1">
                  <div className="h-8 w-8 rounded-lg flex items-center justify-center bg-amber-500/10 text-amber-400">
                    <GraduationCap className="h-4 w-4" />
                  </div>
                  <p className="text-[11px] font-bold text-amber-400/80 uppercase tracking-widest">
                    Menunggu Persetujuan
                  </p>
                </div>
                <p className="text-2xl font-black text-white tracking-tight mt-2">
                  {isLoadingGraduations ? "..." : pendingCount}
                </p>
                <p className="text-[11px] font-semibold text-slate-400 mt-1 uppercase tracking-wide">
                  Pengajuan Kelulusan
                </p>
              </div>
            )}

            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl h-11 px-5 shadow-lg shadow-amber-600/20 transition-all gap-2"
            >
              <Plus className="h-4 w-4" />
              Tambahkan Juz
            </Button>
          </div>

          {/* Right Panel */}
          <div className="lg:col-span-8 space-y-6">
            {/* Juz List */}
            <div className="p-6 rounded-xl border border-white/[0.08] bg-[#0A0E17]/60 backdrop-blur-2xl shadow-xl space-y-6">
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
                      onClick={() =>
                        navigate(
                          `/dashboard/kelas/${classroom.id}/juz/${juz.juz_id}?juzIndex=${juz.juz_index}`,
                        )
                      }
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-white/10 bg-white/3 p-8 text-center text-sm text-slate-400">
                  Belum ada juz yang ditambahkan ke kelas ini.
                </div>
              )}
            </div>

            {/* Graduation Approval Section — Teacher Only */}
            {isTeacher && (
              <div className="rounded-xl border border-white/[0.08] bg-[#0A0E17]/60 backdrop-blur-2xl shadow-xl overflow-hidden">
                {/* Header */}
                <button
                  onClick={() => setIsGraduationOpen((v) => !v)}
                  className="w-full flex items-center justify-between p-6 border-b border-white/[0.08] hover:bg-white/[0.02] transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl flex items-center justify-center bg-amber-500/10 border border-amber-500/20 text-amber-400">
                      <GraduationCap className="h-4 w-4" />
                    </div>
                    <div className="text-left">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-white">
                          Persetujuan Kelulusan
                        </h3>
                        {pendingCount > 0 && (
                          <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-amber-500 text-[10px] font-black text-black">
                            {pendingCount}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Santri yang meminta kelulusan hafalan
                      </p>
                    </div>
                  </div>
                  <div className="text-slate-500 group-hover:text-slate-300 transition-colors">
                    {isGraduationOpen ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </div>
                </button>

                {/* Body */}
                {isGraduationOpen && (
                  <div className="p-6 space-y-4">
                    {isLoadingGraduations ? (
                      <div className="space-y-3">
                        {[...Array(2)].map((_, i) => (
                          <div
                            key={i}
                            className="h-24 rounded-xl bg-white/5 animate-pulse"
                          />
                        ))}
                      </div>
                    ) : graduationError ? (
                      <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        Gagal memuat data kelulusan.
                      </div>
                    ) : pendingGraduations && pendingGraduations.length > 0 ? (
                      <div className="space-y-3">
                        {pendingGraduations.map((item) => (
                          <GraduationCard
                            key={item.item_id}
                            item={item}
                            isLoading={isApproving || isRejecting}
                            onApprove={() =>
                              setPendingAction({ item, action: "approve" })
                            }
                            onReject={() =>
                              setPendingAction({ item, action: "reject" })
                            }
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-3 py-10 text-center border border-dashed border-white/10 rounded-xl bg-white/[0.01]">
                        <div className="h-12 w-12 rounded-full flex items-center justify-center bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                          <CheckCircle2 className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">
                            Semua sudah diproses
                          </p>
                          <p className="text-xs text-slate-400 mt-1">
                            Tidak ada pengajuan kelulusan yang menunggu
                            persetujuan saat ini.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
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

      {/* Confirm Modal */}
      {pendingAction && (
        <ConfirmModal
          isOpen={true}
          onClose={() => setPendingAction(null)}
          onConfirm={handleGraduationAction}
          title={
            pendingAction.action === "approve"
              ? "Setujui Kelulusan?"
              : "Tolak Kelulusan?"
          }
          message={
            pendingAction.action === "approve"
              ? `Kamu akan menyetujui kelulusan ${pendingAction.item.student_name} untuk ${parseContentRef(pendingAction.item.content_ref)}. Hafalan ini akan dianggap selesai dan dikunci.`
              : `Kamu akan menolak pengajuan kelulusan ${pendingAction.item.student_name} untuk ${parseContentRef(pendingAction.item.content_ref)}. Santri perlu mengajukan ulang.`
          }
          confirmText={
            pendingAction.action === "approve" ? "Ya, Setujui" : "Ya, Tolak"
          }
          cancelText="Batal"
          variant={pendingAction.action === "approve" ? "success" : "danger"}
        />
      )}
    </div>
  );
};

// --- Graduation Card sub-component ---

interface GraduationCardProps {
  item: PendingGraduation;
  isLoading: boolean;
  onApprove: () => void;
  onReject: () => void;
}

const GraduationCard = ({
  item,
  isLoading,
  onApprove,
  onReject,
}: GraduationCardProps) => {
  const stability = parseFloat(item.stability);
  const stabilityPct = Math.min(Math.round(stability * 10), 100);

  const submittedDate = new Date(item.created_at).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="group relative rounded-xl border border-white/[0.07] bg-[#0D1220]/60 hover:border-amber-500/20 hover:bg-[#0D1220]/80 transition-all duration-200 overflow-hidden">
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-amber-500/40 via-orange-500/30 to-transparent" />

      <div className="p-4 space-y-3">
        {/* Student info row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* Avatar */}
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
              <span className="text-sm font-black text-amber-400">
                {item.student_name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-bold text-sm text-white truncate">
                  {item.student_name}
                </p>
              </div>
              <p className="text-xs text-slate-500 truncate">
                {item.student_email}
              </p>
            </div>
          </div>

          {/* Status badge */}
          <span className="shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-[10px] font-bold text-amber-400 uppercase tracking-wider">
            <Clock className="h-2.5 w-2.5" />
            Menunggu
          </span>
        </div>

        {/* Detail info grid */}
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.05]">
            <BookMarked className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
            <div className="min-w-0">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                Hafalan
              </p>
              <p className="text-xs font-bold text-white truncate">
                {parseContentRef(item.content_ref)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.05]">
            <Activity className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
            <div className="min-w-0">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                Interval Terakhir
              </p>
              <p className="text-xs font-bold text-white">
                {item.last_interval_days} hari
              </p>
            </div>
          </div>
        </div>

        {/* Stability bar */}
        <div className="px-3 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.05] space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <User className="h-3 w-3 text-slate-500" />
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                Stabilitas Hafalan
              </p>
            </div>
            <span className="text-[10px] font-black text-emerald-400">
              {stabilityPct}%
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
              style={{ width: `${stabilityPct}%` }}
            />
          </div>
        </div>

        {/* Submitted at */}
        <div className="flex items-center gap-1.5 text-[10px] text-slate-600">
          <Calendar className="h-3 w-3" />
          Diajukan: {submittedDate}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <button
            onClick={onReject}
            disabled={isLoading}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/30 text-red-400 text-xs font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <XCircle className="h-3.5 w-3.5" />
            Tolak
          </button>
          <button
            onClick={onApprove}
            disabled={isLoading}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 hover:border-emerald-500/30 text-emerald-400 text-xs font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            Setujui
          </button>
        </div>
      </div>
    </div>
  );
};

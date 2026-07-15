import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft,
  LibraryBig,
  Sparkles,
  Users,
  GraduationCap,
  CheckCircle2,
  XCircle,
  Clock,
  BookMarked,
  Calendar,
  Activity,
  AlertCircle,
  Mail,
  TrendingUp,
  Shield,
  Eye,
} from "lucide-react";
import { Sidebar } from "@/components/ui/Sidebar";
import { tones, toneStyles, statusLabel } from "../constants";
import type { ClassItem, PendingGraduation } from "../types";
import BackgroundAmbience from "../components/shared/BackgroundAmbience";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import {
  useGetPendingGraduations,
  useApproveGraduation,
  useRejectGraduation,
  useGetClassMember,
} from "../hooks/useClassroom";
import { useAuthStore } from "@/features/auth/stores/auth.store";

interface QuranClassroomDetailViewProps {
  classroom: ClassItem;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
}

// Helper: parse "surah:1:1-7" → "Surah 1 : 1–7"
function parseContentRef(ref: string): string {
  const parts = ref.split(":");
  if (parts.length >= 3) {
    return `Surah ${parts[1]} : ${parts[2]}`;
  }
  return ref;
}

// Helper: get initials
function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

type GraduationAction = {
  item: PendingGraduation;
  action: "approve" | "reject";
} | null;

// ─────────────────────────────────────────────
export const QuranClassroomDetailView = ({
  classroom,
  isSidebarOpen,
  setIsSidebarOpen,
}: QuranClassroomDetailViewProps) => {
  const navigate = useNavigate();
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [actionMessageType, setActionMessageType] = useState<
    "success" | "error"
  >("success");
  const [pendingAction, setPendingAction] = useState<GraduationAction>(null);
  const [activeTab, setActiveTab] = useState<"graduation" | "students">(
    "graduation",
  );

  const userRole = useAuthStore((state) => state.user?.role);
  const isTeacher = userRole === "teacher";

  const theme = toneStyles[tones[classroom.id.charCodeAt(0) % tones.length]];

  // Data hooks
  const {
    data: pendingGraduations,
    isLoading: isLoadingGraduations,
    error: graduationError,
    refetch: refetchGraduations,
  } = useGetPendingGraduations(isTeacher ? classroom.id : "");

  const { data: members, isLoading: isLoadingMembers } = useGetClassMember(
    classroom.id,
  );

  const { mutateAsync: approve, isPending: isApproving } =
    useApproveGraduation();
  const { mutateAsync: reject, isPending: isRejecting } = useRejectGraduation();

  const pendingCount = pendingGraduations?.length ?? 0;

  // Build a set of student IDs that have pending graduations for quick lookup
  const pendingStudentIds = useMemo(
    () => new Set(pendingGraduations?.map((g) => g.student_id) ?? []),
    [pendingGraduations],
  );

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
      setTimeout(() => setActionMessage(null), 6000);
    }
  };

  return (
    <div className="min-h-screen bg-[#06080C] text-slate-200 font-sans antialiased selection:bg-indigo-500/40 pb-16">
      <BackgroundAmbience />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Top Nav */}
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
        {/* ── HERO BANNER ── */}
        <div className="relative rounded-2xl overflow-hidden border border-white/[0.08] bg-[#0B0F19] min-h-[160px] flex items-center shadow-2xl">
          <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:32px_32px]" />
          <div
            className={`absolute -right-12 -top-12 h-64 w-64 rounded-full bg-gradient-to-br ${theme.softBg} blur-[90px] opacity-25`}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/70 to-transparent z-10" />

          <div className="relative z-20 w-full p-6 md:p-10 flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border backdrop-blur-md ${theme.border} ${theme.softBg} ${theme.text}`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
                  {classroom.is_active ? statusLabel.active : statusLabel.draft}
                </span>
                {isTeacher && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border border-indigo-500/20 bg-indigo-500/10 text-indigo-400">
                    <Shield className="h-2.5 w-2.5" />
                    Mode Pengajar
                  </span>
                )}
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                {classroom.name}
              </h1>
              <p className="text-sm text-slate-400 leading-relaxed max-w-2xl">
                {classroom.description ||
                  "Dashboard pemantauan santri dan persetujuan kelulusan hafalan Al-Qur'an."}
              </p>
            </div>

            {/* Stat chips */}
            <div className="flex flex-wrap gap-3 shrink-0">
              <div className="flex flex-col items-center px-5 py-3 rounded-xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-md min-w-[80px]">
                <p className="text-2xl font-black text-white">
                  {classroom.student_count}
                </p>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mt-0.5">
                  Santri
                </p>
              </div>
              <div className="flex flex-col items-center px-5 py-3 rounded-xl border border-amber-500/20 bg-amber-500/10 backdrop-blur-md min-w-[80px]">
                <p className="text-2xl font-black text-amber-400">
                  {isLoadingGraduations ? "–" : pendingCount}
                </p>
                <p className="text-[10px] text-amber-400/70 uppercase tracking-widest font-semibold mt-0.5">
                  Pending
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── ACTION MESSAGE ── */}
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

        {/* ── MAIN GRID ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT: Info panel */}
          <div className="lg:col-span-3 space-y-4">
            {/* Teacher info */}
            <div className="p-5 rounded-xl border border-white/[0.06] bg-[#0E131F]/50 backdrop-blur-xl space-y-4 shadow-md">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                Pengajar Kelas
              </p>
              <div className="flex items-center gap-3">
                <div
                  className={`h-10 w-10 flex items-center justify-center rounded-xl border ${theme.border} ${theme.iconBg} text-white shadow-inner shrink-0`}
                >
                  <LibraryBig className={`h-4 w-4 ${theme.text}`} />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-sm text-white truncate">
                    {classroom.owner_name}
                  </p>
                  <p className="text-xs text-indigo-400/70 font-medium mt-0.5">
                    Pengelola Kelas Quran
                  </p>
                </div>
              </div>
            </div>

            {/* Quick stats */}
            <div className="p-5 rounded-xl border border-white/[0.06] bg-[#0E131F]/50 space-y-3 shadow-md">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                Ringkasan Kelas
              </p>

              <div className="flex items-center justify-between py-2 border-b border-white/[0.05]">
                <div className="flex items-center gap-2 text-slate-400">
                  <Users className="h-3.5 w-3.5" />
                  <span className="text-xs">Total Santri</span>
                </div>
                <span className="text-sm font-bold text-white">
                  {classroom.student_count}
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-white/[0.05]">
                <div className="flex items-center gap-2 text-slate-400">
                  <GraduationCap className="h-3.5 w-3.5" />
                  <span className="text-xs">Pengajuan Pending</span>
                </div>
                <span
                  className={`text-sm font-bold ${pendingCount > 0 ? "text-amber-400" : "text-white"}`}
                >
                  {isLoadingGraduations ? "..." : pendingCount}
                </span>
              </div>

              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2 text-slate-400">
                  <Activity className="h-3.5 w-3.5" />
                  <span className="text-xs">Status Kelas</span>
                </div>
                <span
                  className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    classroom.is_active
                      ? "bg-emerald-500/15 text-emerald-400"
                      : "bg-slate-500/15 text-slate-400"
                  }`}
                >
                  {classroom.is_active ? "Aktif" : "Draft"}
                </span>
              </div>
            </div>

            {/* Pending badge */}
            {pendingCount > 0 && (
              <button
                onClick={() => setActiveTab("graduation")}
                className="w-full p-4 rounded-xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-orange-500/5 hover:from-amber-500/15 hover:to-orange-500/10 transition-all text-left group"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-7 w-7 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400">
                    <GraduationCap className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                    Perlu Ditinjau
                  </span>
                </div>
                <p className="text-xl font-black text-white">
                  {pendingCount} Pengajuan
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Kelulusan menunggu persetujuan
                </p>
              </button>
            )}
          </div>

          {/* RIGHT: Main workspace */}
          <div className="lg:col-span-9 space-y-5">
            {/* Tab Nav */}
            <div className="flex gap-2 p-1 rounded-xl bg-white/[0.04] border border-white/[0.06] w-fit">
              <button
                onClick={() => setActiveTab("graduation")}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === "graduation"
                    ? "bg-[#141927] text-white shadow-md border border-white/[0.08]"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                <GraduationCap className="h-3.5 w-3.5" />
                Persetujuan Kelulusan
                {pendingCount > 0 && (
                  <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-amber-500 text-[9px] font-black text-black">
                    {pendingCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab("students")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === "students"
                    ? "bg-[#141927] text-white shadow-md border border-white/[0.08]"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                <Eye className="h-3.5 w-3.5" />
                Monitor Santri
              </button>
            </div>

            {/* ── TAB: GRADUATION ── */}
            {activeTab === "graduation" && (
              <div className="rounded-xl border border-white/[0.08] bg-[#0A0E17]/70 backdrop-blur-2xl shadow-xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/[0.08]">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl flex items-center justify-center bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0">
                      <GraduationCap className="h-4 w-4" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-white">
                        Persetujuan Kelulusan Hafalan
                      </h2>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Tinjau dan putuskan setiap pengajuan dari santri
                      </p>
                    </div>
                  </div>
                  {pendingCount > 0 && (
                    <span className="shrink-0 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/25 text-amber-400 text-[11px] font-bold">
                      {pendingCount} menunggu
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="p-6">
                  {isLoadingGraduations ? (
                    <div className="space-y-3">
                      {[...Array(3)].map((_, i) => (
                        <div
                          key={i}
                          className="h-32 rounded-xl bg-white/[0.04] animate-pulse"
                        />
                      ))}
                    </div>
                  ) : graduationError ? (
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      Gagal memuat data kelulusan. Coba refresh halaman.
                    </div>
                  ) : pendingGraduations && pendingGraduations.length > 0 ? (
                    <div className="grid gap-3 sm:grid-cols-2">
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
                    <div className="flex flex-col items-center gap-4 py-14 text-center border border-dashed border-white/[0.08] rounded-xl">
                      <div className="h-14 w-14 rounded-2xl flex items-center justify-center bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                        <CheckCircle2 className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">
                          Semua Sudah Beres ✓
                        </p>
                        <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                          Tidak ada pengajuan kelulusan yang menunggu
                          persetujuan saat ini.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── TAB: STUDENTS MONITOR ── */}
            {activeTab === "students" && (
              <div className="rounded-xl border border-white/[0.08] bg-[#0A0E17]/70 backdrop-blur-2xl shadow-xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/[0.08]">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl flex items-center justify-center bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 shrink-0">
                      <TrendingUp className="h-4 w-4" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-white">
                        Monitor Progress Santri
                      </h2>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Pantau aktivitas dan status hafalan seluruh santri
                      </p>
                    </div>
                  </div>
                  <span className="shrink-0 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[11px] font-bold">
                    {members?.length ?? 0} santri
                  </span>
                </div>

                {/* Student list */}
                <div className="p-6">
                  {isLoadingMembers ? (
                    <div className="space-y-3">
                      {[...Array(4)].map((_, i) => (
                        <div
                          key={i}
                          className="h-16 rounded-xl bg-white/[0.04] animate-pulse"
                        />
                      ))}
                    </div>
                  ) : members && members.length > 0 ? (
                    <div className="space-y-2">
                      {members.map((member) => {
                        const hasPending = pendingStudentIds.has(
                          member.user_id,
                        );
                        const initials = getInitials(member.full_name);
                        const joinDate = new Date(
                          member.joined_at,
                        ).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        });

                        return (
                          <div
                            key={member.user_id}
                            className={`group relative flex items-center justify-between gap-4 p-4 rounded-xl border transition-all duration-200 ${
                              hasPending
                                ? "border-amber-500/25 bg-amber-500/[0.06] hover:bg-amber-500/[0.09]"
                                : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.10]"
                            }`}
                          >
                            {/* Left: avatar + info */}
                            <div className="flex items-center gap-3 min-w-0">
                              <div
                                className={`h-10 w-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 border ${
                                  hasPending
                                    ? "bg-amber-500/15 border-amber-500/25 text-amber-400"
                                    : "bg-indigo-500/10 border-indigo-500/15 text-indigo-300"
                                }`}
                              >
                                {initials}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <p className="font-semibold text-sm text-white truncate">
                                    {member.full_name}
                                  </p>
                                  {hasPending && (
                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-[9px] font-black text-amber-400 uppercase tracking-wide shrink-0">
                                      <Clock className="h-2 w-2" />
                                      Menunggu
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-3 mt-0.5">
                                  <p className="text-xs text-slate-500 truncate flex items-center gap-1">
                                    <Mail className="h-2.5 w-2.5 shrink-0" />
                                    {member.email}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Right: meta */}
                            <div className="flex items-center gap-4 shrink-0">
                              <div className="text-right hidden sm:block">
                                <p className="text-[10px] text-slate-600 uppercase tracking-wider">
                                  Bergabung
                                </p>
                                <p className="text-xs text-slate-400 font-medium mt-0.5">
                                  {joinDate}
                                </p>
                              </div>
                              {/* Progress placeholder – will be wired to API later */}
                              <div className="flex flex-col items-end gap-1">
                                <div className="flex items-center gap-1 text-[10px] text-slate-600">
                                  <Activity className="h-2.5 w-2.5" />
                                  <span>Progress</span>
                                </div>
                                <div className="w-20 h-1.5 rounded-full bg-white/10">
                                  <div className="h-full w-1/3 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 opacity-50" />
                                </div>
                                <p className="text-[9px] text-slate-600 italic">
                                  API segera tersedia
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-4 py-14 text-center border border-dashed border-white/[0.08] rounded-xl">
                      <div className="h-14 w-14 rounded-2xl flex items-center justify-center bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                        <Users className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">
                          Belum Ada Santri
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          Santri yang bergabung akan tampil di sini.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ── CONFIRM MODAL ── */}
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
              ? `Kamu akan menyetujui kelulusan ${pendingAction.item.student_name} untuk ${parseContentRef(pendingAction.item.content_ref)}. Hafalan ini akan dikunci sebagai selesai.`
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

// ─────────────────────────────────────────────
// GraduationCard sub-component
// ─────────────────────────────────────────────

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
    <div className="relative rounded-xl border border-white/[0.07] bg-[#0D1220]/70 hover:border-amber-500/25 hover:bg-[#0D1220]/90 transition-all duration-200 overflow-hidden">
      {/* accent */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-amber-500/50 via-orange-400/30 to-transparent" />

      <div className="p-4 space-y-3">
        {/* Student row */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
              <span className="text-xs font-black text-amber-400">
                {item.student_name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <p className="font-bold text-sm text-white truncate">
                {item.student_name}
              </p>
              <p className="text-[11px] text-slate-500 truncate">
                {item.student_email}
              </p>
            </div>
          </div>
          <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-[10px] font-bold text-amber-400">
            <Clock className="h-2.5 w-2.5" />
            Menunggu
          </span>
        </div>

        {/* Info chips */}
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.05]">
            <BookMarked className="h-3 w-3 text-indigo-400 shrink-0" />
            <div className="min-w-0">
              <p className="text-[10px] text-slate-500 font-semibold uppercase">
                Hafalan
              </p>
              <p className="text-xs font-bold text-white truncate">
                {parseContentRef(item.content_ref)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.05]">
            <Activity className="h-3 w-3 text-emerald-400 shrink-0" />
            <div>
              <p className="text-[10px] text-slate-500 font-semibold uppercase">
                Interval
              </p>
              <p className="text-xs font-bold text-white">
                {item.last_interval_days}d
              </p>
            </div>
          </div>
        </div>

        {/* Stability bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide">
              Stabilitas Hafalan
            </p>
            <span className="text-[10px] font-black text-emerald-400">
              {stabilityPct}%
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-700"
              style={{ width: `${stabilityPct}%` }}
            />
          </div>
        </div>

        {/* Date */}
        <div className="flex items-center gap-1 text-[10px] text-slate-600">
          <Calendar className="h-2.5 w-2.5" />
          {submittedDate}
        </div>

        {/* CTA */}
        <div className="flex gap-2">
          <button
            onClick={onReject}
            disabled={isLoading}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-xs font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <XCircle className="h-3.5 w-3.5" />
            Tolak
          </button>
          <button
            onClick={onApprove}
            disabled={isLoading}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 text-xs font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            Setujui
          </button>
        </div>
      </div>
    </div>
  );
};

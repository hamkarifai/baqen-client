import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft,
  BadgeAlert,
  BarChart3,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock3,
  Flame,
  GraduationCap,
  LibraryBig,
  Search,
  Sparkles,
  Activity,
  AlertCircle,
  Eye,
  XCircle,
  BookMarked,
  User,
  Layers3,
} from "lucide-react";
import { Sidebar } from "@/components/ui/Sidebar";
import { tones, toneStyles, statusLabel } from "../constants";
import type { ClassItem, PendingGraduation, StudentProgress } from "../types";
import BackgroundAmbience from "../components/shared/BackgroundAmbience";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import {
  useApproveGraduation,
  useGetPendingGraduations,
  useGetStudentProgress,
  useRejectGraduation,
} from "../hooks/useClassroom";
import { useAuthStore } from "@/features/auth/stores/auth.store";

interface QuranClassroomDetailViewProps {
  classroom: ClassItem;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
}

function parseContentRef(ref: string): string {
  const parts = ref.split(":");
  if (parts.length >= 3) return `Surah ${parts[1]}, Ayat ${parts[2]}`;
  return ref;
}

function getContentRefParts(ref: string) {
  const parts = ref.split(":");
  if (parts.length >= 3) {
    return {
      type: parts[0],
      surah: parts[1],
      ayat: parts[2],
    };
  }

  return {
    type: "unknown",
    surah: "-",
    ayat: ref,
  };
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
  const userRole = useAuthStore((state) => state.user?.role);
  const isTeacher = userRole === "teacher";

  const theme = toneStyles[tones[classroom.id.charCodeAt(0) % tones.length]];

  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [actionMessageType, setActionMessageType] = useState<
    "success" | "error"
  >("success");
  const [pendingAction, setPendingAction] = useState<GraduationAction>(null);
  const [isGraduationOpen, setIsGraduationOpen] = useState(true);
  const [progressFilter, setProgressFilter] = useState("");
  const [progressStatusFilter, setProgressStatusFilter] = useState<
    "all" | "graduate" | "pending" | "active" | "inactive"
  >("all");
  const [selectedStudent, setSelectedStudent] = useState<StudentProgress | null>(
    null,
  );

  const {
    data: pendingGraduations,
    isLoading: isLoadingGraduations,
    error: graduationError,
    refetch: refetchGraduations,
  } = useGetPendingGraduations(isTeacher ? classroom.id : "");

  const {
    data: studentProgress,
    isLoading: isLoadingProgress,
    error: progressError,
    refetch: refetchProgress,
  } = useGetStudentProgress(isTeacher ? classroom.id : "");

  const { mutateAsync: approve, isPending: isApproving } =
    useApproveGraduation();
  const { mutateAsync: reject, isPending: isRejecting } = useRejectGraduation();

  useEffect(() => {
    if (isTeacher) void refetchProgress();
  }, [isTeacher, refetchProgress]);

  const pendingCount = pendingGraduations?.length ?? 0;

  const progressSummary = useMemo(() => {
    const rows = studentProgress ?? [];
    const total = rows.length;
    const totalPct = rows.reduce((sum, row) => sum + row.progress_pct, 0);
    const graduate = rows.reduce((sum, row) => sum + row.graduate, 0);
    const pending = rows.reduce((sum, row) => sum + row.pending_graduate, 0);
    const inactive = rows.reduce((sum, row) => sum + row.inactive, 0);
    const active = rows.reduce(
      (sum, row) => sum + row.start + row.menghafal + row.interval + row.fsrs_active,
      0,
    );

    return {
      total,
      average: total ? Math.round(totalPct / total) : 0,
      graduate,
      pending,
      inactive,
      active,
    };
  }, [studentProgress]);

  const progressRows = useMemo(() => {
    const rows = studentProgress ?? [];
    const q = progressFilter.trim().toLowerCase();

    return rows.filter((row) => {
      const matchesQuery =
        !q ||
        row.full_name.toLowerCase().includes(q) ||
        row.email.toLowerCase().includes(q);

      const isGraduate = row.graduate > 0;
      const isPending = row.pending_graduate > 0;
      const isActive =
        row.start + row.menghafal + row.interval + row.fsrs_active > 0;
      const isInactive = row.inactive > 0;

      const matchesStatus =
        progressStatusFilter === "all" ||
        (progressStatusFilter === "graduate" && isGraduate) ||
        (progressStatusFilter === "pending" && isPending) ||
        (progressStatusFilter === "active" && isActive) ||
        (progressStatusFilter === "inactive" && isInactive);

      return matchesQuery && matchesStatus;
    });
  }, [studentProgress, progressFilter, progressStatusFilter]);

  const progressErrorMessage =
    progressError instanceof Error ? progressError.message : progressError
      ? String(progressError)
      : "";

  const statusFilterMeta = {
    all: {
      label: "Semua",
      icon: Layers3,
      className:
        "border-amber-500/30 bg-linear-to-br from-amber-500/15 via-orange-500/10 to-white/5 text-amber-200 shadow-[0_0_0_1px_rgba(245,158,11,0.08)]",
    },
    graduate: {
      label: "Graduate",
      icon: CheckCircle2,
      className:
        "border-emerald-500/30 bg-linear-to-br from-emerald-500/15 via-teal-500/10 to-white/5 text-emerald-200 shadow-[0_0_0_1px_rgba(16,185,129,0.08)]",
    },
    active: {
      label: "Aktif",
      icon: Flame,
      className:
        "border-blue-500/30 bg-linear-to-br from-blue-500/15 via-cyan-500/10 to-white/5 text-blue-200 shadow-[0_0_0_1px_rgba(59,130,246,0.08)]",
    },
    pending: {
      label: "Pending",
      icon: BadgeAlert,
      className:
        "border-amber-400/30 bg-linear-to-br from-amber-500/20 via-amber-400/10 to-white/5 text-amber-100 shadow-[0_0_0_1px_rgba(251,191,36,0.08)]",
    },
    inactive: {
      label: "Nonaktif",
      icon: User,
      className:
        "border-slate-500/30 bg-linear-to-br from-slate-500/15 via-slate-500/10 to-white/5 text-slate-200 shadow-[0_0_0_1px_rgba(100,116,139,0.08)]",
    },
  } as const;

  const handleGraduationAction = async () => {
    if (!pendingAction) return;
    const { item, action } = pendingAction;

    try {
      if (action === "approve") {
        await approve({ classId: classroom.id, itemId: item.item_id });
        setActionMessage(
          `Kelulusan ${item.student_name} untuk ${parseContentRef(item.content_ref)} berhasil disetujui.`,
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

  const selectedStudentDetail = selectedStudent
    ? {
        active:
          selectedStudent.start +
          selectedStudent.menghafal +
          selectedStudent.interval +
          selectedStudent.fsrs_active,
        items: selectedStudent.items.map((item) => ({
          ...item,
          parsed: getContentRefParts(item.content_ref),
          label: parseContentRef(item.content_ref),
        })),
      }
    : null;

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
              Laporan Teacher
            </span>
          </div>
        </div>
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-6">
        <section className="relative rounded-2xl overflow-hidden border border-white/[0.08] bg-[#0B0F19] min-h-[190px] flex items-center shadow-2xl">
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
                  Report kelas Quran
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-tight">
                {classroom.name}
              </h2>
              <p className="text-sm text-slate-300/90 leading-relaxed max-w-2xl">
                {classroom.description ||
                  "Halaman ini menampilkan laporan progress santri untuk teacher."}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 w-full md:w-auto md:min-w-[320px]">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="text-[10px] uppercase tracking-widest text-slate-500">
                  Santri
                </div>
                <div className="mt-2 text-3xl font-serif text-white">
                  {classroom.student_count}
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="text-[10px] uppercase tracking-widest text-slate-500">
                  Total item
                </div>
                <div className="mt-2 text-3xl font-serif text-white">
                  {progressSummary.total}
                </div>
              </div>
            </div>
          </div>
        </section>

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

        {progressError && (
          <ErrorMessage
            title="Gagal memuat data"
            message={progressErrorMessage}
          />
        )}

        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <aside className="lg:col-span-4 space-y-4">
            <div className="p-5 rounded-xl border border-white/[0.06] bg-[#0E131F]/40 backdrop-blur-xl space-y-4 shadow-md">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                Ringkasan Kelas
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

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <div className="text-[10px] uppercase tracking-widest text-slate-500">
                    Total santri
                  </div>
                  <div className="mt-2 text-2xl font-black text-white">
                    {classroom.student_count}
                  </div>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <div className="text-[10px] uppercase tracking-widest text-slate-500">
                    Rata-rata
                  </div>
                  <div className="mt-2 text-2xl font-black text-white">
                    {progressSummary.average}%
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-xl border border-white/[0.06] bg-[#0E131F]/40 shadow-md space-y-3">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                Distribusi Status
              </p>
              <div className="grid grid-cols-2 gap-3">
                {(Object.keys(statusFilterMeta) as Array<
                  keyof typeof statusFilterMeta
                >).map((key) => {
                  const meta = statusFilterMeta[key];
                  const isActive = progressStatusFilter === key;
                  const valueMap = {
                    all: progressSummary.total,
                    graduate: progressSummary.graduate,
                    active: progressSummary.active,
                    pending: progressSummary.pending,
                    inactive: progressSummary.inactive,
                  } as const;
                  const Icon = meta.icon;

                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setProgressStatusFilter(key)}
                      className={`group relative overflow-hidden rounded-2xl border px-3 py-3 text-left transition-all duration-300 ${
                        isActive
                          ? `${meta.className} ring-1 ring-white/10 shadow-2xl scale-[1.02]`
                          : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:border-white/20"
                      }`}
                    >
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-linear-to-br from-white/5 to-transparent" />
                      <div className="relative z-10 flex items-start justify-between gap-3">
                        <div>
                          <div className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-bold">
                            <Icon className="h-3.5 w-3.5" />
                            {meta.label}
                          </div>
                          <div className="mt-2 text-xl font-black">
                            {valueMap[key]}
                          </div>
                        </div>
                        <div
                          className={`mt-0.5 h-8 w-8 rounded-xl flex items-center justify-center border ${
                            isActive
                              ? "border-white/15 bg-black/20"
                              : "border-white/10 bg-white/5"
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {isTeacher && (
              <button
                type="button"
                onClick={() => setIsGraduationOpen((v) => !v)}
                className="w-full text-left p-5 rounded-xl border border-amber-500/20 bg-amber-500/5 shadow-md hover:bg-amber-500/10 transition"
              >
                <div className="flex items-center gap-3 mb-1">
                  <div className="h-8 w-8 rounded-lg flex items-center justify-center bg-amber-500/10 text-amber-400">
                    <BadgeAlert className="h-4 w-4" />
                  </div>
                  <p className="text-[11px] font-bold text-amber-400/80 uppercase tracking-widest">
                    Pengajuan Kelulusan
                  </p>
                </div>
                <p className="text-2xl font-black text-white tracking-tight mt-2">
                  {isLoadingGraduations ? "..." : pendingCount}
                </p>
                <p className="text-[11px] font-semibold text-slate-400 mt-1 uppercase tracking-wide">
                  Menunggu persetujuan teacher
                </p>
              </button>
            )}
          </aside>

          <div className="lg:col-span-8 space-y-6">
            <div className="p-6 rounded-xl border border-white/[0.08] bg-[#0A0E17]/60 backdrop-blur-2xl shadow-xl">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b border-white/[0.08] pb-4">
                <div>
                  <div className="flex items-center gap-2 text-amber-400 text-[11px] uppercase tracking-widest font-bold">
                    <BarChart3 className="h-3.5 w-3.5" />
                    Laporan Progress
                  </div>
                  <h3 className="mt-2 text-2xl font-serif font-bold text-white">
                    Progress santri kelas Quran
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Data diambil langsung dari endpoint progress kelas Quran.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:min-w-[340px]">
                  <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                    <div className="text-[10px] uppercase tracking-widest text-slate-500">
                      Dibaca
                    </div>
                    <div className="mt-1 text-2xl font-black text-white">
                      {progressRows.length}
                    </div>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                    <div className="text-[10px] uppercase tracking-widest text-slate-500">
                      Status filter
                    </div>
                    <div className="mt-1 text-2xl font-black text-white uppercase">
                      {progressStatusFilter}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <Search className="h-4 w-4 text-slate-500" />
                  <input
                    value={progressFilter}
                    onChange={(e) => setProgressFilter(e.target.value)}
                    placeholder="Cari santri..."
                    className="w-full sm:w-72 bg-transparent text-sm text-white placeholder:text-slate-500 outline-none"
                  />
                </div>
                <p className="text-xs text-slate-500">
                  {progressRows.length} santri tampil
                </p>
              </div>

              {isLoadingProgress ? (
                <div className="space-y-3 mt-5">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="h-20 rounded-2xl bg-white/5 animate-pulse"
                    />
                  ))}
                </div>
              ) : progressRows.length > 0 ? (
                <div className="mt-5 overflow-hidden rounded-2xl border border-white/10">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-white/10">
                      <thead className="bg-white/[0.03]">
                        <tr className="text-left text-[11px] uppercase tracking-widest text-slate-500">
                          <th className="px-4 py-3 font-semibold">Santri</th>
                          <th className="px-4 py-3 font-semibold">Progress</th>
                          <th className="px-4 py-3 font-semibold">Status</th>
                          <th className="px-4 py-3 font-semibold">Item</th>
                          <th className="px-4 py-3 font-semibold">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/10 bg-[#0E131F]">
                        {progressRows.map((student) => {
                          const active =
                            student.start +
                            student.menghafal +
                            student.interval +
                            student.fsrs_active;
                          const statusPill =
                            student.graduate > 0
                              ? "Graduate"
                              : student.pending_graduate > 0
                                ? "Pending"
                                : active > 0
                                  ? "Aktif"
                                  : "Nonaktif";
                          const statusTone =
                            student.graduate > 0
                              ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                              : student.pending_graduate > 0
                                ? "bg-amber-500/10 text-amber-300 border-amber-500/20"
                                : active > 0
                                  ? "bg-blue-500/10 text-blue-300 border-blue-500/20"
                                  : "bg-slate-500/10 text-slate-300 border-slate-500/20";

                          return (
                            <tr key={student.user_id} className="align-top">
                              <td className="px-4 py-4">
                                <div className="flex items-start gap-3">
                                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                                    <span className="text-sm font-black text-amber-400">
                                      {student.full_name.charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                  <div className="min-w-0">
                                    <p className="font-semibold text-white">
                                      {student.full_name}
                                    </p>
                                    <p className="text-xs text-slate-400 truncate">
                                      {student.email}
                                    </p>
                                    <p className="mt-1 text-[11px] uppercase tracking-widest text-slate-500">
                                      {student.total_items} item
                                    </p>
                                  </div>
                                </div>
                              </td>

                              <td className="px-4 py-4">
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="text-slate-400">
                                      {student.progress_pct}% selesai
                                    </span>
                                    <span className="font-semibold text-white">
                                      {student.progress_pct}%
                                    </span>
                                  </div>
                                  <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                                    <div
                                      className="h-full rounded-full bg-linear-to-r from-amber-500 via-orange-400 to-emerald-400"
                                      style={{
                                        width: `${student.progress_pct}%`,
                                      }}
                                    />
                                  </div>
                                </div>
                              </td>

                              <td className="px-4 py-4">
                                <div className="flex flex-wrap gap-2">
                                  <span
                                    className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold ${statusTone}`}
                                  >
                                    {statusPill}
                                  </span>
                                  <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-slate-300">
                                    Graduate {student.graduate}
                                  </span>
                                  <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-slate-300">
                                    Pending {student.pending_graduate}
                                  </span>
                                </div>
                              </td>

                              <td className="px-4 py-4 text-sm text-slate-300">
                                <div className="grid grid-cols-2 gap-2 text-[11px]">
                                  <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                                    <span className="text-slate-500">Aktif</span>
                                    <div className="mt-1 font-semibold text-white">
                                      {active}
                                    </div>
                                  </div>
                                  <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                                    <span className="text-slate-500">
                                      Nonaktif
                                    </span>
                                    <div className="mt-1 font-semibold text-white">
                                      {student.inactive}
                                    </div>
                                  </div>
                                </div>
                              </td>

                              <td className="px-4 py-4">
                                <button
                                  type="button"
                                  onClick={() => setSelectedStudent(student)}
                                  className="inline-flex items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs font-semibold text-amber-300 hover:bg-amber-500/20 transition"
                                >
                                  <Eye className="h-4 w-4" />
                                  Lihat
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="mt-5 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-8 text-center text-sm text-slate-400">
                  Tidak ada santri yang cocok dengan filter.
                </div>
              )}
            </div>

            {isTeacher && (
              <div className="rounded-xl border border-white/[0.08] bg-[#0A0E17]/60 backdrop-blur-2xl shadow-xl overflow-hidden">
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
        </section>
      </main>

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

      {selectedStudent && selectedStudentDetail && (
        <div className="fixed inset-0 z-[120] overflow-y-auto bg-black/80 backdrop-blur-sm p-3 sm:p-4">
          <div className="mx-auto my-6 max-w-6xl overflow-hidden rounded-[28px] border border-white/10 bg-[#0A0E17] shadow-2xl">
            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-white/10 bg-[#0A0E17]/95 px-5 py-4 backdrop-blur-md sm:px-6">
              <div className="min-w-0">
                <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-amber-400">
                  <BookOpen className="h-3.5 w-3.5" />
                  Detail Santri
                </div>
                <h3 className="mt-3 text-2xl sm:text-3xl font-serif font-bold text-white">
                  {selectedStudent.full_name}
                </h3>
                <p className="mt-1 text-sm text-slate-400">
                  {selectedStudent.email}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedStudent(null)}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300 hover:bg-white/10 transition"
              >
                Tutup
              </button>
            </div>

            <div className="max-h-[calc(100vh-140px)] overflow-y-auto p-5 sm:p-6">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-[11px] uppercase tracking-widest text-slate-500">
                    Total item
                  </div>
                  <div className="mt-2 text-3xl font-serif text-white">
                    {selectedStudent.total_items}
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-[11px] uppercase tracking-widest text-slate-500">
                    Progress
                  </div>
                  <div className="mt-2 text-3xl font-serif text-white">
                    {selectedStudent.progress_pct}%
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-[11px] uppercase tracking-widest text-slate-500">
                    Graduate
                  </div>
                  <div className="mt-2 text-3xl font-serif text-white">
                    {selectedStudent.graduate}
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-[11px] uppercase tracking-widest text-slate-500">
                    Pending
                  </div>
                  <div className="mt-2 text-3xl font-serif text-white">
                    {selectedStudent.pending_graduate}
                  </div>
                </div>
              </div>

              <div className="mt-5 rounded-3xl border border-white/10 bg-white/5 p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-white">
                      Breakdown status
                    </p>
                    <p className="text-xs text-slate-400">
                      Start, menghafal, interval, FSRS, pending, graduate, inactive.
                    </p>
                  </div>
                  <div className="text-xs text-slate-500">
                    Aktif{" "}
                    {selectedStudentDetail.active} | Nonaktif{" "}
                    {selectedStudent.inactive}
                  </div>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {[
                    ["start", selectedStudent.start],
                    ["menghafal", selectedStudent.menghafal],
                    ["interval", selectedStudent.interval],
                    ["fsrs_active", selectedStudent.fsrs_active],
                    ["pending_graduate", selectedStudent.pending_graduate],
                    ["graduate", selectedStudent.graduate],
                    ["inactive", selectedStudent.inactive],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="rounded-2xl border border-white/10 bg-[#0E131F] p-4"
                    >
                      <div className="text-[10px] uppercase tracking-widest text-slate-500">
                        {String(label).replace("_", " ")}
                      </div>
                      <div className="mt-2 text-2xl font-black text-white">
                        {value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-5 rounded-3xl border border-white/10 bg-white/5 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white">
                      Item detail
                    </p>
                    <p className="text-xs text-slate-400">
                      Daftar surah/ayat yang dipantau.
                    </p>
                  </div>
                  <span className="text-xs text-slate-500">
                    {selectedStudentDetail.items.length} item
                  </span>
                </div>

                <div className="mt-4 space-y-3">
                  {selectedStudentDetail.items.map((item) => (
                    <div
                      key={item.item_id}
                      className="rounded-2xl border border-white/10 bg-[#0E131F] p-4"
                    >
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-white">
                            {item.label}
                          </p>
                          <p className="mt-1 text-xs text-slate-400">
                            Item ID: {item.item_id}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] uppercase tracking-widest text-slate-300">
                            {item.status}
                          </span>
                          <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] uppercase tracking-widest text-slate-300">
                            Surah {item.parsed.surah}
                          </span>
                          <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] uppercase tracking-widest text-slate-300">
                            Ayat {item.parsed.ayat}
                          </span>
                        </div>
                      </div>
                      <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3 text-xs text-slate-400">
                        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                          <div className="uppercase tracking-widest text-[10px] text-slate-500">
                            Content Ref
                          </div>
                          <div className="mt-1 text-white">
                            {item.content_ref}
                          </div>
                        </div>
                        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                          <div className="uppercase tracking-widest text-[10px] text-slate-500">
                            Type
                          </div>
                          <div className="mt-1 text-white">
                            {item.parsed.type}
                          </div>
                        </div>
                        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                          <div className="uppercase tracking-widest text-[10px] text-slate-500">
                            Dibuat
                          </div>
                          <div className="mt-1 text-white">
                            {new Date(item.created_at).toLocaleString("id-ID")}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

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
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-amber-500/40 via-orange-500/30 to-transparent" />

      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
              <span className="text-sm font-black text-amber-400">
                {item.student_name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <p className="font-bold text-sm text-white truncate">
                {item.student_name}
              </p>
              <p className="text-xs text-slate-500 truncate">
                {item.student_email}
              </p>
            </div>
          </div>

          <span className="shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-[10px] font-bold text-amber-400 uppercase tracking-wider">
            <Clock3 className="h-2.5 w-2.5" />
            Menunggu
          </span>
        </div>

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

        <div className="flex items-center gap-1.5 text-[10px] text-slate-600">
          <Calendar className="h-3 w-3" />
          Diajukan: {submittedDate}
        </div>

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

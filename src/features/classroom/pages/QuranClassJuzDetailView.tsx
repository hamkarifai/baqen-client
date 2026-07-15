import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import {
  ArrowLeft,
  BookOpen,
  Plus,
  Activity,
  Users,
  Clock3,
  Flame,
  CircleCheckBig,
  BadgeAlert,
  Search,
} from "lucide-react";

// Hooks
import { useGetMyItems } from "@/features/alquran/hooks/useGetMyItems";
import { useItemsByStatus } from "@/features/alquran/hooks/useItemsByStatus";
import {
  useGetStudentProgress,
  useMyClassesTeacher,
  useMyJoinedClass,
} from "../hooks/useClassroom";

// Components
import { HafalanCard } from "@/components/ui/HafalanCard";
import { HafalanKosong } from "@/components/ui/HafalanKosong";
import { AddHafalanModal } from "@/features/alquran/components/AddHafalanModal";
import {
  ItemDetailView,
  type ActionPhase,
} from "@/features/alquran/components/ItemDetailView";
import BackgroundAmbience from "../components/shared/BackgroundAmbience";

// Types
import type { MyItemDetail } from "@/features/alquran/types/quran.types";

type ViewMode = "list" | "item-detail";

export const QuranClassJuzDetailView = () => {
  const navigate = useNavigate();
  const { classroomId, juzId } = useParams<{
    classroomId: string;
    juzId: string;
  }>();
  const [searchParams] = useSearchParams();
  const juzIndexStr = searchParams.get("juzIndex");
  const juzIndex = juzIndexStr ? parseInt(juzIndexStr, 10) : 1;

  const [view, setView] = useState<ViewMode>("list");
  const [activeItem, setActiveItem] = useState<MyItemDetail | null>(null);
  const [itemPhases, setItemPhases] = useState<Record<string, ActionPhase>>({});
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [studentFilter, setStudentFilter] = useState("");

  // Fetch classroom metadata
  const { data: teacherClasses } = useMyClassesTeacher();
  const { data: studentClasses } = useMyJoinedClass();
  const allClasses = useMemo(
    () => [...(teacherClasses || []), ...(studentClasses || [])],
    [teacherClasses, studentClasses],
  );
  const classroom = useMemo(
    () => allClasses.find((c) => c.id === classroomId),
    [allClasses, classroomId],
  );

  // Fetch Items
  const { data, loading, error, getMyItems } = useGetMyItems();
  const { data: fsrsData, refetch: refetchFsrs } = useItemsByStatus({
    status: "fsrs_active",
  });
  const { data: intervalData, refetch: refetchInterval } = useItemsByStatus({
    status: "interval",
  });
  const {
    data: studentProgress,
    isLoading: progressLoading,
    isError: progressIsError,
    error: progressError,
    refetch: refetchProgress,
  } = useGetStudentProgress(classroomId || "");

  const fetchClassJuzItems = () => {
    if (classroomId) {
      getMyItems("quran", classroomId);
      refetchFsrs();
      refetchInterval();
      refetchProgress();
    }
  };

  useEffect(() => {
    fetchClassJuzItems();
  }, [classroomId]);

  const nextReviewMap = useMemo(() => {
    const map: Record<string, string | undefined> = {};
    for (const d of [fsrsData, intervalData]) {
      if (!d?.data) continue;
      for (const item of d.data) {
        if (item.interval_next_review_at) {
          map[item.item_id] = item.interval_next_review_at;
        } else {
          map[item.item_id] = item.next_review_at;
        }
      }
    }
    return map;
  }, [fsrsData, intervalData]);

  const juzData = useMemo(() => {
    if (!data?.data?.groups || !juzId) return null;
    const group = data.data.groups.find((g) => g.juz_id === juzId);
    if (!group) return null;

    return {
      ...group,
      items: group.items.map((item) => ({
        ...item,
        next_review_at: nextReviewMap[item.item_id] ?? item.next_review_at,
      })),
    };
  }, [data, juzId, nextReviewMap]);

  const handleSaveHafalan = () => {
    fetchClassJuzItems();
  };

  const backToClassroom = () => {
    navigate(`/dashboard/kelas/${classroomId}`);
  };

  const handleItemClick = (item: MyItemDetail) => {
    setActiveItem(item);
    setView("item-detail");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBackToList = () => {
    setView("list");
    setActiveItem(null);
    fetchClassJuzItems();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePhaseChange = (
    itemId: string | undefined,
    phase: ActionPhase,
  ) => {
    if (!itemId) return;
    setItemPhases((prev) => ({ ...prev, [itemId]: phase }));
  };

  const progressRows = useMemo(() => {
    const rows = studentProgress ?? [];
    const query = studentFilter.trim().toLowerCase();
    if (!query) return rows;
    return rows.filter(
      (row) =>
        row.full_name.toLowerCase().includes(query) ||
        row.email.toLowerCase().includes(query),
    );
  }, [studentProgress, studentFilter]);

  const progressSummary = useMemo(() => {
    const rows = studentProgress ?? [];
    const totalStudents = rows.length;
    const totalProgress = rows.reduce((sum, row) => sum + row.progress_pct, 0);
    const totalGraduate = rows.reduce((sum, row) => sum + row.graduate, 0);
    const totalActive = rows.reduce(
      (sum, row) => sum + row.start + row.menghafal + row.interval + row.fsrs_active,
      0,
    );
    const totalPending = rows.reduce((sum, row) => sum + row.pending_graduate, 0);

    return {
      totalStudents,
      avgProgress: totalStudents ? Math.round(totalProgress / totalStudents) : 0,
      totalGraduate,
      totalActive,
      totalPending,
    };
  }, [studentProgress]);

  return (
    <div className="min-h-screen bg-[#06080C] text-slate-200 font-sans antialiased selection:bg-amber-500/40 pb-12">
      <BackgroundAmbience />

      <div className="sticky z-40 bg-[#06080C]/80 backdrop-blur-md border-b border-white/[0.06] px-4 sm:px-6 lg:px-10 py-4">
        <div className="max-w-7xl mx-auto gap-4 mb-4 mt-4 px-6">
          <div className="flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={
                view === "item-detail" ? handleBackToList : backToClassroom
              }
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-200 transition hover:border-amber-500/40 hover:bg-amber-500/10"
            >
              <ArrowLeft className="h-4 w-4" />
              {view === "item-detail"
                ? "Kembali ke Daftar Hafalan"
                : "Kembali ke Kelas"}
            </button>
            {classroom && (
              <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-amber-400">
                {classroom.name}
              </span>
            )}
          </div>
        </div>
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-6 animate-fadeIn">
        {view === "item-detail" && activeItem ? (
          <div className="max-w-3xl mx-auto mt-4">
            <ItemDetailView
              key={activeItem.item_id}
              item={activeItem}
              juzIndex={juzIndex}
              backToJuzDetail={handleBackToList}
              currentPhase={itemPhases[activeItem.item_id]}
              onPhaseChange={(phase) =>
                handlePhaseChange(activeItem.item_id, phase)
              }
              onRedirect={() => navigate(`/dashboard/kelas/${classroomId}`)}
            />
          </div>
        ) : (
          <>
            {/* Premium Header */}
            <div className="relative mb-8 md:mb-12 p-6 md:p-10 rounded-[2.5rem] md:rounded-[3rem] bg-linear-to-br from-amber-500/20 via-purple-500/10 to-transparent border border-white/10 overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 p-12 opacity-[0.03] transform translate-x-1/3 -translate-y-1/3 pointer-events-none">
                <BookOpen className="w-64 h-64 md:w-96 md:h-96 text-white" />
              </div>

              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-8 text-center md:text-left">
                <div className="flex flex-col items-center md:items-start w-full">
                  <div className="flex items-center gap-3 mb-2 justify-center md:justify-start">
                    <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider">
                      Juz {juzIndex}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-400 text-xs font-medium">
                      Hafalan Kelas
                    </span>
                  </div>
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-white mb-2 tracking-tight">
                    Hafalan{" "}
                    <span className="text-transparent bg-clip-text bg-linear-to-r from-amber-400 to-orange-400">
                      Juz {juzIndex}
                    </span>
                  </h1>
                  <p className="text-gray-400 text-base md:text-lg flex items-center justify-center md:justify-start gap-2">
                    <Activity className="w-4 h-4 text-green-500" />
                    {juzData?.item_count || 0} Item sedang dipelajari
                  </p>
                </div>

                <div className="flex justify-center md:justify-end w-full md:w-auto">
                  <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="w-full sm:w-auto shrink-0 px-6 py-4 bg-linear-to-r from-amber-500 to-orange-600 rounded-2xl text-black font-bold shadow-lg shadow-amber-900/20 hover:shadow-amber-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 group"
                  >
                    <div className="p-1 bg-black/20 rounded-full group-hover:rotate-90 transition-transform duration-300">
                      <Plus className="w-5 h-5 text-black" />
                    </div>
                    <span>Tambah Hafalan</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Progress Overview */}
            <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] backdrop-blur-md p-5 md:p-6 shadow-xl">
              <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-5">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-400">
                    <Users className="h-3.5 w-3.5" />
                    Progress Siswa
                  </div>
                  <h2 className="mt-3 text-2xl md:text-3xl font-serif font-bold text-white">
                    Ringkasan progress hafalan kelas
                  </h2>
                  <p className="mt-1 text-sm text-gray-400">
                    Data ini membantu teacher melihat siapa yang aktif, siapa
                    yang sudah graduate, dan siapa yang masih tertahan.
                  </p>
                </div>
                <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                  <Search className="h-4 w-4 text-gray-500" />
                  <input
                    type="text"
                    value={studentFilter}
                    onChange={(e) => setStudentFilter(e.target.value)}
                    placeholder="Cari siswa..."
                    className="w-52 sm:w-64 bg-transparent text-sm text-white placeholder:text-gray-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="flex items-center justify-between text-gray-400 text-xs uppercase tracking-widest">
                    <span>Total Siswa</span>
                    <Users className="h-4 w-4 text-amber-400" />
                  </div>
                  <div className="mt-3 text-3xl font-serif text-white">
                    {progressSummary.totalStudents}
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="flex items-center justify-between text-gray-400 text-xs uppercase tracking-widest">
                    <span>Rata-rata Progress</span>
                    <Activity className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div className="mt-3 text-3xl font-serif text-white">
                    {progressSummary.avgProgress}%
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="flex items-center justify-between text-gray-400 text-xs uppercase tracking-widest">
                    <span>Sudah Graduate</span>
                    <CircleCheckBig className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div className="mt-3 text-3xl font-serif text-white">
                    {progressSummary.totalGraduate}
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="flex items-center justify-between text-gray-400 text-xs uppercase tracking-widest">
                    <span>Sedang Aktif</span>
                    <Flame className="h-4 w-4 text-blue-400" />
                  </div>
                  <div className="mt-3 text-3xl font-serif text-white">
                    {progressSummary.totalActive}
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="flex items-center justify-between text-gray-400 text-xs uppercase tracking-widest">
                    <span>Perlu Perhatian</span>
                    <BadgeAlert className="h-4 w-4 text-rose-400" />
                  </div>
                  <div className="mt-3 text-3xl font-serif text-white">
                    {progressSummary.totalPending}
                  </div>
                </div>
              </div>

              <div className="mt-6 grid gap-4">
                {progressLoading ? (
                  [...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="h-28 rounded-3xl bg-white/5 animate-pulse"
                    />
                  ))
                ) : progressIsError ? (
                  <div className="rounded-3xl border border-rose-500/20 bg-rose-500/10 p-6 text-center text-rose-300">
                    Gagal memuat progress siswa:{" "}
                    {progressError instanceof Error
                      ? progressError.message
                      : "Terjadi kesalahan"}
                  </div>
                ) : progressRows.length > 0 ? (
                  progressRows.map((student) => {
                    const statusLabels = [
                      {
                        key: "start",
                        label: "Start",
                        value: student.start,
                        tone: "bg-slate-500/20 text-slate-300",
                      },
                      {
                        key: "menghafal",
                        label: "Menghafal",
                        value: student.menghafal,
                        tone: "bg-amber-500/20 text-amber-300",
                      },
                      {
                        key: "interval",
                        label: "Interval",
                        value: student.interval,
                        tone: "bg-blue-500/20 text-blue-300",
                      },
                      {
                        key: "fsrs_active",
                        label: "FSRS",
                        value: student.fsrs_active,
                        tone: "bg-violet-500/20 text-violet-300",
                      },
                      {
                        key: "pending_graduate",
                        label: "Pending",
                        value: student.pending_graduate,
                        tone: "bg-rose-500/20 text-rose-300",
                      },
                      {
                        key: "graduate",
                        label: "Graduate",
                        value: student.graduate,
                        tone: "bg-emerald-500/20 text-emerald-300",
                      },
                      {
                        key: "inactive",
                        label: "Inactive",
                        value: student.inactive,
                        tone: "bg-gray-500/20 text-gray-300",
                      },
                    ];

                    return (
                      <article
                        key={student.user_id}
                        className="rounded-[1.75rem] border border-white/10 bg-black/20 p-5 md:p-6"
                      >
                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-lg md:text-xl font-semibold text-white">
                                {student.full_name}
                              </h3>
                              <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-gray-300">
                                {student.email}
                              </span>
                            </div>
                            <div className="mt-3 flex items-center gap-2 text-sm text-gray-400">
                              <Clock3 className="h-4 w-4" />
                              {student.total_items} item dipantau
                            </div>
                          </div>

                          <div className="min-w-[160px] rounded-2xl border border-white/10 bg-white/5 p-4">
                            <div className="flex items-center justify-between text-xs uppercase tracking-widest text-gray-500">
                              <span>Progress</span>
                              <Flame className="h-4 w-4 text-amber-400" />
                            </div>
                            <div className="mt-2 text-3xl font-serif text-white">
                              {student.progress_pct}%
                            </div>
                            <div className="mt-3 h-2.5 rounded-full bg-white/10 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-linear-to-r from-amber-500 via-orange-400 to-emerald-400"
                                style={{ width: `${student.progress_pct}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
                          {statusLabels.map((status) => (
                            <div
                              key={status.key}
                              className="rounded-2xl border border-white/10 bg-white/[0.03] p-3"
                            >
                              <div className="text-[10px] uppercase tracking-widest text-gray-500">
                                {status.label}
                              </div>
                              <div
                                className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${status.tone}`}
                              >
                                {status.value}
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                          <div className="mb-3 flex items-center justify-between">
                            <div className="text-sm font-semibold text-white">
                              Item Terpantau
                            </div>
                            <div className="text-xs text-gray-500">
                              {student.items.length} detail
                            </div>
                          </div>
                          <div className="grid gap-3">
                            {student.items.map((item) => (
                              <div
                                key={item.item_id}
                                className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 rounded-xl border border-white/10 bg-black/20 px-4 py-3"
                              >
                                <div>
                                  <div className="text-sm font-medium text-white">
                                    {item.content_ref}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    Dibuat {new Date(item.created_at).toLocaleString(
                                      "id-ID",
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] uppercase tracking-widest text-gray-300">
                                    {item.status}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {item.item_id.slice(0, 8)}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </article>
                    );
                  })
                ) : (
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center text-gray-400">
                    Tidak ada siswa yang cocok dengan filter ini.
                  </div>
                )}
              </div>
            </section>

            {/* Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="h-64 rounded-3xl bg-white/5 animate-pulse"
                  />
                ))
              ) : error ? (
                <div className="col-span-full py-20 text-center">
                  <div className="inline-block p-4 rounded-full bg-red-500/10 mb-4">
                    <Activity className="w-8 h-8 text-red-500" />
                  </div>
                  <p className="text-red-400 text-lg">
                    Gagal memuat data: {error}
                  </p>
                </div>
              ) : juzData && juzData.items.length > 0 ? (
                juzData.items.map((item) => (
                  <HafalanCard
                    key={item.item_id}
                    item={item}
                    onClick={() => handleItemClick(item)}
                  />
                ))
              ) : (
                <div className="col-span-full">
                  <HafalanKosong hafalan="Juz" />
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* Add Hafalan Modal */}
      {juzId && (
        <AddHafalanModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          juzId={juzId}
          juzNumber={juzIndex}
          existingItems={juzData?.items || []}
          onSave={handleSaveHafalan}
        />
      )}
    </div>
  );
};

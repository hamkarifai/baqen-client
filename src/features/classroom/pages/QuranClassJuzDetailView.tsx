import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { ArrowLeft, BookOpen, Plus, Activity } from "lucide-react";

// Hooks
import { useGetMyItems } from "@/features/alquran/hooks/useGetMyItems";
import { useItemsByStatus } from "@/features/alquran/hooks/useItemsByStatus";
import { useMyClassesTeacher, useMyJoinedClass } from "../hooks/useClassroom";

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

  const fetchClassJuzItems = () => {
    if (classroomId) {
      getMyItems("quran", classroomId);
      refetchFsrs();
      refetchInterval();
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

import {
  ArrowLeft,
  Plus,
  BookOpen,
  Activity,
  Power,
  CheckCircle2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useGetMyItems } from "@/features/alquran/hooks/useGetMyItems";
import { useItemsByStatus } from "@/features/alquran/hooks/useItemsByStatus";
import { useGetJuz } from "@/features/alquran/hooks/useGetJuz";
import { useJuzToggle } from "@/features/alquran/hooks/useJuzToggle";
import { useUserProgress } from "@/features/alquran/hooks/useUserProgress";
import { HafalanKosong } from "@/components/ui/HafalanKosong";
import { HafalanCard } from "@/components/ui/HafalanCard";
import { AddHafalanModal } from "./AddHafalanModal";
import { DeactivateJuzModal } from "./DeactivateJuzModal";
import type { MyItemDetail } from "@/features/alquran/types/quran.types";

interface JuzDetailViewProps {
  juzId: string;
  juzIndex: number;
  backToDashboard: () => void;
  onItemClick: (item: MyItemDetail) => void;
  classId?: string;
}

export const JuzDetailView = ({
  juzId,
  juzIndex,
  backToDashboard,
  onItemClick,
  classId,
}: JuzDetailViewProps) => {
  const { data, loading, error, getMyItems } = useGetMyItems();
  const { data: juzList } = useGetJuz();
  const { data: fsrsData, refetch: refetchFsrs } = useItemsByStatus({
    status: "fsrs_active",
    classId,
  });
  const { data: intervalData, refetch: refetchInterval } = useItemsByStatus({
    status: "interval",
    classId,
  });
  const { activateJuz, deactivateJuz, loading: toggleLoading } = useJuzToggle();
  const { completedJuz, toggleJuzCompleted } = useUserProgress();

  const isClassJuz = useMemo(() => {
    if (classId) return false;
    return juzList?.data?.some((j) => j.juz_id === juzId && j.class_id) || false;
  }, [classId, juzList, juzId]);

  useEffect(() => {
    getMyItems("quran", classId);
    refetchFsrs();
    refetchInterval();
  }, [classId]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);

  // Initialize state from localStorage
  const [isJuzActive, setIsJuzActive] = useState(() => {
    const stored = localStorage.getItem(`juz_${juzIndex}_active`);
    return stored !== null ? JSON.parse(stored) : true;
  });

  const isJuzCompleted = completedJuz.includes(juzIndex);

  // Persist state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(`juz_${juzIndex}_active`, JSON.stringify(isJuzActive));
  }, [juzIndex, isJuzActive]);

  // Build map item_id -> next_review_at dari statusData

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
    if (!data?.data?.groups) return null;
    const group = data.data.groups.find((g) => g.juz_id === juzId);
    if (!group) return null;

    const items = isClassJuz
      ? []
      : group.items.map((item) => ({
          ...item,
          next_review_at:
            nextReviewMap[item.item_id] ?? item.next_review_at ?? item.next_review,
        }));

    return {
      ...group,
      items,
      item_count: items.length,
    };
  }, [data, juzId, nextReviewMap, isClassJuz]);

  const handleSaveHafalan = () => {
    getMyItems("quran", classId);
    refetchFsrs();
    refetchInterval();
  };

  const handleActivateJuz = async () => {
    try {
      await activateJuz(juzIndex);
      setIsJuzActive(true);
      getMyItems("quran", classId);
    } catch (error) {
      console.error("Gagal mengaktifkan Juz");
    }
  };

  const handleDeactivateSuccess = async () => {
    try {
      await deactivateJuz(juzIndex);
      setIsJuzActive(false);
      getMyItems("quran", classId);
    } catch (error) {
      console.error("Gagal menonaktifkan Juz");
    }
  };

  const handleToggleCompleted = async () => {
    const success = await toggleJuzCompleted(juzIndex, !isJuzCompleted);
    // Refresh dashboard
    window.dispatchEvent(new Event("alquran:completedJuz-updated"));
  };

  return (
    <div className="animate-fadeIn pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Premium Header */}
      <div className="relative mb-8 md:mb-12 p-6 md:p-10 rounded-[2.5rem] md:rounded-[3rem] bg-linear-to-br from-amber-500/20 via-purple-500/10 to-transparent border border-white/10 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-12 opacity-[0.03] transform translate-x-1/3 -translate-y-1/3 pointer-events-none">
          <BookOpen className="w-64 h-64 md:w-96 md:h-96 text-white" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-8 text-center md:text-left">
          <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-center md:items-start">
            <button
              className="mt-0 md:mt-1 p-3 rounded-2xl cursor-pointer bg-white/5 border border-white/10 hover:bg-white/10 hover:border-amber-500/30 hover:shadow-amber-500/20 hover:scale-105 transition-all group backdrop-blur-sm shrink-0 self-start md:self-auto hidden md:block"
              onClick={backToDashboard}
            >
              <ArrowLeft className="w-6 h-6 text-gray-400 group-hover:text-amber-400 transition-colors" />
            </button>
            <div className="w-full flex items-center justify-between md:hidden mb-2">
              <button
                className="p-3 rounded-2xl cursor-pointer bg-white/5 border border-white/10 hover:bg-white/10 transition-all backdrop-blur-sm"
                onClick={backToDashboard}
              >
                <ArrowLeft className="w-5 h-5 text-gray-400" />
              </button>
              <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider">
                Juz {juzIndex}
              </span>
            </div>

            <div className="flex flex-col items-center md:items-start w-full">
              <div className="hidden md:flex items-center gap-3 mb-2">
                <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider">
                  Juz {juzIndex}
                </span>
                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-400 text-xs font-medium">
                  Al-Qur'an Tracker
                </span>
                {isJuzActive ? (
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Aktif
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full bg-gray-500/20 border border-gray-500/20 text-gray-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                    <Power className="w-3 h-3" />
                    Nonaktif
                  </span>
                )}
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
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            {/* Add Hafalan Button */}
            <button
              onClick={() => setIsAddModalOpen(true)}
              disabled={!isJuzActive}
              className="w-full sm:w-auto shrink-0 px-6 py-4 bg-linear-to-r from-amber-500 to-orange-600 rounded-2xl text-black font-bold shadow-lg shadow-amber-900/20 hover:shadow-amber-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="p-1 bg-black/20 rounded-full group-hover:rotate-90 transition-transform duration-300">
                <Plus className="w-5 h-5 text-black" />
              </div>
              <span>Tambah Hafalan</span>
            </button>

            {/* Toggle Completed Button */}
            <button
              onClick={handleToggleCompleted}
              className={`w-full sm:w-auto shrink-0 px-6 py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 group ${
                isJuzCompleted
                  ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/30 hover:border-emerald-400"
                  : "bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/20"
              }`}
            >
              <CheckCircle2
                className={`w-5 h-5 ${isJuzCompleted ? "fill-emerald-400" : ""}`}
              />
              <span>
                {isJuzCompleted ? "Sudah Selesai ✓" : "Tandai Sudah Selesai"}
              </span>
            </button>

            {/* Toggle Button */}
            {isJuzActive ? (
              <button
                onClick={() => setIsDeactivateModalOpen(true)}
                disabled={toggleLoading}
                className="w-full sm:w-auto shrink-0 px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-gray-300 font-bold hover:bg-white/10 hover:border-red-500/30 hover:text-red-400 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
              >
                <Power className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                <span>Nonaktifkan</span>
              </button>
            ) : (
              <button
                onClick={handleActivateJuz}
                disabled={toggleLoading}
                className="w-full sm:w-auto shrink-0 px-6 py-4 bg-linear-to-r from-emerald-500 to-green-600 rounded-2xl text-white font-bold shadow-lg shadow-emerald-900/20 hover:shadow-emerald-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
              >
                {toggleLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                )}
                <span>Aktifkan Juz</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-2 xl:grid-cols-3 gap-6">
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
            <p className="text-red-400 text-lg">Gagal memuat data: {error}</p>
          </div>
        ) : !isJuzActive ? (
          <div className="col-span-full">
            <HafalanKosong
              hafalan="Juz"
              title="Juz Dinonaktifkan"
              description="Aktifkan Juz ini untuk melihat dan mengelola hafalan Anda"
            />
          </div>
        ) : juzData && juzData.items.length > 0 ? (
          juzData.items.map((item) => (
            <HafalanCard
              key={item.item_id}
              item={item}
              onClick={() => onItemClick(item)}
            />
          ))
        ) : (
          <HafalanKosong hafalan="Juz" />
        )}
      </div>

      {/* Add Hafalan Modal */}
      <AddHafalanModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        juzId={juzId}
        juzNumber={juzIndex}
        existingItems={juzData?.items || []}
        onSave={handleSaveHafalan}
      />

      {/* Deactivate Juz Modal */}
      <DeactivateJuzModal
        isOpen={isDeactivateModalOpen}
        juzIndex={juzIndex}
        onClose={() => setIsDeactivateModalOpen(false)}
        onDeactivated={handleDeactivateSuccess}
      />
    </div>
  );
};

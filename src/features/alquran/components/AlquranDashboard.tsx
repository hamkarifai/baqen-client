import { ProgressBar } from "@/features/alquran/components/ProgressBar";
import { JuzCard } from "@/features/alquran/components/JuzCard";
import type {
  CardJuzData,
  LifecycleStats,
} from "@/features/alquran/types/quran.types";
import { Sidebar } from "@/components/ui/Sidebar";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useGetJuz } from "@/features/alquran/hooks/useGetJuz";
import { useUserProgress } from "@/features/alquran/hooks/useUserProgress";
import { alquranService } from "@/features/alquran/services/alquran.services";
import { DashboardHeader } from "./DashboardHeader";
import { DashboardActionButtons } from "./DashboardActionButtons";
import { DailyReviewSection } from "./DailyReviewSection";
import { QuickAccessButtons } from "./QuickAccessButtons";

interface AlquranDashboardProps {
  juzStats: (juz: string) => LifecycleStats;
  juzCounts: (juz: string) => number;
  onJuzClick: (juz: { id: string; index: number }) => void;
  onAddClick: () => void;
  refreshSignal?: number;
}

export const AlquranDashboard = ({
  onJuzClick,
  onAddClick,
  refreshSignal = 0,
}: AlquranDashboardProps) => {
  const { data, getJuz } = useGetJuz();
  const { completedJuz, fetchUserProgress } = useUserProgress();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [statusCounts, setStatusCounts] = useState({
    menghafal: 0,
    interval: 0,
    fsrs_active: 0,
    graduate: 0,
  });

  const triggerDailyGenerateIfNeeded = useCallback(async () => {
    const storageKey = "alquran:last-daily-generate-date";
    const lockKey = "alquran:daily-generate-lock";
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const today = `${yyyy}-${mm}-${dd}`;
    const lastGeneratedDate = localStorage.getItem(storageKey);

    if (lastGeneratedDate === today) {
      return;
    }

    try {
      const lockRaw = localStorage.getItem(lockKey);
      if (lockRaw) {
        const lock = JSON.parse(lockRaw) as {
          date?: string;
          expiresAt?: number;
        };
        if (
          lock.date === today &&
          typeof lock.expiresAt === "number" &&
          lock.expiresAt > Date.now()
        ) {
          return;
        }
      }
    } catch {
      localStorage.removeItem(lockKey);
    }

    try {
      localStorage.setItem(
        lockKey,
        JSON.stringify({
          date: today,
          expiresAt: Date.now() + 30_000,
        }),
      );

      await alquranService.generateDaily();
      localStorage.setItem(storageKey, today);
      localStorage.removeItem(lockKey);
      window.dispatchEvent(new Event("alquran:daily-generated"));
    } catch (error) {
      localStorage.removeItem(lockKey);
      console.error("Gagal menghasilkan target harian");
    }
  }, []);

  useEffect(() => {
    void getJuz();
  }, [getJuz]);

  useEffect(() => {
    void getJuz();
  }, [getJuz, refreshSignal]);

  // Fetch status counts from my-items API
  useEffect(() => {
    const fetchStatusCounts = async () => {
      if (!data?.data) return;
      const personalJuzIds = new Set(
        data.data.filter((j) => !j.class_id).map((j) => j.juz_id),
      );

      try {
        const response = await alquranService.getMyItems("quran");
        const counts = {
          menghafal: 0,
          interval: 0,
          fsrs_active: 0,
          graduate: 0,
        };

        response.data.groups.forEach((group) => {
          if (!personalJuzIds.has(group.juz_id)) return;
          group.items.forEach((item) => {
            if (item.status === "menghafal") counts.menghafal++;
            else if (item.status === "interval") counts.interval++;
            else if (item.status === "fsrs_active") counts.fsrs_active++;
            else if (item.status === "graduate") counts.graduate++;
          });
        });

        setStatusCounts(counts);
      } catch (error) {
        console.error("Gagal mengambil status counts");
      }
    };

    fetchStatusCounts();
  }, [data, refreshSignal]);

  // Listen for completed juz updates from JuzDetailView
  useEffect(() => {
    const handleCompletedUpdate = () => {
      void fetchUserProgress();
    };

    window.addEventListener(
      "alquran:completedJuz-updated",
      handleCompletedUpdate,
    );

    return () => {
      window.removeEventListener(
        "alquran:completedJuz-updated",
        handleCompletedUpdate,
      );
    };
  }, [fetchUserProgress]);

  useEffect(() => {
    void triggerDailyGenerateIfNeeded();

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void triggerDailyGenerateIfNeeded();
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);

    const periodicCheckId = window.setInterval(
      () => void triggerDailyGenerateIfNeeded(),
      15 * 1000,
    );

    return () => {
      window.clearInterval(periodicCheckId);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [triggerDailyGenerateIfNeeded]);

  // Calculate dynamic stats from API data
  const stats = useMemo(() => {
    if (!data?.data) {
      return {
        totalItems: 0,
        completedItems: 0,
        totalJuz: 30,
        completedJuz: 0,
        manualCompletedJuz: 0,
      };
    }

    const personalJuz = data.data.filter((juz) => !juz.class_id);

    // Total hafalan dan yang sudah selesai
    const totalItems = personalJuz.reduce((sum, juz) => sum + juz.total_items, 0);
    const completedItems = personalJuz.reduce(
      (sum, juz) => sum + juz.graduate,
      0,
    );

    // Juz yang sudah tamat 100% (dari API) + yang di-mark manual oleh user
    const completedJuzFromApi = personalJuz.filter(
      (juz) => juz.total_items > 0 && juz.graduate === juz.total_items,
    ).length;

    return {
      totalItems,
      completedItems,
      totalJuz: 30,
      completedJuz: completedJuzFromApi + completedJuz.length,
      manualCompletedJuz: completedJuz.length,
    };
  }, [data, completedJuz]);

  return (
    <>
      <div className="min-h-screen p-4 sm:p-6 lg:p-8 bg-[#0B0E14] rounded-3xl">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Overlay for mobile sidebar */}
        <div
          className={`sidebar-overlay ${isSidebarOpen ? "active" : ""}`}
          onClick={() => setIsSidebarOpen(false)}
        />

        <div className="animate-fadeIn max-w-400 mx-auto">
          <DashboardHeader onMenuClick={() => setIsSidebarOpen(true)} />

          {/* Main Stats / Progress */}
          <ProgressBar
            totalItems={stats.totalItems}
            completedItems={stats.completedItems}
            totalJuz={stats.totalJuz}
            completedJuz={stats.completedJuz}
            manualCompletedJuz={stats.manualCompletedJuz}
          />

          {/* HERO SECTION: Daily Review Target */}
          <DailyReviewSection />

          {/* Quick Access Buttons */}
          <div className="mt-12 mb-6">
            <h2 className="text-xl font-bold text-white mb-4 border-l-4 border-blue-500 pl-3">
              Akses Cepat Berdasarkan Status
            </h2>
            <QuickAccessButtons counts={statusCounts} />
          </div>

          {/* Section: Koleksi Hafalan & Actions */}
          <div className="mt-12 mb-6 border-t border-white/10 pt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1 border-l-4 border-emerald-500 pl-3">
                Koleksi Hafalan & Juz
              </h2>
              <p className="text-gray-400 text-sm pl-4">
                Pantau progress hafalan dan tambahkan target Juz baru di sini.
              </p>
            </div>
          </div>

          {/* Actions Bar (Tambah Target etc) */}
          <DashboardActionButtons onAddClick={onAddClick} />

          {/* Juz Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {data?.data.filter((juz: CardJuzData) => !juz.class_id).map((juz: CardJuzData) => (
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
                  onJuzClick({ id: juz.juz_id, index: juz.juz_index })
                }
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

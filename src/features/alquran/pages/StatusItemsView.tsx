import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import {
  ArrowLeft,
  BookOpen,
  Clock,
  ShieldCheck,
  Trophy,
  Activity,
} from "lucide-react";
import { alquranService } from "@/features/alquran/services/alquran.services";
import { useItemsByStatus } from "@/features/alquran/hooks/useItemsByStatus";
import { useGetJuz } from "@/features/alquran/hooks/useGetJuz";
import { HafalanCard } from "@/components/ui/HafalanCard";
import { HafalanKosong } from "@/components/ui/HafalanKosong";
import {
  ItemDetailView,
  type ActionPhase,
} from "@/features/alquran/components/ItemDetailView";
import type {
  MyItemsQuranResponse,
  QuranGroup,
  MyItemDetail,
} from "@/features/alquran/types/quran.types";

type ItemStatus = "menghafal" | "interval" | "fsrs_active" | "graduate";

type ViewMode = "list" | "item-detail";

const STATUS_CONFIG: Record<
  ItemStatus,
  {
    label: string;
    description: string;
    icon: React.ElementType;
    color: string;
    bgColor: string;
    borderColor: string;
    textColor: string;
    gradientFrom: string;
    gradientTo: string;
  }
> = {
  menghafal: {
    label: "Menghafal",
    description: "Item yang masih dalam tahap hafalan awal",
    icon: BookOpen,
    color: "from-amber-500 to-orange-600",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/20",
    textColor: "text-amber-400",
    gradientFrom: "from-amber-500/20",
    gradientTo: "to-orange-600/20",
  },
  interval: {
    label: "Latihan Interval",
    description: "Item dalam masa latihan pengulangan berkala",
    icon: Clock,
    color: "from-blue-500 to-indigo-600",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
    textColor: "text-blue-400",
    gradientFrom: "from-blue-500/20",
    gradientTo: "to-indigo-600/20",
  },
  fsrs_active: {
    label: "Ujian Interval",
    description: "Item dalam jadwal ujian interval berkala",
    icon: ShieldCheck,
    color: "from-emerald-500 to-teal-600",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/20",
    textColor: "text-emerald-400",
    gradientFrom: "from-emerald-500/20",
    gradientTo: "to-teal-600/20",
  },
  graduate: {
    label: "Selesai",
    description: "Item yang telah diselesaikan dengan sukses",
    icon: Trophy,
    color: "from-purple-500 to-violet-600",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/20",
    textColor: "text-purple-400",
    gradientFrom: "from-purple-500/20",
    gradientTo: "to-violet-600/20",
  },
};

export const StatusItemsView = () => {
  const navigate = useNavigate();
  const { status, juzId } = useParams<{ status: ItemStatus; juzId: string }>();
  const [searchParams] = useSearchParams();
  const juzIndex = searchParams.get("juzIndex");
  const [view, setView] = useState<ViewMode>("list");
  const [activeItem, setActiveItem] = useState<MyItemDetail | null>(null);
  const [itemPhases, setItemPhases] = useState<Record<string, ActionPhase>>({});
  const [loading, setLoading] = useState(true);
  const [juzData, setJuzData] = useState<QuranGroup | null>(null);

  const { data: juzList } = useGetJuz();
  const isClassJuz = juzList?.data?.some((j) => j.juz_id === juzId && j.class_id) || false;

  const { data: fsrsData } = useItemsByStatus({ status: "fsrs_active" });
  const { data: intervalData } = useItemsByStatus({ status: "interval" });

  useEffect(() => {
    if (!status || !juzId || isClassJuz) return;

    const fetchJuzItems = async () => {
      setLoading(true);
      try {
        const response: MyItemsQuranResponse =
          await alquranService.getMyItems("quran");

        // Find the specific Juz
        const group = response.data.groups.find((g) => g.juz_id === juzId);

        if (group) {
          // Filter items by status
          const filteredItems = group.items.filter(
            (item) => item.status === status,
          );
          setJuzData({
            ...group,
            items: filteredItems,
            item_count: filteredItems.length,
          });
        } else {
          setJuzData(null);
        }
      } catch (error) {
        console.error("Gagal mengambil items Juz");
        setJuzData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchJuzItems();
  }, [status, juzId]);

  // Build next_review_map
  const nextReviewMap = useMemo(() => {
    const map: Record<string, string | undefined> = {};
    for (const d of [fsrsData, intervalData]) {
      if (!d?.data) continue;
      for (const item of d.data) {
        map[item.item_id] = item.interval_next_review_at ?? item.next_review_at;
      }
    }
    return map;
  }, [fsrsData, intervalData]);

  // Merge next_review_at into items
  const itemsWithReview = useMemo(() => {
    if (!juzData) return [];
    return juzData.items.map((item) => ({
      ...item,
      next_review_at: nextReviewMap[item.item_id] ?? item.next_review_at,
    })) as MyItemDetail[];
  }, [juzData, nextReviewMap]);

  const config = status ? STATUS_CONFIG[status] : null;

  const handleItemClick = (item: MyItemDetail) => {
    setActiveItem(item);
    setView("item-detail");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBackToList = () => {
    setView("list");
    setActiveItem(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBackToStatusList = () => {
    navigate(`/dashboard/alquran/status/${status}`);
  };

  const handlePhaseChange = (phase: ActionPhase) => {
    if (!activeItem?.item_id) return;
    setItemPhases((prev) => ({ ...prev, [activeItem.item_id]: phase }));
  };

  if (!config) {
    return (
      <div className="min-h-screen p-6 bg-[#0B0E14] rounded-3xl flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/5 flex items-center justify-center">
            <Clock className="w-8 h-8 text-gray-500" />
          </div>
          <p className="text-gray-400">Status tidak ditemukan</p>
        </div>
      </div>
    );
  }

  const Icon = config.icon;

  // Render Item Detail View
  if (view === "item-detail" && activeItem) {
    return (
      <ItemDetailView
        key={activeItem.item_id}
        item={activeItem}
        juzIndex={juzIndex ? parseInt(juzIndex) : 1}
        backToJuzDetail={handleBackToList}
        currentPhase={itemPhases[activeItem.item_id]}
        onPhaseChange={handlePhaseChange}
      />
    );
  }

  // Render List View
  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 bg-[#0B0E14] rounded-3xl relative overflow-hidden">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className={`absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-gradient-to-br ${config.gradientFrom} ${config.gradientTo} rounded-full blur-[120px] opacity-30`}
        />
        <div
          className={`absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-gradient-to-tr ${config.gradientFrom} ${config.gradientTo} rounded-full blur-[100px] opacity-20`}
        />
      </div>

      <div className="relative z-10 animate-fadeIn max-w-7xl mx-auto">
        {/* Header */}
        <div className="relative mb-10 md:mb-12">
          <button
            onClick={handleBackToStatusList}
            className="inline-flex items-center gap-2 mb-8 text-gray-400 hover:text-white transition-all group"
          >
            <div className="p-2 rounded-xl bg-white/5 border border-white/10 group-hover:bg-white/10 group-hover:border-white/20 transition-all">
              <ArrowLeft className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium">
              Kembali ke Daftar Status
            </span>
          </button>

          {/* Hero Card */}
          <div className="relative rounded-[2.5rem] p-8 md:p-10 bg-linear-to-br from-white/[0.08] via-white/[0.02] to-transparent border border-white/10 overflow-hidden">
            <div
              className={`absolute top-0 right-0 w-80 h-80 bg-gradient-to-br ${config.gradientFrom} ${config.gradientTo} rounded-full blur-[100px] opacity-40`}
            />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6 flex-1">
                <div
                  className={`w-20 h-20 md:w-24 md:h-24 rounded-3xl ${config.bgColor} ${config.textColor} flex items-center justify-center shadow-2xl ${config.borderColor} border`}
                >
                  <Icon className="w-10 h-10 md:w-12 md:h-12" />
                </div>

                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-gray-400 text-xs font-black uppercase tracking-wider">
                      Juz {juzIndex}
                    </span>
                    <span
                      className={`px-4 py-1.5 rounded-full ${config.bgColor} ${config.borderColor} ${config.textColor} text-xs font-black uppercase tracking-wider border`}
                    >
                      {config.label}
                    </span>
                  </div>

                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-3">
                    Hafalan Juz {juzIndex}
                  </h1>

                  <div className="flex flex-wrap items-center gap-4 text-sm md:text-base">
                    <div className="flex items-center gap-2 text-gray-400">
                      <Activity className="w-4 h-4 text-green-500" />
                      <span>
                        <strong className="text-white font-bold">
                          {juzData?.item_count || 0}
                        </strong>{" "}
                        Item
                      </span>
                    </div>
                    <span className="text-gray-600">•</span>
                    <span className="text-gray-400">
                      Status:{" "}
                      <strong className={`${config.textColor}`}>
                        {config.label.toLowerCase()}
                      </strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="flex items-center gap-4 md:gap-6 pt-6 md:pt-0 md:pl-6 md:border-l md:border-white/10">
                <div className="text-center">
                  <p
                    className={`text-3xl md:text-4xl font-black ${config.textColor}`}
                  >
                    {juzData?.item_count || 0}
                  </p>
                  <p className="text-[10px] md:text-xs text-gray-500 uppercase tracking-wider font-bold mt-1">
                    Total Item
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-64 rounded-3xl bg-white/5 animate-pulse"
              />
            ))}
          </div>
        ) : !juzData || itemsWithReview.length === 0 ? (
          <HafalanKosong
            hafalan="Juz"
            title="Tidak ada item"
            description={`Tidak ada item dengan status ${config.label.toLowerCase()} di Juz ${juzIndex}`}
          />
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Daftar Hafalan</h2>
              <span className="text-sm text-gray-400">
                {itemsWithReview.length} item ditemukan
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {itemsWithReview.map((item, index) => (
                <div
                  key={item.item_id}
                  className="animate-fadeIn"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <HafalanCard
                    item={item}
                    onClick={() => handleItemClick(item)}
                  />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

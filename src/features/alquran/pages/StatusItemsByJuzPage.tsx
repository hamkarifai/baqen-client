import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import {
  ArrowLeft,
  BookOpen,
  Clock,
  ShieldCheck,
  Trophy,
  ChevronRight,
} from "lucide-react";
import { alquranService } from "@/features/alquran/services/alquran.services";
import type {
  MyItemsQuranResponse,
  QuranGroup,
} from "@/features/alquran/types/quran.types";

type ItemStatus = "menghafal" | "interval" | "fsrs_active" | "graduate";

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

export const StatusItemsByJuzPage = () => {
  const navigate = useNavigate();
  const { status } = useParams<{ status: ItemStatus }>();
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState<QuranGroup[]>([]);
  const [personalJuzIds, setPersonalJuzIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!status) return;

    const fetchItems = async () => {
      setLoading(true);
      try {
        const juzResponse = await alquranService.getJuz();
        const personalIds = new Set(
          juzResponse.data.filter((j) => !j.class_id).map((j) => j.juz_id),
        );
        setPersonalJuzIds(personalIds);

        const response: MyItemsQuranResponse =
          await alquranService.getMyItems("quran");

        // Filter groups that have items with the selected status
        const filteredGroups = response.data.groups
          .filter((group) => personalIds.has(group.juz_id))
          .map((group) => ({
            ...group,
            items: group.items.filter((item) => item.status === status),
            item_count: group.items.filter((item) => item.status === status)
              .length,
          }))
          .filter((group) => group.items.length > 0);

        setGroups(filteredGroups);
      } catch (error) {
        console.error("Gagal mengambil items Juz");
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [status]);

  const config = status ? STATUS_CONFIG[status] : null;

  const handleJuzClick = (juzIndex: number, juzId: string) => {
    navigate(
      `/dashboard/alquran/status/${status}/${juzId}?juzIndex=${juzIndex}`,
    );
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
  const totalItems = groups.reduce((sum, g) => sum + g.item_count, 0);

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

      <div className="relative z-10 animate-fadeIn max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <button
            onClick={() => navigate("/dashboard/alquran")}
            className="inline-flex items-center gap-2 mb-8 text-gray-400 hover:text-white transition-all group"
          >
            <div className="p-2 rounded-xl bg-white/5 border border-white/10 group-hover:bg-white/10 group-hover:border-white/20 transition-all">
              <ArrowLeft className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium">Kembali ke Dashboard</span>
          </button>

          {/* Hero Section */}
          <div className="relative rounded-[2.5rem] p-8 md:p-10 bg-linear-to-br from-white/8 via-white2 to-transparent border border-white/10 overflow-hidden">
            <div
              className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${config.gradientFrom} ${config.gradientTo} rounded-full blur-[80px] opacity-40`}
            />

            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
              <div
                className={`w-20 h-20 md:w-24 md:h-24 rounded-3xl ${config.bgColor} ${config.textColor} flex items-center justify-center shadow-2xl ${config.borderColor} border`}
              >
                <Icon className="w-10 h-10 md:w-12 md:h-12" />
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span
                    className={`px-4 py-1.5 rounded-full ${config.bgColor} ${config.borderColor} ${config.textColor} text-xs font-black uppercase tracking-wider border`}
                  >
                    {config.label}
                  </span>
                </div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-3">
                  {config.label}
                </h1>
                <p className="text-gray-400 text-sm md:text-base leading-relaxed max-w-2xl">
                  {config.description}
                </p>

                {/* Stats */}
                <div className="flex flex-wrap items-center gap-6 mt-6 pt-6 border-t border-white/10">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl ${config.bgColor} ${config.textColor} flex items-center justify-center`}
                    >
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-2xl font-black text-white">
                        {groups.length}
                      </p>
                      <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">
                        Juz Aktif
                      </p>
                    </div>
                  </div>
                  <div className="w-px h-10 bg-white/10" />
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl ${config.bgColor} ${config.textColor} flex items-center justify-center`}
                    >
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-2xl font-black text-white">
                        {totalItems}
                      </p>
                      <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">
                        Total Item
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-40 rounded-2xl bg-white/5 animate-pulse"
              />
            ))}
          </div>
        ) : groups.length === 0 ? (
          <div className="text-center py-24 px-6 rounded-[2.5rem] bg-white/[0.02] border border-white/10">
            <div
              className={`w-24 h-24 mx-auto mb-8 rounded-3xl ${config.bgColor} ${config.textColor} flex items-center justify-center`}
            >
              <Icon className="w-12 h-12" />
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-white mb-3">
              Belum ada item
            </h2>
            <p className="text-gray-400 text-sm md:text-base max-w-md mx-auto mb-8 leading-relaxed">
              Tidak ada item dengan status{" "}
              <span className={`${config.textColor} font-bold`}>
                {config.label.toLowerCase()}
              </span>{" "}
              di Juz manapun.
            </p>
            <button
              onClick={() => navigate("/dashboard/alquran")}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-all"
            >
              <ArrowLeft className="w-4 h-4 rotate-180" />
              Kembali ke Dashboard
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Daftar Juz</h2>
              <span className="text-sm text-gray-400">
                {groups.length} Juz ditemukan
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {groups.map((group, index) => (
                <button
                  key={group.juz_id}
                  onClick={() => handleJuzClick(group.juz_index, group.juz_id)}
                  className="group relative overflow-hidden rounded-2xl p-6 bg-[#161D26] border border-white/10 hover:border-white/20 transition-all duration-500 text-left hover:-translate-y-2 hover:shadow-2xl"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Animated gradient background */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${config.gradientFrom} ${config.gradientTo} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                  />

                  {/* Decorative corner */}
                  <div
                    className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${config.color} opacity-0 group-hover:opacity-20 rounded-bl-full transition-opacity duration-500`}
                  />

                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl font-black text-white">
                          {group.juz_index}
                        </span>
                        <div
                          className={`w-12 h-12 rounded-xl ${config.bgColor} ${config.textColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                        >
                          <BookOpen className="w-6 h-6" />
                        </div>
                      </div>
                      <ChevronRight
                        className={`w-5 h-5 text-gray-500 group-hover:text-white group-hover:translate-x-1 transition-all duration-300 ${config.textColor}`}
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full ${config.textColor.replace("text-", "bg-")}`}
                        />
                        <p className={`${config.textColor} font-bold text-sm`}>
                          {group.item_count}{" "}
                          {group.item_count === 1 ? "item" : "items"}
                        </p>
                      </div>
                      <p className="text-gray-500 text-xs leading-relaxed">
                        Klik untuk melihat detail item
                      </p>
                    </div>

                    {/* Progress bar decoration */}
                    <div className="mt-4 h-1 rounded-full bg-white/5 overflow-hidden">
                      <div
                        className={`h-full w-0 group-hover:w-full bg-gradient-to-r ${config.color} transition-all duration-700`}
                      />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

import {
  BookOpen,
  Clock,
  CheckCircle,
  Layers,
  ChevronRight,
  Calendar,
} from "lucide-react";
import type { MyItemDetail } from "@/features/alquran/types/quran.types";
import { SURAH_NAMES } from "@/features/alquran/constants/surahList";
import { convertPageRangeToSurahLabel } from "@/features/alquran/utils/pageToSurahConverter";

interface HafalanCardProps {
  item: MyItemDetail;
  onClick?: () => void;
}

export const HafalanCard = ({ item, onClick }: HafalanCardProps) => {
  let displayTitle = "";
  let displaySubtitle = "";

  const parts = item.content_ref.split(":");
  if (parts[0] === "surah") {
    let surahName = parts[1] || "Unknown";
    const surahId = parseInt(parts[1]);
    if (!isNaN(surahId) && SURAH_NAMES[surahId - 1]) {
      surahName = SURAH_NAMES[surahId - 1];
    }
    const ayatRange = parts[2] ? parts[2].replace("-", " - ") : "?";
    displayTitle = surahName;
    displaySubtitle = `Ayat ${ayatRange}`;
  } else if (parts[0] === "page" && parts[1]) {
    // Use converter for rich label
    const pageRange = `page:${parts[1]}`;
    const convertedLabel = convertPageRangeToSurahLabel(pageRange);
    // Parse: "Hal 582-604 - An-Naba 1-40"
    const [pagePart, surahPart] = convertedLabel.split(" - ");
    displayTitle = surahPart || pagePart;
    displaySubtitle = pagePart;
  } else {
    displayTitle = `Halaman ${parts[1]}`;
    displaySubtitle = "Mushaf";
  }

  const intervalLabel = () => {
    switch (item.status) {
      case "fsrs_active":
        return "Ujian Interval";
      case "interval":
        return "Latihan Interval";
      case "graduate":
        return "Selesai";
      default:
        return item.status;
    }
  };

  return (
    <div
      onClick={onClick}
      className="group relative flex flex-col p-4 md:p-7 rounded-3xl md:rounded-[2.5rem] bg-gray-900/40 border border-white/5 hover:border-amber-500/50 backdrop-blur-sm transition-all duration-500 hover:shadow-2xl hover:shadow-amber-500/10 hover:-translate-y-2 overflow-hidden cursor-pointer"
    >
      {/* Glow Effect */}
      <div className="absolute inset-0 bg-linear-to-br from-amber-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Background Decor */}
      <div className="absolute -right-8 -bottom-8 opacity-[0.02] group-hover:opacity-[0.08] transition-opacity duration-500 transform group-hover:scale-110 group-hover:-rotate-12">
        <BookOpen className="w-48 h-48 text-white" />
      </div>

      <div className="relative z-10 flex flex-col h-full">
        <div className="flex justify-between items-start mb-6">
          <div className="p-2 md:p-3.5 rounded-xl md:rounded-2xl bg-white/5 border border-white/10 group-hover:bg-amber-500/20 group-hover:border-amber-500/30 transition-all duration-300 shadow-inner group-hover:scale-110">
            <BookOpen className="w-4 md:w-6 h-4 md:h-6 text-gray-400 group-hover:text-amber-400 transition-colors" />
          </div>

          <div className="hidden md:flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border backdrop-blur-md ${
                item.status === "fsrs_active"
                  ? "bg-teal-500/10 border-teal-500/20 text-teal-400 shadow-[0_0_12px_rgba(20,184,166,0.1)]"
                  : item.status === "menghafal"
                    ? "bg-amber-500/10 border-amber-500/20 text-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.1)]"
                    : item.status === "interval"
                      ? "bg-blue-500/10 border-blue-500/20 text-blue-400 shadow-[0_0_10px_rgba(251,191,36,0.1)]"
                      : "bg-green-500/10 border-green-500/20 text-green-400 shadow-[0_0_10px_rgba(74,222,128,0.1)]"
              }`}
            >
              {intervalLabel()}
            </span>
          </div>
        </div>

        <div className="mb-4 md:mb-8">
          <h3 className="text-lg md:text-3xl font-serif text-white mb-2 group-hover:text-amber-400 transition-colors duration-300">
            {displayTitle}
          </h3>
          <div className="flex items-center gap-2 text-gray-400 group-hover:text-gray-300 transition-colors">
            <Layers className="w-3 h-3 md:w-4 md:h-4  text-amber-500/50" />
            <span className="font-medium">{displaySubtitle}</span>
          </div>
        </div>

        <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
          <div className="flex flex-col gap-3 text-xs font-medium text-gray-500">
            <div className="flex items-center gap-2 group-hover:text-gray-400 transition-colors">
              <Clock className="w-3 h-3 md:w-4 md:h-4  text-amber-500/50" />
              <span>{item.review_count}x Review</span>
            </div>
            <div className="flex items-center gap-2 group-hover:text-gray-400 transition-colors">
              <CheckCircle className="w-3 h-3 md:w-4 md:h-4  text-green-500/50" />
              <span>
                {new Date(item.created_at).toLocaleDateString("id-ID", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
            {item.next_review_at && (
              <div className="flex items-center gap-2 group-hover:text-gray-400 transition-colors">
                <Calendar className="w-3 h-3 md:w-4 md:h-4  text-blue-500/50" />
                <span> 
                  {new Date(item.next_review_at).toLocaleDateString("id-ID", {
                    month: "short",
                    day: "numeric",
                  })} 
                </span>
              </div>
            )}
          </div>

          {/* Chevron sebagai visual cue bahwa card bisa diklik */}
          <div className="opacity-0 group-hover:opacity-100 transform translate-x-1 group-hover:translate-x-0 transition-all duration-300 text-amber-400">
            <ChevronRight className="w-5 h-5" />
          </div>
        </div>
      </div>
    </div>
  );
};

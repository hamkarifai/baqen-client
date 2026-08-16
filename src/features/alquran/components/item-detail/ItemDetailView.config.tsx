import type { ReactNode } from "react";
import {
  ArrowRight,
  Clock,
  CheckCircle,
  Play,
  RotateCcw,
  Brain,
  Trophy,
} from "lucide-react";
import { SURAH_NAMES } from "@/features/alquran/constants/surahList";
import { convertPageRangeToSurahLabel } from "@/features/alquran/utils/pageToSurahConverter";

export const PHASES = [
  "menghafal",
  "terjaga",
  "graduate",
] as const;
export const PHASES_STATUS = [
  "menghafal",
  "fsrs_active",
  "graduate",
] as const;

export type ActionPhase = (typeof PHASES)[number];
export type ActionPhaseStatus = (typeof PHASES_STATUS)[number];

export interface ActionConfig {
  label: string;
  labelSecondary?: string;
  description: string;
  icon: ReactNode;
  iconSecondary?: ReactNode;
  buttonClass: string;
  buttonSecondaryClass?: string;
  sectionTitle: string;
  href?: string;
}

export interface StatusDisplay {
  title: string;
  icon: ReactNode;
  iconBg: string;
  description: string;
}

export interface ParsedContentRef {
  type: "surah" | "page";
  title: string;
  subtitle: string;
  range: string;
}

export interface StatusStyle {
  label: string;
  className: string;
}

const ACTION_CONFIG: Record<ActionPhase, ActionConfig> = {
  menghafal: {
    sectionTitle: "Konfirmasi Hafalan",
    description:
      "Sebelum memulai ujian FSRS, konfirmasi dulu bahwa kamu sudah hafal bagian ini dengan baik.",
    label: "Sudah Hafal",
    icon: <CheckCircle className="w-5 h-5" />,
    buttonClass:
      "bg-linear-to-r from-emerald-500 to-green-600 text-white shadow-emerald-900/20 hover:shadow-emerald-500/30",
  },
  terjaga: {
    sectionTitle: "Mode Ujian FSRS Aktif",
    href: "/dashboard/alquran",
    description:
      "Bagus, hafalan ini sekarang sedang di mode ujian FSRS. Sistem akan mengatur kapan kamu perlu review berikutnya berdasarkan performa terakhir.",
    label: "Ke Dashboard",
    icon: <ArrowRight className="w-5 h-5" />,
    buttonClass:
      "bg-linear-to-r from-emerald-500 to-teal-600 text-white shadow-emerald-900/20 hover:shadow-emerald-500/30",
  },
  graduate: {
    sectionTitle: "Selamat! Anda Telah Menyelesaikan Fase Ini",
    description:
      "Alhamdulillah, hafalan ini telah selesai dan mencapai tingkat kelulusan. Pertahankan konsistensi murajaah agar hafalan tetap melekat selamanya.",
    label: "Lihat Progress",
    href: "/dashboard/alquran",
    icon: <Trophy className="w-5 h-5" />,
    buttonClass:
      "bg-linear-to-r from-purple-500 to-violet-600 text-white shadow-purple-900/20 hover:shadow-purple-500/30",
  },
};

const STATUS_DISPLAY_CONFIG: Record<ActionPhaseStatus, StatusDisplay> = {
  menghafal: {
    title: "Fase Menghafal",
    icon: <Brain className="w-12 h-12 text-amber-400" />,
    iconBg: "bg-amber-500/10 border-amber-500/20 shadow-amber-500/20",
    description:
      "Item ini masih dalam tahap hafalan awal. Fokuslah untuk mengulang-ulang bacaan secara berkesinambungan hingga lancar tanpa melihat mushaf.",
  },
  fsrs_active: {
    title: "Fase Ujian FSRS",
    icon: <RotateCcw className="w-12 h-12 text-emerald-400" />,
    iconBg: "bg-emerald-500/10 border-emerald-500/20 shadow-emerald-500/20",
    description:
      "Hafalan ini sudah masuk ke jadwal ujian FSRS berkala. Lakukan review rutin tepat waktu ketika jadwalnya tiba agar hafalan tetap terjaga seumur hidup.",
  },
  graduate: {
    title: "Fase Selesai",
    icon: <Trophy className="w-12 h-12 text-purple-400" />,
    iconBg: "bg-purple-500/10 border-purple-500/20 shadow-purple-500/20",
    description:
      "Alhamdulillah! Anda telah menyelesaikan fase hafalan ini dengan sukses. Terus pertahankan dengan murajaah rutin agar hafalan tetap melekat.",
  },
};

export function getInitialPhase(status: string): ActionPhase {
  switch (status) {
    case "new":
    case "menghafal":
      return "menghafal";
    case "interval":
    case "fsrs_active":
      return "terjaga";
    case "graduate":
      return "graduate";
    default:
      return "menghafal";
  }
}

export function getActionConfig(phase: ActionPhase): ActionConfig {
  return ACTION_CONFIG[phase];
}

export function getStatusDisplay(status: string): StatusDisplay {
  if (["new", "menghafal"].includes(status)) {
    return STATUS_DISPLAY_CONFIG.menghafal;
  }

  if (
    ["maintenance", "terjaga", "graduated", "active", "fsrs_active", "interval", "consolidation", "interval_start"].includes(
      status,
    )
  ) {
    return STATUS_DISPLAY_CONFIG.fsrs_active;
  }

  return STATUS_DISPLAY_CONFIG.menghafal;
}

export function getStatusDisplayByPhase(phase: ActionPhase): StatusDisplay {
  switch (phase) {
    case "menghafal":
      return STATUS_DISPLAY_CONFIG.menghafal;
    case "terjaga":
      return STATUS_DISPLAY_CONFIG.fsrs_active;
    case "graduate":
      return STATUS_DISPLAY_CONFIG.graduate;
    default:
      return STATUS_DISPLAY_CONFIG.menghafal;
  }
}

export function parseContentRef(contentRef?: string | null): ParsedContentRef {
  if (!contentRef) {
    return {
      type: "page",
      title: "Item belum lengkap",
      subtitle: "",
      range: "?",
    };
  }

  const parts = contentRef.split(":");

  if (parts[0] === "surah") {
    const surahId = Number.parseInt(parts[1], 10);
    const surahName =
      !Number.isNaN(surahId) && SURAH_NAMES[surahId - 1]
        ? SURAH_NAMES[surahId - 1]
        : parts[1] || "Unknown";
    const [start, end] = (parts[2] || "?").split("-");

    return {
      type: "surah",
      title: surahName,
      subtitle: `Ayat ${start} – ${end}`,
      range: parts[2] || "?",
    };
  }

  // Handle page mode - use converter for rich label
  if (parts[0] === "page" && parts[1]) {
    const pageRange = `page:${parts[1]}`;
    const convertedLabel = convertPageRangeToSurahLabel(pageRange);

    // Split hanya di " - " pertama
    const dashIndex = convertedLabel.indexOf(" - ");
    const pagePart = convertedLabel.substring(0, dashIndex);
    const surahPart = convertedLabel.substring(dashIndex + 3); // ambil sisanya semua

    return {
      type: "page",
      title: surahPart || pagePart,
      subtitle: pagePart,
      range: parts[1],
    };
  }

  const [start, end] = (parts[1] || "?").split("-");
  return {
    type: "page",
    title: `Halaman ${start}`,
    subtitle: end && end !== start ? `s/d Halaman ${end}` : "Mushaf",
    range: parts[1] || "?",
  };
}

export function getStatusStyle(status: string): StatusStyle {
  switch (status) {
    case "menghafal":
      return {
        label: "Menghafal",
        className:
          "bg-green-500/10 border-green-500/20 text-green-400 shadow-[0_0_12px_rgba(74,222,128,0.1)]",
      };
    case "interval":
      return {
        label: "Latihan Interval",
        className:
          "bg-amber-500/10 border-amber-500/20 text-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.1)]",
      };
    case "fsrs_active":
      return {
        label: "Ujian FSRS",
        className:
          "bg-blue-500/10 border-blue-500/20 text-blue-400 shadow-[0_0_12px_rgba(96,165,250,0.1)]",
      };
    case "graduate":
      return {
        label: "Selesai",
        className:
          "bg-purple-500/10 border-purple-500/20 text-purple-400 shadow-[0_0_12px_rgba(192,132,252,0.1)]",
      };
    default:
      return {
        label: status,
        className: "bg-gray-500/10 border-gray-500/20 text-gray-400",
      };
  }
}

export function getStatusStyleByPhase(phase: ActionPhase): StatusStyle {
  switch (phase) {
    case "menghafal":
      return {
        label: "Menghafal",
        className:
          "bg-amber-500/10 border-amber-500/20 text-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.1)]",
      };
    case "terjaga":
      return {
        label: "Ujian FSRS",
        className:
          "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-[0_0_12px_rgba(74,222,128,0.1)]",
      };
    case "graduate":
      return {
        label: "Selesai",
        className:
          "bg-purple-500/10 border-purple-500/20 text-purple-400 shadow-[0_0_12px_rgba(192,132,252,0.1)]",
      };
    default:
      return {
        label: "Menghafal",
        className:
          "bg-amber-500/10 border-amber-500/20 text-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.1)]",
      };
  }
}

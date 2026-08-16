import { BookOpen, RotateCcw, ShieldCheck, Trophy } from "lucide-react";
import { useNavigate } from "react-router";

interface QuickAccessButtonsProps {
  counts?: {
    menghafal: number;
    interval: number;
    fsrs_active: number;
    graduate: number;
  };
}

const STATUS_BUTTONS = [
  {
    id: "menghafal" as const,
    label: "Menghafal",
    description: "Item yang masih dalam tahap hafalan",
    icon: BookOpen,
    color: "from-amber-500 to-orange-600",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/20",
    textColor: "text-amber-400",
    shadowColor: "shadow-amber-500/20",
    route: "/dashboard/alquran/status/menghafal",
  },
  {
    id: "fsrs_active" as const,
    label: "Ujian FSRS",
    description: "Item dalam jadwal ujian berkala",
    icon: ShieldCheck,
    color: "from-emerald-500 to-teal-600",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/20",
    textColor: "text-emerald-400",
    shadowColor: "shadow-emerald-500/20",
    route: "/dashboard/alquran/status/fsrs_active",
  },
  {
    id: "graduate" as const,
    label: "Selesai",
    description: "Item yang telah diselesaikan",
    icon: Trophy,
    color: "from-purple-500 to-violet-600",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/20",
    textColor: "text-purple-400",
    shadowColor: "shadow-purple-500/20",
    route: "/dashboard/alquran/status/graduate",
  },
];

export const QuickAccessButtons = ({ counts }: QuickAccessButtonsProps) => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-8">
      {STATUS_BUTTONS.map((button) => {
        const Icon = button.icon;
        const count = counts?.[button.id] ?? 0;

        return (
          <button
            key={button.id}
            onClick={() => navigate(button.route)}
            className={`relative overflow-hidden rounded-2xl md:rounded-3xl p-4 md:p-5 bg-[#161D26] border ${button.borderColor} hover:border-${button.textColor.split("-")[1]}-400/40 transition-all duration-300 group text-left hover:-translate-y-1 hover:shadow-lg ${button.shadowColor}`}
          >
            {/* Background gradient on hover */}
            <div className={`absolute inset-0 bg-linear-to-br ${button.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

            <div className="relative z-10">
              {/* Icon */}
              <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl ${button.bgColor} ${button.textColor} flex items-center justify-center mb-3 md:mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <Icon className="w-5 h-5 md:w-6 md:h-6" />
              </div>

              {/* Label */}
              <h3 className="text-white font-bold text-sm md:text-base mb-1 leading-tight">
                {button.label}
              </h3>

              {/* Count */}
              <p className={`text-2xl md:text-3xl font-black ${button.textColor} mb-1`}>
                {count}
              </p>

              {/* Description */}
              <p className="text-gray-500 text-[10px] md:text-xs leading-relaxed line-clamp-2">
                {button.description}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
};

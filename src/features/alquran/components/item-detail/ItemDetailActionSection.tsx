import { Sparkles, Edit2, Trash2 } from "lucide-react";
import type { ReactNode } from "react";
import type {
  ActionConfig,
  ActionPhase,
  StatusDisplay,
} from "@/features/alquran/components/item-detail/ItemDetailView.config";
import { PHASES } from "@/features/alquran/components/item-detail/ItemDetailView.config";

interface ItemDetailActionSectionProps {
  phase: ActionPhase;
  config: ActionConfig;
  statusDisplay: StatusDisplay;
  onPrimaryAction: () => void | Promise<void>;
  onSecondaryAction: () => void | Promise<void>;
  secondaryActionDisabled?: boolean;
  secondaryActionLabel?: string;
  secondaryActionError?: string | null;
  onEditClick?: () => void;
  onDeleteClick?: () => void;
}

interface PhaseButtonProps {
  label: string;
  icon: ReactNode;
  className: string;
  onClick?: () => void | Promise<void>;
  disabled?: boolean;
}

function PhaseButton({
  label,
  icon,
  className,
  onClick,
  disabled = false,
}: PhaseButtonProps) {
  const buttonClass = `shrink-0 w-full lg:w-auto min-w-[200px] md:min-w-[240px] flex items-center justify-center gap-3 md:gap-4 py-4 md:py-5 px-6 md:px-10 rounded-xl md:rounded-2xl font-black text-lg md:text-xl shadow-2xl cursor-pointer hover:-translate-y-1 hover:shadow-3xl active:translate-y-0 active:scale-[0.98] transition-all duration-300 relative overflow-hidden group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#161D26] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:active:scale-100 ${className}`;

  const content = (
    <>
      <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out pointer-events-none" />
      <div className="relative z-10 p-2 md:p-2.5 bg-black/20 rounded-lg md:rounded-xl group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 pointer-events-none">
        {icon}
      </div>
      <span className="relative z-10 text-center pointer-events-none">{label}</span>
    </>
  );

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={buttonClass}
    >
      {content}
    </button>
  );
}

interface ActionIconButtonProps {
  label: string;
  icon: ReactNode;
  onClick?: () => void;
  variant?: "default" | "danger";
}

function ActionIconButton({
  label,
  icon,
  onClick,
  variant = "default",
}: ActionIconButtonProps) {
  const baseStyles = "flex items-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm transition-all";
  const variantStyles = variant === "danger"
    ? "bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 hover:border-rose-500/50"
    : "bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/20";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${baseStyles} ${variantStyles}`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function PhaseProgress({ phase }: { phase: ActionPhase }) {
  const currentIndex = PHASES.indexOf(phase);

  return (
    <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 md:gap-4 mb-6 md:mb-8">
      {PHASES.map((step, index) => {
        const isActive = step === phase;
        const isPast = currentIndex > index;

        return (
          <div key={step} className="flex items-center gap-2 md:gap-4">
            <div className="relative flex items-center justify-center">
              <div
                className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-xs md:text-sm font-black transition-all duration-500 z-10 ${
                  isActive
                    ? "bg-amber-400 text-black shadow-[0_0_20px_rgba(251,191,36,0.5)] scale-110"
                    : isPast
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "bg-white/5 text-gray-500 border border-white/10"
                }`}
              >
                {index + 1}
              </div>
              {isActive && (
                <div className="absolute inset-0 rounded-full border-2 md:border-[3px] border-amber-500/30 animate-ping" />
              )}
            </div>

            {index < PHASES.length - 1 && (
              <div
                className={`h-0.5 w-4 md:w-16 rounded-full transition-colors duration-500 ${
                  isPast ? "bg-emerald-500/50" : "bg-white/10"
                }`}
              />
            )}
          </div>
        );
      })}

      <span className="hidden sm:inline-block md:ml-6 px-3 md:px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] md:text-xs text-gray-400 font-bold uppercase tracking-widest shadow-inner mt-2 sm:mt-0">
        {phase === "menghafal" && "Langkah 1 dari 5"}
        {phase === "interval_start" && "Langkah 2 dari 5"}
        {phase === "interval_end" && "Langkah 3 dari 5"}
        {phase === "terjaga" && "Langkah 4 dari 5"}
        {phase === "graduate" && "Langkah 5 dari 5"}
      </span>
    </div>
  );
}

export function ItemDetailActionSection({
  phase,
  config,
  statusDisplay,
  onPrimaryAction,
  onSecondaryAction,
  secondaryActionDisabled = false,
  secondaryActionLabel,
  secondaryActionError,
  onEditClick,
  onDeleteClick,
}: ItemDetailActionSectionProps) {
  return (
    <div className="p-1 rounded-[2.5rem] md:rounded-[3rem] bg-linear-to-b from-white/10 to-white/5 shadow-2xl mb-8 border border-white/5 mx-auto w-full">
      <div className="bg-[#0B0E14] rounded-[2.25rem] md:rounded-[2.75rem] p-5 md:p-10 space-y-6 md:space-y-10 relative overflow-hidden shadow-inner">
        <div className="absolute -top-32 -right-32 w-64 md:w-96 h-64 md:h-96 bg-amber-500/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row gap-5 md:gap-8 items-center md:items-start text-center md:text-left">
          <div
            className={`w-24 h-24 md:w-32 md:h-32 shrink-0 rounded-[1.5rem] md:rounded-[2rem] border flex items-center justify-center shadow-2xl ${statusDisplay.iconBg} backdrop-blur-md relative group`}
          >
            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-[1.5rem] md:rounded-[2rem]" />
            {statusDisplay.icon}
          </div>

          <div className="flex flex-col justify-center py-2 flex-1 w-full">
            <div className="inline-flex items-center justify-center md:justify-start gap-2 mb-3 md:mb-4">
              <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-amber-500 animate-pulse shadow-[0_0_10px_rgba(251,191,36,0.8)]" />
              <span className="text-[9px] md:text-[11px] font-black tracking-[0.2em] md:tracking-[0.25em] uppercase text-gray-400">
                Status Saat Ini
              </span>
            </div>

            <h2 className="text-2xl md:text-4xl lg:text-5xl font-black text-white mb-3 md:mb-4 tracking-tight drop-shadow-sm">
              {statusDisplay.title}
            </h2>

            <p className="text-gray-300 leading-relaxed text-sm md:text-lg max-w-2xl bg-white/3 p-4 md:p-5 rounded-xl md:rounded-2xl border border-white/5 shadow-inner">
              {statusDisplay.description}
            </p>
          </div>
        </div>

        <div className="h-px w-full bg-linear-to-r from-transparent via-white/10 to-transparent" />

        <div className="relative z-10 bg-[#161D26] rounded-[1.5rem] md:rounded-[2rem] p-5 md:p-10 border border-white/5 shadow-2xl">
          <PhaseProgress phase={phase} />

          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-center justify-between">
            <div className="flex-1 text-center lg:text-left w-full">
              <div className="inline-flex items-center justify-center lg:justify-start gap-2 mb-2 md:mb-3">
                <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-amber-500" />
                <span className="text-amber-400 text-xs md:text-sm font-bold tracking-wider uppercase">
                  Tindakan Selanjutnya
                </span>
              </div>

              <h3 className="text-2xl md:text-3xl font-black text-white mb-2 md:mb-3">
                {config.sectionTitle}
              </h3>

              <p className="text-sm md:text-lg text-gray-400 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                {config.description}
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <PhaseButton
                onClick={onPrimaryAction}
                className={config.buttonClass}
                icon={config.icon}
                label={config.label}
              />

              {phase === "interval_end" &&
                config.buttonSecondaryClass &&
                config.iconSecondary &&
                config.labelSecondary && (
                  <PhaseButton
                    onClick={onSecondaryAction}
                    className={config.buttonSecondaryClass}
                    icon={config.iconSecondary}
                    label={secondaryActionLabel ?? config.labelSecondary}
                    disabled={secondaryActionDisabled}
                  />
                )}

              {phase === "interval_end" && secondaryActionError && (
                <p className="text-sm text-red-400 text-center max-w-[240px]">
                  {secondaryActionError}
                </p>
              )}
            </div>
          </div>

          {/* Item Management Actions */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <div className="flex items-center justify-center lg:justify-start gap-2 mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Kelola Item
              </span>
            </div>
            <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
              <ActionIconButton
                label="Edit Item"
                icon={<Edit2 className="w-4 h-4" />}
                onClick={onEditClick}
              />
              <ActionIconButton
                label="Hapus"
                icon={<Trash2 className="w-4 h-4" />}
                onClick={onDeleteClick}
                variant="danger"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

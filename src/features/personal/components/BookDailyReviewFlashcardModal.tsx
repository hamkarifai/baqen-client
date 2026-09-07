import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  CalendarDays,
  Check,
  Loader2,
  RotateCw,
  X,
  BookOpen,
  Lightbulb,
  Brain,
  Image,
} from "lucide-react";
import type {
  BookDailyTask,
  ReviewIntervalResponse,
  ReviewFsrsResponse,
} from "@/features/personal/types/personal.types";
import { useReviewIntervalBook } from "@/features/personal/hooks/useReviewIntervalBook";
import { useReviewFsrsBook } from "@/features/personal/hooks/useReviewFsrsBook";
import { personalService } from "@/features/personal/services/personal.services";

interface BookDailyReviewFlashcardModalProps {
  isOpen: boolean;
  task: BookDailyTask | null;
  queuePosition?: number;
  queueTotal?: number;
  onClose: () => void;
  onReviewed: (
    result: ReviewIntervalResponse | ReviewFsrsResponse,
  ) => Promise<void> | void;
}

const REVIEW_BUTTONS = [
  {
    id: 1 as const,
    payloadValue: 1 as const,
    header: "Lemah",
    emoji: "😰",
    descriptions: ["Blank", "Banyak Lupa", "Berpikir Lama", "Banyak Salah"],
    bg: "bg-rose-950/90 border-rose-500/50 hover:bg-rose-900/90",
    headerBg: "bg-rose-600/90",
    dot: "bg-rose-400",
    textColor: "text-rose-100",
  },
  {
    id: 2 as const,
    payloadValue: 2 as const,
    header: "Sedang",
    emoji: "😐",
    descriptions: ["Sering Lupa", "Sering Salah", "Tersendat", "Lambat"],
    bg: "bg-amber-950/90 border-amber-500/50 hover:bg-amber-900/90",
    headerBg: "bg-amber-600/90",
    dot: "bg-amber-400",
    textColor: "text-amber-100",
  },
  {
    id: 3 as const,
    payloadValue: 3 as const,
    header: "Baik",
    emoji: "😊",
    descriptions: ["Lancar", "Cepat", "Yakin", "Benar"],
    bg: "bg-emerald-950/90 border-emerald-500/50 hover:bg-emerald-900/90",
    headerBg: "bg-emerald-600/90",
    dot: "bg-emerald-400",
    textColor: "text-emerald-100",
  },
  {
    id: 4 as const,
    payloadValue: 3 as const,
    header: "Sempurna",
    emoji: "🔥",
    descriptions: ["Reflek", "Tanpa Salah", "Sangat Lancar", "Sempurna"],
    bg: "bg-blue-950/90 border-blue-500/50 hover:bg-blue-900/90",
    headerBg: "bg-blue-600/90",
    dot: "bg-blue-400",
    textColor: "text-blue-100",
  },
] as const;

export const BookDailyReviewFlashcardModal = ({
  isOpen,
  task,
  queuePosition = 1,
  queueTotal = 1,
  onClose,
  onReviewed,
}: BookDailyReviewFlashcardModalProps) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [submittingButtonId, setSubmittingButtonId] = useState<1 | 2 | 3 | 4 | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [itemContent, setItemContent] = useState<string>("");
  const [itemAnswer, setItemAnswer] = useState<string>("");
  const [itemImage, setItemImage] = useState<string>("");
  const [nextReviewDate, setNextReviewDate] = useState<string>("");
  const [nextIntervalDays, setNextIntervalDays] = useState<number>(0);
  const [itemStatus, setItemStatus] = useState<string>("");

  const { reviewInterval, loading: loadingInterval } = useReviewIntervalBook();
  const { reviewFsrs, loading: loadingFsrs } = useReviewFsrsBook();

  useEffect(() => {
    if (!isOpen || !task) return;
    setIsFlipped(false);
    setSubmittingButtonId(null);
    setShowSuccessModal(false);

    const fetchItemData = async () => {
      try {
        const response = await personalService.getItemDetail(task.item_id);
        const d = response.data;
        setItemStatus(d.status || "unknown");
        setItemContent(d.question || "Pertanyaan tidak tersedia");
        setItemAnswer(d.answer || "Jawaban tidak tersedia");
        console.log("DEBUG getItemDetail raw data keys:", Object.keys(d));
        console.log("DEBUG getItemDetail image value:", d.image);
        console.log("DEBUG getItemDetail normalized:", JSON.stringify(d));
        setItemImage(d.image || "");
      } catch {
        setItemStatus("unknown");
        setItemContent("Pertanyaan tidak tersedia");
        setItemAnswer("Jawaban tidak tersedia");
        setItemImage("");
      }
    };

    void fetchItemData();
  }, [task, isOpen]);

  if (!isOpen || !task) return null;

  const currentStatus = itemStatus.toLowerCase();
  const useFsrsReview = currentStatus !== "interval";
  const loading = useFsrsReview ? loadingFsrs : loadingInterval;

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const handleRatingClick = async (btn: (typeof REVIEW_BUTTONS)[number]) => {
    if (loading || submittingButtonId !== null) return;
    setSubmittingButtonId(btn.id);

    try {
      let response: ReviewIntervalResponse | ReviewFsrsResponse;

      if (useFsrsReview) {
        response = await reviewFsrs(task.item_id, {
          rating: btn.payloadValue as 1 | 2 | 3 | 4,
        });
        const fsrsData = (response as ReviewFsrsResponse).data;
        if (fsrsData && typeof fsrsData === "object" && "next_review_at" in fsrsData) {
          setNextReviewDate(formatDate(fsrsData.next_review_at as string));
          setNextIntervalDays((fsrsData.next_interval_days as number) || 1);
        }
      } else {
        const intervalRating = Math.min(btn.payloadValue, 3) as 1 | 2 | 3;
        response = await reviewInterval(task.item_id, { rating: intervalRating });
        const intervalData = (response as ReviewIntervalResponse).data;
        if (intervalData?.interval_next_review_at) {
          setNextReviewDate(formatDate(intervalData.interval_next_review_at));
          setNextIntervalDays(intervalData.interval_days || 1);
        }
      }

      await onReviewed(response);

      window.dispatchEvent(
        new CustomEvent("books:item-reviewed", {
          detail: { itemId: task.item_id, rating: btn.payloadValue },
        }),
      );

      setShowSuccessModal(true);
    } catch {
      // error handled by hooks
    } finally {
      setSubmittingButtonId(null);
    }
  };

  const progressPct = Math.round((queuePosition / queueTotal) * 100);

  return createPortal(
    <div className="fixed inset-0 z-9999 bg-[#090A0F] flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 shrink-0">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {queueTotal > 1 && (
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden max-w-[200px]">
                <div
                  className="h-full rounded-full bg-linear-to-r from-cyan-500 to-blue-500 transition-all duration-500"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <span className="text-xs text-gray-500 font-medium shrink-0">
                {queuePosition}/{queueTotal}
              </span>
            </div>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-colors ml-3 shrink-0"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main content — 3D Flip Card Container */}
      <div className="flex-1 overflow-hidden relative" style={{ perspective: "1500px" }}>
        <div
          className="w-full h-full transition-transform duration-700 ease-in-out relative"
          style={{
            transformStyle: "preserve-3d",
            transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          {/* FRONT — Question */}
          <div
            className="absolute inset-0 w-full h-full flex flex-col bg-[#090A0F]"
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
            }}
          >
            <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(circle_at_20%_20%,rgba(20,184,166,0.4),transparent_50%)]" />

            {/* Scrollable content area */}
            <div className="flex-1 overflow-y-auto scrollbar-hide px-4 sm:px-8 md:px-16 py-8 max-w-3xl mx-auto w-full">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center">
                  <Brain className="w-5 h-5 text-cyan-400" />
                </div>
                <span className="px-3 py-1 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-400/20 text-xs font-bold tracking-wider uppercase">
                  Pertanyaan
                </span>
              </div>

              {itemImage && itemImage.trim() !== "" && (
                <div className="mb-6 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                  <img
                    src={itemImage}
                    alt={itemContent || "Gambar item"}
                    className="max-h-[320px] w-full object-contain bg-black/20"
                  />
                </div>
              )}

              <div className="p-6 sm:p-8 rounded-2xl border border-cyan-300/20 bg-cyan-400/8 mb-8">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center shrink-0 mt-0.5">
                    <Lightbulb className="w-4 h-4 text-cyan-400" />
                  </div>
                  <p className="text-2xl sm:text-3xl md:text-4xl font-black text-white leading-snug whitespace-pre-wrap wrap-break-word">
                    {itemContent}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm text-gray-500 mb-4">
                <CalendarDays className="w-4 h-4" />
                <span>{task.task_date}</span>
              </div>
            </div>

            {/* Sticky flip button */}
            <div className="px-4 sm:px-8 md:px-16 pb-6 pt-3 max-w-3xl mx-auto w-full shrink-0 border-t border-white/5 bg-[#090A0F]">
              <button
                onClick={() => setIsFlipped(true)}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 font-bold text-base hover:bg-cyan-500/25 transition-colors"
              >
                <RotateCw className="w-5 h-5" />
                Lihat Jawaban
              </button>
            </div>
          </div>

          {/* BACK — Answer + Feedback */}
          <div
            className="absolute inset-0 w-full h-full flex flex-col bg-[#090A0F]"
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(circle_at_80%_20%,rgba(16,185,129,0.4),transparent_50%)]" />
            <div className="flex-1 overflow-y-auto scrollbar-hide flex flex-col px-4 sm:px-8 md:px-16 py-8 max-w-3xl mx-auto w-full">
              {/* Answer */}
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-emerald-400" />
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-400/20 text-xs font-bold tracking-wider uppercase">
                  Jawaban
                </span>
              </div>

              {itemImage && itemImage.trim() !== "" && (
                <div className="mb-6 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                  <img
                    src={itemImage}
                    alt={itemContent || "Gambar item"}
                    className="max-h-[320px] w-full object-contain bg-black/20"
                  />
                </div>
              )}

              <div className="p-5 sm:p-6 rounded-2xl border border-emerald-300/20 bg-emerald-400/8 mb-6">
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-white leading-relaxed whitespace-pre-wrap wrap-break-word">
                  {itemAnswer}
                </p>
              </div>

              {/* Feedback section */}
              <div className="mb-4">
                <h3 className="text-lg font-black text-white mb-1">
                  Seberapa kuat hafalanmu?
                </h3>
                <p className="text-gray-500 text-sm">Pilih satu — nilai langsung tersimpan.</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                {REVIEW_BUTTONS.map((btn) => {
                  const isSubmitting = submittingButtonId === btn.id;
                  return (
                    <button
                      key={btn.id}
                      type="button"
                      onClick={() => void handleRatingClick(btn)}
                      disabled={submittingButtonId !== null}
                      className={`relative overflow-hidden rounded-2xl border-2 flex flex-col text-left transition-all duration-200 disabled:opacity-60 disabled:pointer-events-none ${btn.bg} ${btn.textColor}`}
                    >
                      <div className={`flex items-center justify-center gap-1.5 py-2.5 px-3 text-xs font-black uppercase tracking-wide border-b border-white/10 ${btn.headerBg}`}>
                        <span>{btn.emoji}</span>
                        <span>{btn.header}</span>
                      </div>
                      <div className="flex-1 p-3">
                        {isSubmitting ? (
                          <div className="flex flex-col items-center justify-center gap-2 py-3">
                            <Loader2 className="w-5 h-5 animate-spin opacity-80" />
                            <span className="text-xs opacity-80">Menyimpan...</span>
                          </div>
                        ) : (
                          <ul className="space-y-1.5">
                            {btn.descriptions.map((d) => (
                              <li key={d} className="flex items-center gap-2 text-xs font-medium">
                                <span className={`shrink-0 w-1.5 h-1.5 rounded-full ${btn.dot}`} />
                                {d}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sticky flip button */}
            <div className="px-4 sm:px-8 md:px-16 pb-6 pt-3 max-w-3xl mx-auto w-full shrink-0 border-t border-white/5 bg-[#090A0F]">
              <button
                onClick={() => setIsFlipped(false)}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-white/5 border border-white/10 text-gray-400 font-bold text-base hover:bg-white/10 hover:text-white transition-colors"
              >
                <RotateCw className="w-5 h-5" />
                Lihat Pertanyaan
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Success overlay */}
      {showSuccessModal && (
        <div className="absolute inset-0 z-10 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
          <div className="w-full max-w-sm">
            <div className="rounded-3xl border border-white/10 bg-linear-to-br from-[#1A2232] via-[#151B28] to-[#111826] shadow-[0_40px_100px_rgba(0,0,0,0.7)] p-6 md:p-8">
              <div className="flex justify-center mb-5">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500/40 flex items-center justify-center">
                  <Check className="w-8 h-8 text-emerald-400" />
                </div>
              </div>

              <h3 className="text-xl font-black text-white text-center mb-1">Review Berhasil!</h3>
              <p className="text-gray-400 text-center text-sm mb-5">Hafalanmu sudah tercatat.</p>

              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-400/30 mb-5">
                <div className="flex items-center gap-2 mb-2">
                  <CalendarDays className="w-4 h-4 text-emerald-400" />
                  <p className="text-emerald-300/70 text-xs font-bold uppercase tracking-wider">
                    Review Selanjutnya
                  </p>
                </div>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-black text-white">{nextIntervalDays}</p>
                  <span className="text-gray-400 text-sm">hari lagi</span>
                </div>
                <p className="text-emerald-200/60 text-xs mt-1">{nextReviewDate || "-"}</p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowSuccessModal(false);
                  if (queuePosition >= queueTotal) onClose();
                }}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all"
              >
                {queuePosition < queueTotal ? "Lanjut →" : "Selesai"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>,
    document.body
  );
};

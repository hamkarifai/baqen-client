import { useCallback, useEffect, useMemo, useState } from "react";
import { Play, Flame, Star, BookOpen, CheckCircle2, Clock } from "lucide-react";
import { alquranService } from "@/features/alquran/services/alquran.services";
import type { DailyTask } from "@/features/alquran/types/quran.types";
import { BookDailyReviewFlashcardModal } from "@/features/personal/components/BookDailyReviewFlashcardModal";
import { useAuthStore } from "@/features/auth/stores/auth.store";
import type { BookDailyTask } from "@/features/personal/types/personal.types";

const formatEstimate = (seconds: number): string => {
  if (seconds <= 0) return "—";
  if (seconds < 60) return `${seconds}d`;
  return `${Math.round(seconds / 60)} mnt`;
};

interface BookClassDailyReviewSectionProps {
  classId: string;
}

export const BookClassDailyReviewSection = ({
  classId,
}: BookClassDailyReviewSectionProps) => {
  const { user } = useAuthStore();
  const isTeacher = user?.role === "teacher";

  const [loading, setLoading] = useState(true);
  const [dailyTasks, setDailyTasks] = useState<BookDailyTask[]>([]);
  const [reviewedIds, setReviewedIds] = useState<Set<string>>(new Set());
  const [activeBook, setActiveBook] = useState<string | null>(null);
  const [queueIndex, setQueueIndex] = useState(0);
  const [isFlashcardOpen, setIsFlashcardOpen] = useState(false);

  const refreshDailyState = useCallback(async () => {
    try {
      const response: DailyTask[] =
        await alquranService.getClassDailyBook(classId);
      const completed = new Set(
        response
          .filter((t) => t.state === "completed" || t.state === "done")
          .map((t) => t.item_id),
      );
      setReviewedIds(completed);

      const tasks: BookDailyTask[] = response.map((t) => ({
        item_id: t.item_id,
        source: t.source,
        state: t.state,
        task_date: t.task_date,
        content_ref: t.content_ref,
        status: t.status,
        book_title: t.book_title ?? "",
        estimated_review_seconds: t.estimated_review_seconds,
        image_url: t.image_url,
      }));
      setDailyTasks(tasks);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [classId]);

  useEffect(() => {
    const init = () => {
      void refreshDailyState();
    };
    init();

    const onVisible = () => {
      if (document.visibilityState === "visible") init();
    };

    document.addEventListener("visibilitychange", onVisible);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [refreshDailyState]);

  const groups = useMemo(() => {
    const map = new Map<string, BookDailyTask[]>();
    for (const task of dailyTasks) {
      if (reviewedIds.has(task.item_id)) continue;
      const bookTitle = task.book_title ?? "Buku Tidak Diketahui";
      if (!map.has(bookTitle)) {
        map.set(bookTitle, []);
      }
      map.get(bookTitle)!.push(task);
    }
    return Array.from(map.entries()).map(([bookTitle, items]) => ({
      book_title: bookTitle,
      items,
      totalEstimatedSeconds: items.reduce(
        (s, i) => s + (i.estimated_review_seconds ?? 0),
        0,
      ),
      count: items.length,
    }));
  }, [dailyTasks, reviewedIds]);

  const totalItems = groups.reduce((sum, g) => sum + g.count, 0);

  const currentTask: BookDailyTask | null =
    activeBook && groups.find((g) => g.book_title === activeBook)
      ? (groups.find((g) => g.book_title === activeBook)!.items[queueIndex] ??
        null)
      : null;

  const openGroup = (bookTitle: string, startIndex = 0) => {
    setActiveBook(bookTitle);
    setQueueIndex(startIndex);
    setIsFlashcardOpen(true);
  };

  const handleReviewed = async () => {
    if (!currentTask) return;

    const reviewedId = currentTask.item_id;
    const nextReviewed = new Set(reviewedIds);

    if (reviewedId) {
      nextReviewed.add(reviewedId);
      setReviewedIds(nextReviewed);
    }

    // Remove reviewed item from current group
    const currentGroup = groups.find((g) => g.book_title === activeBook);
    if (currentGroup) {
      const remaining = currentGroup.items.filter(
        (item) => item.item_id !== reviewedId,
      );

      if (remaining.length > 0) {
        const nextIdx = currentGroup.items.findIndex(
          (item) => item.item_id === remaining[0].item_id,
        );
        setQueueIndex(nextIdx >= 0 ? nextIdx : queueIndex + 1);
      } else {
        // Move to next book group
        const currentGroupIndex = groups.findIndex(
          (g) => g.book_title === activeBook,
        );
        const nextGroup = groups
          .slice(currentGroupIndex + 1)
          .find((g) => g.items.length > 0);

        if (nextGroup) {
          setActiveBook(nextGroup.book_title);
          setQueueIndex(0);
        } else {
          setIsFlashcardOpen(false);
          setActiveBook(null);
        }
      }
    }

    void refreshDailyState();
  };

  const handleClose = () => {
    setIsFlashcardOpen(false);
    setActiveBook(null);
    setQueueIndex(0);
  };

  return (
    <section className="relative mb-8 animate-fadeIn">
      <div className="absolute -inset-1 blur-2xl bg-linear-to-r from-purple-500/20 via-pink-500/20 to-blue-500/20 rounded-3xl opacity-50 pointer-events-none" />
      <div className="relative bg-linear-to-br from-[#1A222C] to-[#0F141A] rounded-2xl border border-purple-500/30 overflow-hidden shadow-2xl shadow-purple-900/20">
        <div className="h-1 w-full bg-linear-to-r from-purple-400 via-pink-400 to-purple-400" />
        <div className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row gap-4 mb-8 border-b border-white/5 pb-6">
            <div className="w-16 h-16 rounded-xl bg-linear-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/30 shrink-0 transform -rotate-3">
              <Flame className="w-8 h-8 text-white animate-pulse" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold tracking-wide uppercase mb-2">
                <Star className="w-3.5 h-3.5" /> Review Harian Buku Kelas
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-2">
                Target Review Buku Hari Ini
              </h2>
              <p className="text-gray-400 text-sm md:text-base max-w-2xl">
                Ada{" "}
                <strong className="text-purple-400">{totalItems} item</strong>{" "}
                di{" "}
                <strong className="text-purple-400">
                  {groups.length} buku
                </strong>{" "}
                yang menunggu untuk direview di kelas ini.
              </p>
            </div>
          </div>

          {loading && (
            <p className="text-sm text-gray-400 animate-pulse">
              Memuat target harian...
            </p>
          )}

          {!loading && groups.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8 text-purple-400" />
              </div>
              <p className="text-white font-bold mb-1">Semua sudah direview!</p>
              <p className="text-gray-400 text-sm">
                Tidak ada review kelas tersisa hari ini.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
            {groups.map((group, index) => (
              <div
                key={group.book_title}
                className="group relative overflow-hidden rounded-xl bg-[#161D26] border border-white/10 hover:border-purple-500/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="absolute inset-0 bg-linear-to-br from-purple-500/0 to-pink-500/0 group-hover:from-purple-500/10 group-hover:to-pink-500/10 transition-all duration-500 pointer-events-none" />
                <div className="relative z-10 p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-400/20 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                      <BookOpen className="w-6 h-6 text-purple-400" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-base font-black text-white group-hover:text-purple-400 transition-colors truncate leading-tight">
                        {group.book_title}
                      </h3>
                      <p className="text-gray-500 text-xs mt-1">
                        {isTeacher ? "Guru" : "Murid"} • {group.items.length}{" "}
                        item siap review
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-white/10 gap-3">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse shrink-0" />
                        <span className="text-purple-300 font-bold text-sm">
                          {group.count} item
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                        <Clock className="w-3.5 h-3.5 shrink-0" />
                        <span>
                          ~{formatEstimate(group.totalEstimatedSeconds)}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => openGroup(group.book_title)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-purple-500 hover:bg-purple-400 text-[#0B0E14] font-bold text-xs transition-all shrink-0 shadow-md shadow-purple-500/20"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      Gas Review!
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {isFlashcardOpen && currentTask && (
        <BookDailyReviewFlashcardModal
          key={currentTask.item_id}
          isOpen={isFlashcardOpen}
          task={currentTask}
          queuePosition={queueIndex + 1}
          queueTotal={
            groups.find((g) => g.book_title === activeBook)?.items.length ?? 0
          }
          onClose={handleClose}
          onReviewed={handleReviewed}
        />
      )}
    </section>
  );
};

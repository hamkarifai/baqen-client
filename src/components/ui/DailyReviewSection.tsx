import { useEffect, useMemo, useState, useCallback } from "react";
import { Flame, Star, Clock, BookOpen, Play, CheckCircle2 } from "lucide-react";
import { useMyJoinedClass } from "@/features/classroom/hooks/useClassroom";
import { alquranService } from "@/features/alquran/services/alquran.services";
import type {
  DailyTask,
  MyItemDetail,
} from "@/features/alquran/types/quran.types";
import { DailyReviewFlashcardModal } from "@/features/alquran/components/DailyReviewFlashcardModal";
import { parseContentRef } from "@/features/alquran/components/item-detail/ItemDetailView.config";
import { BookDailyReviewFlashcardModal } from "@/features/personal/components/BookDailyReviewFlashcardModal";
import type { BookDailyTask } from "@/features/personal/types/personal.types";

/* ------------------------------------------------------------------ */
/* Helpers                                                              */
/* ------------------------------------------------------------------ */
const formatEstimate = (seconds: number): string => {
  if (seconds <= 0) return "—";
  if (seconds < 60) return `${seconds}d`;
  return `${Math.round(seconds / 60)} mnt`;
};

const getTodayDateKey = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
};

export interface ItemWithEstimate {
  item_id: string;
  content_ref: string;
  status: string;
  estimatedReviewSeconds: number;
  review_count: number;
  interval_days: number;
  stability: number;
  difficulty: number;
}

export interface BookReviewItem {
  item_id: string;
  content_ref: string;
  status: string;
  estimatedReviewSeconds: number;
  book_title: string;
}

export interface BookReviewEstimate {
  book_title: string;
  items: BookReviewItem[];
  itemCount: number;
  totalEstimatedSeconds: number;
  totalEstimatedMinutes: number;
}

export interface JuzReviewEstimate {
  juz_index: number;
  juz_id: string;
  items: ItemWithEstimate[];
  itemCount: number;
  totalEstimatedSeconds: number;
  totalEstimatedMinutes: number;
}

interface ClassReviewGroup {
  classId: string;
  className: string;
  classType: "quran" | "book";
  juzEstimates?: JuzReviewEstimate[];
  bookEstimates?: BookReviewEstimate[];
}

export const DailyReviewSection = () => {
  const { data: classes, isLoading: isLoadingClasses } = useMyJoinedClass();

  const [loading, setLoading] = useState(false);
  const [classGroups, setClassGroups] = useState<ClassReviewGroup[]>([]);
  const [itemStatusMap, setItemStatusMap] = useState<Map<string, string>>(
    new Map(),
  );
  const [reviewedIds, setReviewedIds] = useState<Set<string>>(new Set());

  // Flashcard queue state
  const [activeJuz, setActiveJuz] = useState<
    JuzReviewEstimate | BookReviewEstimate | null
  >(null);
  const [activeClassId, setActiveClassId] = useState<string | null>(null);
  const [queueIndex, setQueueIndex] = useState(0);
  const [isFlashcardOpen, setIsFlashcardOpen] = useState(false);

  const fetchClassEstimates = useCallback(async () => {
    if (!classes) return;
    const quranClasses = classes.filter((c) => c.type === "quran");
    const bookClasses = classes.filter((c) => c.type === "book");
    if (quranClasses.length === 0 && bookClasses.length === 0) {
      setClassGroups([]);
      return;
    }

    setLoading(true);
    try {
      try {
        await alquranService.generateDaily();
      } catch {
        // silent fallback
      }

      const groupsResult: ClassReviewGroup[] = [];
      const newStatusMap = new Map<string, string>();
      const completedSet = new Set<string>();

      // Fetch daily tasks for Quran classes
      for (const classroom of quranClasses) {
        try {
          const dailyGroups = await alquranService.getClassDaily(classroom.id);
          const dailyTasks = dailyGroups.flatMap((group) => group.items);

          dailyTasks.forEach((t) => {
            if (t.state === "completed" || t.state === "done") {
              completedSet.add(t.item_id);
            }
          });

          const reviewableTasks = dailyTasks.filter((t) => {
            const s = (t.status ?? "").toLowerCase();
            const isDone = t.state === "done" || t.state === "completed";
            if (isDone) return false;
            return (
              s === "" ||
              s === "interval" ||
              s === "fsrs_active" ||
              s === "graduate" ||
              s === "graduated"
            );
          });

          const dedupedTasks = Array.from(
            new Map(
              reviewableTasks.map((task) => [task.item_id, task]),
            ).values(),
          );

          const myItemsResponse = await alquranService.getMyItems(
            "quran",
            classroom.id,
          );
          const juzIdByIndex = new Map<number, string>();
          myItemsResponse.data.groups.forEach((group) => {
            juzIdByIndex.set(group.juz_index, group.juz_id);
            group.items.forEach((item: MyItemDetail) => {
              newStatusMap.set(item.item_id, item.status);
            });
          });

          const juzMap = new Map<number, JuzReviewEstimate>();

          dedupedTasks.forEach((task) => {
            const juzIndex = task.juz_index ?? 0;
            if (!juzMap.has(juzIndex)) {
              juzMap.set(juzIndex, {
                juz_index: juzIndex,
                juz_id: juzIdByIndex.get(juzIndex) ?? "",
                items: [],
                itemCount: 0,
                totalEstimatedSeconds: 0,
                totalEstimatedMinutes: 0,
              });
            }

            const estimate = juzMap.get(juzIndex)!;
            const estimatedSecs = task.estimated_review_seconds ?? 0;

            estimate.items.push({
              item_id: task.item_id,
              content_ref: task.content_ref,
              status: task.status ?? "",
              estimatedReviewSeconds: estimatedSecs,
              review_count: 0,
              interval_days: 0,
              stability: 0,
              difficulty: 0,
            });
            estimate.itemCount += 1;
            estimate.totalEstimatedSeconds += estimatedSecs;
          });

          const juzEstimates = Array.from(juzMap.values())
            .map((juz) => ({
              ...juz,
              totalEstimatedMinutes: Math.ceil(juz.totalEstimatedSeconds / 60),
            }))
            .sort((a, b) => a.juz_index - b.juz_index);

          if (juzEstimates.length > 0) {
            groupsResult.push({
              classId: classroom.id,
              className: classroom.name,
              juzEstimates,
              classType: "quran",
            });
          }
        } catch (err) {
          console.error(
            `Failed to fetch daily review for class ${classroom.name}:`,
            err,
          );
        }
      }

      // Fetch daily tasks for Book classes
      for (const classroom of bookClasses) {
        try {
          const dailyBookTasks = await alquranService.getClassDailyBook(
            classroom.id,
          );

          dailyBookTasks.forEach((t) => {
            if (t.state === "completed" || t.state === "done") {
              completedSet.add(t.item_id);
            }
          });

          const reviewableTasks = dailyBookTasks.filter((t) => {
            const s = (t.status ?? "").toLowerCase();
            const isDone = t.state === "done" || t.state === "completed";
            if (isDone) return false;
            return (
              s === "" ||
              s === "interval" ||
              s === "fsrs_active" ||
              s === "graduate" ||
              s === "graduated"
            );
          });

          const dedupedTasks = Array.from(
            new Map(
              reviewableTasks.map((task) => [task.item_id, task]),
            ).values(),
          );

          // Group by book title
          const bookMap = new Map<string, BookReviewEstimate>();

          dedupedTasks.forEach((task) => {
            const bookTitle = task.book_title ?? "Buku Tidak Diketahui";
            if (!bookMap.has(bookTitle)) {
              bookMap.set(bookTitle, {
                book_title: bookTitle,
                items: [],
                itemCount: 0,
                totalEstimatedSeconds: 0,
                totalEstimatedMinutes: 0,
              });
            }

            const estimate = bookMap.get(bookTitle)!;
            const estimatedSecs = task.estimated_review_seconds ?? 0;

            estimate.items.push({
              item_id: task.item_id,
              content_ref: task.content_ref,
              status: task.status ?? "",
              estimatedReviewSeconds: estimatedSecs,
              book_title: bookTitle,
            });
            estimate.itemCount += 1;
            estimate.totalEstimatedSeconds += estimatedSecs;
          });

          const bookEstimates = Array.from(bookMap.values()).map((book) => ({
            ...book,
            totalEstimatedMinutes: Math.ceil(book.totalEstimatedSeconds / 60),
          }));

          if (bookEstimates.length > 0) {
            groupsResult.push({
              classId: classroom.id,
              className: classroom.name,
              bookEstimates,
              classType: "book",
            });
          }
        } catch (err) {
          console.error(
            `Failed to fetch daily book review for class ${classroom.name}:`,
            err,
          );
        }
      }

      setClassGroups(groupsResult);
      setItemStatusMap(newStatusMap);
      setReviewedIds((prev) => {
        const merged = new Set(prev);
        completedSet.forEach((id) => merged.add(id));
        return merged;
      });
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [classes]);

  useEffect(() => {
    void fetchClassEstimates();

    const onVisible = () => {
      if (document.visibilityState === "visible") void fetchClassEstimates();
    };

    document.addEventListener("visibilitychange", onVisible);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [fetchClassEstimates]);

  // Filter reviewed items out of estimates
  const filteredClassGroups = useMemo(() => {
    return classGroups
      .map((group) => {
        if (group.classType === "book") {
          const bookEstimates = (group.bookEstimates ?? [])
            .map((book) => {
              const items = book.items.filter(
                (item) => !reviewedIds.has(item.item_id),
              );
              const totalEstimatedSeconds = items.reduce(
                (s, i) => s + (i.estimatedReviewSeconds || 0),
                0,
              );
              return {
                ...book,
                items,
                itemCount: items.length,
                totalEstimatedSeconds,
              };
            })
            .filter((book) => book.itemCount > 0);
          return { ...group, bookEstimates };
        }

        const juzEstimates = (group.juzEstimates ?? [])
          .map((juz) => {
            const items = juz.items.filter(
              (item) => !reviewedIds.has(item.item_id),
            );
            const totalEstimatedSeconds = items.reduce(
              (s, i) => s + (i.estimatedReviewSeconds || 0),
              0,
            );
            return {
              ...juz,
              items,
              itemCount: items.length,
              totalEstimatedSeconds,
            };
          })
          .filter((juz) => juz.itemCount > 0);
        return { ...group, juzEstimates };
      })
      .filter(
        (group) =>
          (group.classType === "quran" &&
            (group.juzEstimates?.length ?? 0) > 0) ||
          (group.classType === "book" &&
            (group.bookEstimates?.length ?? 0) > 0),
      );
  }, [classGroups, reviewedIds]);

  const totalItems = filteredClassGroups.reduce((sum, group) => {
    if (group.classType === "book") {
      return (
        sum + (group.bookEstimates?.reduce((s, b) => s + b.itemCount, 0) ?? 0)
      );
    }
    return (
      sum + (group.juzEstimates?.reduce((s, j) => s + j.itemCount, 0) ?? 0)
    );
  }, 0);

  const openJuz = (
    classId: string,
    juz: JuzReviewEstimate | BookReviewEstimate,
    startIndex = 0,
  ) => {
    setActiveClassId(classId);
    setActiveJuz(juz);
    setQueueIndex(startIndex);
    setIsFlashcardOpen(true);
  };

  const currentQuranTask: DailyTask | null =
    activeJuz && "juz_index" in activeJuz && activeJuz.juz_index !== undefined
      ? {
          item_id: activeJuz.items[queueIndex]?.item_id ?? "",
          source: "interval_review",
          state: "pending",
          task_date: getTodayDateKey(),
          content_ref: activeJuz.items[queueIndex]?.content_ref ?? "",
          juz_index: activeJuz.juz_index,
          status:
            activeJuz.items[queueIndex]?.status ??
            itemStatusMap.get(activeJuz.items[queueIndex]?.item_id ?? "") ??
            "",
        }
      : null;

  const currentBookTask: BookDailyTask | null =
    activeJuz && "book_title" in activeJuz
      ? {
          item_id: activeJuz.items[queueIndex]?.item_id ?? "",
          source: "book",
          state: "pending",
          task_date: getTodayDateKey(),
          content_ref: activeJuz.items[queueIndex]?.content_ref ?? "",
          status: activeJuz.items[queueIndex]?.status ?? "",
          book_title:
            activeJuz.items[queueIndex]?.book_title ??
            activeJuz.book_title ??
            "",
          estimated_review_seconds:
            activeJuz.items[queueIndex]?.estimatedReviewSeconds ?? 0,
        }
      : null;

  const currentTaskForQuran =
    activeJuz && "juz_index" in activeJuz ? currentQuranTask : null;
  const currentTaskForBook =
    activeJuz && "book_title" in activeJuz ? currentBookTask : null;

  const handleReviewed = async () => {
    if (!activeJuz || !activeClassId) return;

    const reviewedId = activeJuz.items[queueIndex]?.item_id;
    const nextReviewed = new Set(reviewedIds);

    if (reviewedId) {
      nextReviewed.add(reviewedId);
      setReviewedIds(nextReviewed);
    }

    const remaining = activeJuz.items.filter(
      (qi) => !nextReviewed.has(qi.item_id),
    );

    if (remaining.length > 0) {
      const nextIdx = activeJuz.items.findIndex(
        (qi) => qi.item_id === remaining[0].item_id,
      );
      setQueueIndex(nextIdx >= 0 ? nextIdx : queueIndex + 1);
    } else {
      const currentClassGroup = filteredClassGroups.find(
        (cg) => cg.classId === activeClassId,
      );

      if (currentClassGroup) {
        if (
          currentClassGroup.classType === "book" &&
          currentClassGroup.bookEstimates
        ) {
          // Find current book in the group
          const currentBookIndex = currentClassGroup.bookEstimates.findIndex(
            (book) =>
              book.book_title === (activeJuz as BookReviewEstimate).book_title,
          );

          const nextBook = currentClassGroup.bookEstimates
            .slice(currentBookIndex + 1)
            .find((book) =>
              book.items.some((i) => !nextReviewed.has(i.item_id)),
            );

          if (nextBook) {
            const itemsWithRemaining = nextBook.items.filter(
              (i) => !nextReviewed.has(i.item_id),
            );
            setActiveJuz({ ...nextBook, items: itemsWithRemaining });
            setQueueIndex(0);
            setIsFlashcardOpen(true);
          } else {
            // Move to next class group
            const currentClassIndex = filteredClassGroups.findIndex(
              (cg) => cg.classId === activeClassId,
            );
            const nextClassGroup = filteredClassGroups
              .slice(currentClassIndex + 1)
              .find(
                (cg) =>
                  (cg.juzEstimates && cg.juzEstimates.length > 0) ||
                  (cg.bookEstimates && cg.bookEstimates.length > 0),
              );

            if (nextClassGroup) {
              setActiveClassId(nextClassGroup.classId);
              if (
                nextClassGroup.classType === "book" &&
                nextClassGroup.bookEstimates
              ) {
                const firstBook = nextClassGroup.bookEstimates[0];
                const itemsWithRemaining = firstBook.items.filter(
                  (i) => !nextReviewed.has(i.item_id),
                );
                setActiveJuz({ ...firstBook, items: itemsWithRemaining });
              } else if (nextClassGroup.juzEstimates) {
                setActiveJuz(nextClassGroup.juzEstimates[0]);
              }
              setQueueIndex(0);
              setIsFlashcardOpen(true);
            } else {
              setIsFlashcardOpen(false);
              setActiveJuz(null);
              setActiveClassId(null);
            }
          }
        } else if (currentClassGroup.juzEstimates) {
          // Quran class logic (original)
          const currentJuzIndex = currentClassGroup.juzEstimates.findIndex(
            (juz) => juz.juz_id === (activeJuz as JuzReviewEstimate).juz_id,
          );

          const nextJuz = currentClassGroup.juzEstimates
            .slice(currentJuzIndex + 1)
            .map((juz) => {
              const items = juz.items.filter(
                (item) => !nextReviewed.has(item.item_id),
              );
              const totalEstimatedSeconds = items.reduce(
                (sum, item) => sum + (item.estimatedReviewSeconds || 0),
                0,
              );
              return {
                ...juz,
                items,
                itemCount: items.length,
                totalEstimatedSeconds,
              };
            })
            .find((juz) => juz.itemCount > 0);

          if (nextJuz) {
            setActiveJuz(nextJuz);
            setQueueIndex(0);
            setIsFlashcardOpen(true);
          } else {
            const currentClassIndex = filteredClassGroups.findIndex(
              (cg) => cg.classId === activeClassId,
            );
            const nextClassGroup = filteredClassGroups
              .slice(currentClassIndex + 1)
              .find(
                (cg) =>
                  (cg.juzEstimates && cg.juzEstimates.length > 0) ||
                  (cg.bookEstimates && cg.bookEstimates.length > 0),
              );

            if (nextClassGroup) {
              setActiveClassId(nextClassGroup.classId);
              if (nextClassGroup.juzEstimates) {
                setActiveJuz(nextClassGroup.juzEstimates[0]);
              } else if (nextClassGroup.bookEstimates) {
                const firstBook = nextClassGroup.bookEstimates[0];
                const itemsWithRemaining = firstBook.items.filter(
                  (i) => !nextReviewed.has(i.item_id),
                );
                setActiveJuz({ ...firstBook, items: itemsWithRemaining });
              }
              setQueueIndex(0);
              setIsFlashcardOpen(true);
            } else {
              setIsFlashcardOpen(false);
              setActiveJuz(null);
              setActiveClassId(null);
            }
          }
        } else {
          setIsFlashcardOpen(false);
          setActiveJuz(null);
          setActiveClassId(null);
        }
      } else {
        setIsFlashcardOpen(false);
        setActiveJuz(null);
        setActiveClassId(null);
      }
    }

    void fetchClassEstimates();
  };

  const handleClose = () => {
    setIsFlashcardOpen(false);
    setActiveJuz(null);
    setActiveClassId(null);
    setQueueIndex(0);
  };

  if (isLoadingClasses) {
    return (
      <div className="mt-8 p-6 text-center text-sm text-slate-400 animate-pulse">
        Memuat informasi kelas...
      </div>
    );
  }

  return (
    <div className="mb-8 mt-8 animate-fadeIn relative">
      <div className="absolute -inset-1 blur-2xl bg-linear-to-r from-cyan-500/20 via-blue-500/20 to-violet-500/20 rounded-3xl opacity-50 pointer-events-none" />

      <div className="relative bg-linear-to-br from-[#1A222C] to-[#0F141A] rounded-2xl border border-cyan-500/30 overflow-hidden shadow-2xl shadow-cyan-900/20">
        <div className="h-1 w-full bg-linear-to-r from-cyan-400 via-blue-400 to-violet-400" />

        <div className="p-6 md:p-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row gap-4 mb-8 border-b border-white/5 pb-6">
            <div className="w-16 h-16 rounded-xl bg-linear-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30 shrink-0 transform -rotate-3">
              <Flame className="w-8 h-8 text-white animate-pulse" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold tracking-wide uppercase mb-2">
                <Star className="w-3.5 h-3.5" /> Prioritas Kelas
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-2">
                Daily Review Kelas
              </h2>
              <p className="text-gray-400 text-sm md:text-base max-w-2xl">
                Ada <strong className="text-cyan-400">{totalItems} item</strong>{" "}
                di kelas Quran yang menunggu untuk direview hari ini.
              </p>
            </div>
          </div>

          {/* Loading */}
          {loading && classGroups.length === 0 && (
            <p className="text-sm text-gray-400 animate-pulse">
              Memuat target harian...
            </p>
          )}

          {/* Empty */}
          {!loading && filteredClassGroups.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8 text-cyan-400" />
              </div>
              <p className="text-white font-bold mb-1">
                Semua kelas sudah direview!
              </p>
              <p className="text-gray-400 text-sm">
                Tidak ada review tersisa hari ini.
              </p>
            </div>
          )}

          {/* Class-scoped review items */}
          <div className="space-y-8">
            {filteredClassGroups.map((group) => (
              <div key={group.classId} className="space-y-4">
                <div className="flex items-center gap-2 border-l-4 border-cyan-500 pl-3">
                  <h3 className="text-lg font-black text-white">
                    {group.className}
                  </h3>
                  <span className="rounded-full bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 text-[10px] text-cyan-400 font-bold uppercase">
                    {group.classType === "book"
                      ? (group.bookEstimates?.reduce(
                          (acc, b) => acc + b.itemCount,
                          0,
                        ) ?? 0)
                      : (group.juzEstimates?.reduce(
                          (acc, j) => acc + j.itemCount,
                          0,
                        ) ?? 0)}{" "}
                    Items
                  </span>
                </div>

                {group.classType === "book" && group.bookEstimates ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {group.bookEstimates.map((book, index) => (
                      <div
                        key={book.book_title}
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
                                {book.book_title}
                              </h3>
                              <p className="text-gray-500 text-xs mt-1">
                                {book.itemCount} item siap diuji
                              </p>
                            </div>
                          </div>

                          <div className="mb-4 flex flex-wrap gap-2">
                            {book.items.slice(0, 3).map((item, itemIndex) => (
                              <span
                                key={item.item_id}
                                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-gray-300"
                              >
                                <span className="w-5 h-5 rounded-full bg-purple-500/15 text-purple-300 flex items-center justify-center font-bold">
                                  {itemIndex + 1}
                                </span>
                                <span className="max-w-[11rem] truncate">
                                  {item.content_ref || `Item ${itemIndex + 1}`}
                                </span>
                              </span>
                            ))}
                            {book.itemCount > 3 && (
                              <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-gray-400">
                                +{book.itemCount - 3} lagi
                              </span>
                            )}
                          </div>

                          <div className="flex items-center justify-between pt-4 border-t border-white/10 gap-3">
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                                <Clock className="w-3.5 h-3.5 shrink-0" />
                                <span>
                                  ~{formatEstimate(book.totalEstimatedSeconds)}
                                </span>
                              </div>
                            </div>

                            <button
                              onClick={() => openJuz(group.classId, book)}
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
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {group.juzEstimates?.map((juz, index) => (
                      <div
                        key={juz.juz_id}
                        className="group relative overflow-hidden rounded-xl bg-[#161D26] border border-white/10 hover:border-cyan-500/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div className="absolute inset-0 bg-linear-to-br from-cyan-500/0 to-blue-500/0 group-hover:from-cyan-500/10 group-hover:to-blue-500/10 transition-all duration-500 pointer-events-none" />

                        <div className="relative z-10 p-5">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-400/20 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                              <BookOpen className="w-6 h-6 text-cyan-400" />
                            </div>
                            <div>
                              <h3 className="text-2xl font-black text-white group-hover:text-cyan-400 transition-colors">
                                Juz {juz.juz_index}
                              </h3>
                              <p className="text-gray-500 text-xs mt-1">
                                {juz.itemCount} item siap diuji
                              </p>
                            </div>
                          </div>

                          <div className="mb-4 flex flex-wrap gap-2">
                            {juz.items.slice(0, 3).map((item, itemIndex) => {
                              const parsed = item.content_ref
                                ? parseContentRef(item.content_ref)
                                : null;
                              return (
                                <span
                                  key={item.item_id}
                                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-gray-300"
                                >
                                  <span className="w-5 h-5 rounded-full bg-cyan-500/15 text-cyan-300 flex items-center justify-center font-bold">
                                    {itemIndex + 1}
                                  </span>
                                  <span className="max-w-[11rem] truncate">
                                    {parsed?.title ||
                                      item.content_ref ||
                                      `Item ${itemIndex + 1}`}
                                  </span>
                                </span>
                              );
                            })}
                            {juz.itemCount > 3 && (
                              <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-gray-400">
                                +{juz.itemCount - 3} lagi
                              </span>
                            )}
                          </div>

                          <div className="flex items-center justify-between pt-4 border-t border-white/10 gap-3">
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                                <Clock className="w-3.5 h-3.5 shrink-0" />
                                <span>
                                  ~{formatEstimate(juz.totalEstimatedSeconds)}
                                </span>
                              </div>
                            </div>

                            <button
                              onClick={() => openJuz(group.classId, juz)}
                              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-[#0B0E14] font-bold text-xs transition-all shrink-0 shadow-md shadow-cyan-500/20"
                            >
                              <Play className="w-3.5 h-3.5 fill-current" />
                              Gas Review!
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Flashcard Modal */}
      {isFlashcardOpen && activeJuz && (
        <>
          {activeJuz && "juz_index" in activeJuz && currentTaskForQuran && (
            <DailyReviewFlashcardModal
              key={currentTaskForQuran.item_id}
              isOpen={isFlashcardOpen}
              task={currentTaskForQuran}
              queuePosition={queueIndex + 1}
              queueTotal={activeJuz.items.length}
              onClose={handleClose}
              onReviewed={handleReviewed}
            />
          )}
          {activeJuz && "book_title" in activeJuz && currentTaskForBook && (
            <BookDailyReviewFlashcardModal
              key={currentTaskForBook.item_id}
              isOpen={isFlashcardOpen}
              task={currentTaskForBook}
              queuePosition={queueIndex + 1}
              queueTotal={activeJuz.items.length}
              onClose={handleClose}
              onReviewed={handleReviewed}
            />
          )}
        </>
      )}
    </div>
  );
};

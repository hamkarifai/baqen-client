import { useState, useEffect, useCallback } from "react";
import { alquranService } from "@/features/alquran/services/alquran.services";
import type { DailyTask, DailyTaskGroup } from "@/features/alquran/types/quran.types";

// ItemWithEstimate wraps a DailyTask so status is always accurate
export interface ItemWithEstimate {
  item_id: string;
  content_ref: string;
  status: string;
  estimatedReviewSeconds: number;
  // kept for compatibility with any consumers that expect ItemByStatus shape
  review_count: number;
  interval_days: number;
  stability: number;
  difficulty: number;
  next_review_at?: string;
  last_review_at?: string;
  interval_next_review_at?: string;
}

export interface JuzReviewEstimate {
  juz_index: number;
  juz_id: string;
  items: ItemWithEstimate[];
  itemCount: number;
  totalEstimatedSeconds: number;
  totalEstimatedMinutes: number;
}

export const useDailyReviewEstimate = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [juzEstimates, setJuzEstimates] = useState<JuzReviewEstimate[]>([]);

  const fetchEstimates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Always re-generate the daily snapshot first so newly-due items are
      // included. GenerateToday is idempotent (delete-then-insert) and cheap.
      try {
        await alquranService.generateDaily();
      } catch {
        // If generate fails (e.g. network), still try to show existing snapshot
      }

      // Use the daily endpoint — it already filters items due today,
      // includes the correct status for each item, and provides juz_index.
      const dailyGroups: DailyTaskGroup[] = await alquranService.getDaily("quran");
      const dailyTasks = dailyGroups.flatMap((group) => group.items);

      // Only include quran items that are pending review (not yet done)
      // and have a reviewable status (interval or fsrs_active/graduate).
      // If status is empty (lookup failed), still include the item — it's in
      // the daily snapshot so it must be due.
      const reviewableTasks = dailyTasks.filter((t) => {
        const s = (t.status ?? "").toLowerCase();
        const isDone = t.state === "done" || t.state === "completed";
        if (isDone) return false;
        // Include if status is reviewable OR if status is unknown (empty)
        return (
          s === "" ||
          s === "interval" ||
          s === "fsrs_active" ||
          s === "graduate" ||
          s === "graduated"
        );
      });

      const dedupedTasks = Array.from(
        new Map(reviewableTasks.map((task) => [task.item_id, task])).values(),
      );

      // We need juz_id — fetch my-items to get juz_id per juz_index
      const myItemsResponse = await alquranService.getMyItems("quran");
      const juzIdByIndex = new Map<number, string>();
      myItemsResponse.data.groups.forEach((group) => {
        juzIdByIndex.set(group.juz_index, group.juz_id);
      });

      // Group by juz_index
      const juzMap = new Map<number, JuzReviewEstimate>();

      dedupedTasks.forEach((task) => {
        const juzIndex = task.juz_index ?? 0;
        // Use juz_index from the task; if 0 (not found in juz_items), still
        // include the item under a "Lainnya" bucket with index 0 so it's not lost.
        // In practice all quran items should have a valid juz_index > 0.

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
        // estimated_review_seconds comes directly from the daily endpoint
        const estimatedSecs = task.estimated_review_seconds ?? 0;

        estimate.items.push({
          item_id: task.item_id,
          content_ref: task.content_ref,
          // status comes directly from the daily endpoint — always accurate
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

      const estimates = Array.from(juzMap.values()).map((juz) => ({
        ...juz,
        totalEstimatedMinutes: Math.ceil(juz.totalEstimatedSeconds / 60),
      }));

      setJuzEstimates(estimates.sort((a, b) => a.juz_index - b.juz_index));
    } catch (err) {
      const message =
        (err as any)?.response?.data?.message ||
        "Failed to fetch review estimates";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchEstimates();
  }, [fetchEstimates]);

  return {
    loading,
    error,
    juzEstimates,
    refetch: fetchEstimates,
  };
};

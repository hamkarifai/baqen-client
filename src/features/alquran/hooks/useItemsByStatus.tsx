import { useState, useEffect, useCallback } from "react";
import type { ItemsByStatusResponse } from "@/features/alquran/types/quran.types";
import { alquranService } from "@/features/alquran/services/alquran.services";
import axios from "axios";

interface UseItemsByStatusProps {
  status: string;
  classId?: string;
  autoFetch?: boolean;
}

export const useItemsByStatus = ({
  status,
  classId,
  autoFetch = true,
}: UseItemsByStatusProps) => {
  const [data, setData] = useState<ItemsByStatusResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await alquranService.getItemsByStatus(status, classId);
      setData(response);
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? (err.response?.data?.message ?? "Failed to fetch items")
        : "Failed to fetch items";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [status, classId]);

  useEffect(() => {
    if (autoFetch) {
      fetchItems();
    }
  }, [autoFetch, fetchItems]);

  return { data, loading, error, refetch: fetchItems };
};

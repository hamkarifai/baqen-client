import { useCallback, useState } from "react";
import type { GetJuzResponse } from "@/features/alquran/types/quran.types";
import { alquranService } from "@/features/alquran/services/alquran.services";
import { isAxiosError } from "axios";

export const useGetJuz = (classId?: string) => {
  const [data, setData] = useState<GetJuzResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getJuz = useCallback(async () => {
    setLoading(true);
    setError(null);
    try { 
      const response = await alquranService.getJuz(classId);
      setData(response);
    } catch (err: unknown) {
      const message = isAxiosError(err)
        ? (err.response?.data as { message?: string } | undefined)?.message ||
          "Failed to get juz"
        : "Failed to get juz";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [classId]);

  return { data, loading, error, getJuz };
};

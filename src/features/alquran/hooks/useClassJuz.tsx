import { useCallback, useState } from "react";
import { isAxiosError } from "axios";
import type {
  ClassJuzCreateResponse,
  GetJuzResponse,
} from "@/features/alquran/types/quran.types";
import { alquranService } from "@/features/alquran/services/alquran.services";

export const useGetClassJuz = (classId?: string) => {
  const [data, setData] = useState<GetJuzResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getClassJuz = useCallback(async () => {
    if (!classId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await alquranService.getJuz(classId);
      setData(response);
      return response;
    } catch (err: unknown) {
      const message = isAxiosError(err)
        ? (err.response?.data as { message?: string } | undefined)?.message ||
          "Gagal memuat juz kelas"
        : "Gagal memuat juz kelas";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [classId]);

  return { data, loading, error, getClassJuz };
};

export const useCreateClassJuz = () => {
  const [data, setData] = useState<ClassJuzCreateResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createClassJuz = async (juzIndex: number, classId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await alquranService.createClassJuz(juzIndex, classId);
      setData(response);
      return response;
    } catch (err: unknown) {
      const message = isAxiosError(err)
        ? (err.response?.data as { message?: string } | undefined)?.message ||
          "Gagal menambahkan juz"
        : "Gagal menambahkan juz";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, createClassJuz };
};

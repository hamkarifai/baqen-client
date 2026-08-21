import { useState, useCallback } from "react";
import { personalService } from "../services/personal.services";
import type { Book } from "../types/personal.types";

export const useMyCollection = () => {
  const [collection, setCollection] = useState<Book[]>([]);
  const [loadingCollection, setLoadingCollection] = useState(false);
  const [errorCollection, setErrorCollection] = useState<string | null>(null);

  const fetchCollection = useCallback(async () => {
    try {
      setLoadingCollection(true);
      setErrorCollection(null);
      const response = await personalService.getMyCollection();

      const mappedCollection: Book[] = (response.data || []).map((item) => ({
        id: item.book_id,
        owner_id: "",
        title: item.title,
        description: item.description,
        cover_image: item.cover_image,
        status: "published",
        published_at: item.added_at,
        created_at: item.added_at,
        updated_at: item.added_at,
      }));
      setCollection(mappedCollection);
    } catch (err: any) {
      setErrorCollection(
        err?.response?.data?.message || "Gagal mengambil koleksi kitab import",
      );
      setCollection([]);
    } finally {
      setLoadingCollection(false);
    }
  }, []);

  const removeFromCollection = useCallback(
    async (id: string) => {
      try {
        setLoadingCollection(true);
        await personalService.removeFromMyCollection(id);
        await fetchCollection();
      } catch (err: any) {
        setErrorCollection(
          err?.response?.data?.message ||
            "Gagal menghapus kitab dari koleksi impor",
        );
      } finally {
        setLoadingCollection(false);
      }
    },
    [fetchCollection],
  );

  return {
    collection,
    loadingCollection,
    errorCollection,
    fetchCollection,
    removeFromCollection,
  };
};

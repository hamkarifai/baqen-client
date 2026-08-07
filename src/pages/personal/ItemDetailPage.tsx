import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import {
  ArrowLeft,
  LayoutList,
  Loader2,
  AlertCircle,
  FileText,
  Lock,
  Flame,
  Brain,
  Target,
  CheckCircle2,
  Play,
  PenSquare,
  Trash2,
  AlertTriangle,
  Image,
} from "lucide-react";
import { personalService } from "@/features/personal/services/personal.services";
import type { ItemDetail } from "@/features/personal/types/personal.types";
import { Sidebar } from "@/components/ui/Sidebar";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { EditItemModal } from "@/features/personal/components/EditItemModal";
import { IntervalModal } from "@/features/personal/components/IntervalModal";
import { useDeleteItem } from "@/features/personal/hooks/useDeleteItem";
import { useStartItemPhase } from "@/features/personal/hooks/useStartItemPhase";
import { useStartIntervalPhase } from "@/features/personal/hooks/useStartIntervalPhase";
import { useActivateFsrsPhase } from "@/features/personal/hooks/useActivateFsrsPhase";
import {
  useBookTree,
  invalidateBookTreeCache,
  updateItemStatusInCache,
} from "@/features/personal/hooks/useBookTree";
import {
  useBookItemStatusMap,
  contentRefForItem,
} from "@/features/personal/hooks/useBookItemStatusMap";
import type {
  BookItem,
  CreatedItem,
} from "@/features/personal/types/personal.types";

/* ------------------------------------------------------------------ */
/* Item Detail Page (for Book Items)                                    */
/* ------------------------------------------------------------------ */
export const ItemDetailPage = () => {
  const { itemId, bookId } = useParams<{ itemId: string; bookId: string }>();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [item, setItem] = useState<BookItem | null>(null);
  const [realItemId, setRealItemId] = useState<string | null>(
    // Persist across navigation within same session using sessionStorage
    itemId ? sessionStorage.getItem(`real-item-id-${itemId}`) : null,
  );
  // Track if we have a pending optimistic status update that shouldn't be overwritten by tree sync
  const pendingStatusRef = useRef<BookItem["status"] | null>(null);
  // Track the last status confirmed by the API
  const apiStatusRef = useRef<BookItem["status"] | null>(null);
  const [isStartModalOpen, setIsStartModalOpen] = useState(false);
  const [isIntervalModalOpen, setIsIntervalModalOpen] = useState(false);
  const [isActivateFsrsModalOpen, setIsActivateFsrsModalOpen] = useState(false);
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
  const [isReactivateModalOpen, setIsReactivateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemDetail, setItemDetail] = useState<ItemDetail | null>(null);

  const { tree, loading, error, fetchBookTree, removeItemFromTree } =
    useBookTree();
  const { deleteItem: deleteItemFn } = useDeleteItem({
    onBookTreeUpdate: (bid, deletedItemId) => {
      removeItemFromTree(bid, deletedItemId);
    },
  });
  const { startPhase, loading: isStarting } = useStartItemPhase();
  const { startInterval, loading: isStartingInterval } =
    useStartIntervalPhase();
  const { activateFsrs, loading: isActivatingFsrs } = useActivateFsrsPhase();
  const { fetchStatusMap } = useBookItemStatusMap();
  const itemImage = item?.image || itemDetail?.image;

  // Load item: fetch tree for content, fetch statusMap for status
  useEffect(() => {
    if (!bookId || !itemId) return;

    const load = async () => {
      // Fetch tree (for item content/answer/etc) and status map in parallel
      const [treeResult, statusMap] = await Promise.all([
        fetchBookTree(bookId, true).catch(() => null),
        fetchStatusMap().catch(() => new Map()),
      ]);

      if (!treeResult) return;

      // Find item in tree
      const findInTree = (t: typeof treeResult): BookItem | null => {
        const inItems = t.items?.find((i) => i.id === itemId);
        if (inItems) return inItems;
        const searchMods = (mods: typeof t.modules): BookItem | null => {
          for (const m of mods) {
            const found = m.items?.find((i) => i.id === itemId);
            if (found) return found;
            if (m.children?.length) {
              const d = searchMods(m.children);
              if (d) return d;
            }
          }
          return null;
        };
        return searchMods(t.modules);
      };

      const foundItem = findInTree(treeResult);
      if (!foundItem) return;

      // Get status from API (authoritative) — tree doesn't include status
      const contentRef = contentRefForItem(bookId, itemId);
      const entry = statusMap.get(contentRef);

      const sessionStatus = sessionStorage.getItem(`item-status-${itemId}`);
      const finalStatus = (entry?.status ??
        sessionStatus ??
        "belum_mulai") as BookItem["status"];

      if (entry?.item_id) {
        setRealItemId(entry.item_id);
        sessionStorage.setItem(`real-item-id-${itemId}`, entry.item_id);
      }

      setItem({ ...foundItem, status: finalStatus });
    };

    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookId, itemId]);

  // Fetch item detail (next review, stability) when realItemId is known
  useEffect(() => {
    if (!realItemId) return;
    personalService
      .getItemDetail(realItemId)
      .then((res) => setItemDetail(res.data))
      .catch(() => setItemDetail(null));
  }, [realItemId]);

  const handleEditSuccess = (updatedItem: CreatedItem) => {
    setItem({
      ...updatedItem,
      review_count: 0,
      status:
        ((updatedItem as unknown as Record<string, unknown>)
          .status as BookItem["status"]) || "belum_mulai",
    });
  };

  const handleDeleteSuccess = async () => {
    if (!itemId) return;

    try {
      await deleteItemFn(itemId, bookId || undefined);
      setIsDeleteModalOpen(false);
      sessionStorage.removeItem(`real-item-id-${itemId}`);
      sessionStorage.removeItem(`item-status-${itemId}`);
      navigate(-1);
    } catch (err: unknown) {
      // avoid logging raw error objects to prevent leaking internal details
      console.error(
        "[handleDeleteSuccess] Terjadi kesalahan saat menghapus item",
      );
    }
  };

  const handleStartPhase = async () => {
    if (!bookId || !itemId) return;
    try {
      const result = await startPhase(bookId, itemId);
      // result.item_id is the Item state ID needed for interval/fsrs calls
      if (result.item_id) {
        setRealItemId(result.item_id);
        sessionStorage.setItem(`real-item-id-${itemId}`, result.item_id);
      }
      const newStatus = result.status || "menghafal";
      pendingStatusRef.current = newStatus as BookItem["status"];
      apiStatusRef.current = newStatus as BookItem["status"];
      sessionStorage.setItem(`item-status-${itemId}`, newStatus);
      setItem((prev) =>
        prev ? { ...prev, status: newStatus as BookItem["status"] } : null,
      );
      setIsStartModalOpen(false);
    } catch (err: unknown) {
      console.error("[handleStartPhase] Terjadi kesalahan saat memulai fase");
    }
  };

  const handleIntervalSubmit = async (intervalDays: number) => {
    if (!bookId || !itemId) return;
    const itemIdToUse =
      realItemId || sessionStorage.getItem(`real-item-id-${itemId}`);
    if (!itemIdToUse) {
      console.error("[handleIntervalSubmit] No real item_id available");
      return;
    }
    try {
      await startInterval(bookId, itemIdToUse, intervalDays);
      pendingStatusRef.current = "interval";
      apiStatusRef.current = "interval";
      sessionStorage.setItem(`item-status-${itemId}`, "interval");
      setItem((prev) => (prev ? { ...prev, status: "interval" } : null));
      setIsIntervalModalOpen(false);
    } catch (err: unknown) {
      console.error(
        "[handleIntervalSubmit] Terjadi kesalahan saat mengirim interval",
      );
    }
  };

  const handleActivateFsrsPhase = async () => {
    if (!bookId || !itemId) return;
    const itemIdToUse =
      realItemId || sessionStorage.getItem(`real-item-id-${itemId}`);
    if (!itemIdToUse) {
      console.error("[handleActivateFsrsPhase] No real item_id available");
      return;
    }
    try {
      await activateFsrs(bookId, itemIdToUse);
      pendingStatusRef.current = "fsrs_active";
      apiStatusRef.current = "fsrs_active";
      sessionStorage.setItem(`item-status-${itemId}`, "fsrs_active");
      setItem((prev) => (prev ? { ...prev, status: "fsrs_active" } : null));
      setIsActivateFsrsModalOpen(false);
    } catch (err: unknown) {
      console.error(
        "[handleActivateFsrsPhase] Terjadi kesalahan saat mengaktifkan FSRS",
      );
    }
  };

  const handleDeactivate = async () => {
    if (!itemId) return;
    const itemIdToUse =
      realItemId || sessionStorage.getItem(`real-item-id-${itemId}`);
    if (!itemIdToUse) {
      console.error("[handleDeactivate] No real item_id available");
      return;
    }
    try {
      await personalService.deactivateItem(itemIdToUse);
      pendingStatusRef.current = "inactive";
      apiStatusRef.current = "inactive";
      sessionStorage.setItem(`item-status-${itemId}`, "inactive");
      setItem((prev) => (prev ? { ...prev, status: "inactive" } : null));
      setIsDeactivateModalOpen(false);
    } catch (err: unknown) {
      console.error(
        "[handleDeactivate] Terjadi kesalahan saat menonaktifkan item",
      );
    }
  };

  const handleReactivate = async () => {
    if (!itemId) return;
    const itemIdToUse =
      realItemId || sessionStorage.getItem(`real-item-id-${itemId}`);
    if (!itemIdToUse) {
      console.error("[handleReactivate] No real item_id available");
      return;
    }
    try {
      await personalService.reactivateItem(itemIdToUse);
      pendingStatusRef.current = "fsrs_active";
      apiStatusRef.current = "fsrs_active";
      sessionStorage.setItem(`item-status-${itemId}`, "fsrs_active");
      setItem((prev) => (prev ? { ...prev, status: "fsrs_active" } : null));
      setIsReactivateModalOpen(false);
    } catch (err: unknown) {
      console.error(
        "[handleReactivate] Terjadi kesalahan saat mengaktifkan kembali item",
      );
    }
  };

  const getItemStatus = () => {
    return item?.status || "belum_mulai";
  };

  // Normalize 'start' → 'menghafal' for display purposes
  const getNormalizedStatus = () => {
    const s = getItemStatus();
    return s === "start" ? "menghafal" : s;
  };

  const getStatusConfig = () => {
    const status = getNormalizedStatus();

    switch (status) {
      case "menghafal":
        return {
          label: "Menghafal",
          color: "text-blue-400",
          bg: "bg-blue-500/10",
          border: "border-blue-500/20",
          icon: Brain,
          description: "Item sedang dalam tahap menghafal",
          buttonText: "Mulai Ujian Interval",
          buttonAction: () => setIsActivateFsrsModalOpen(true),
          isLoading: isActivatingFsrs,
        };
      case "fsrs_active":
        return {
          label: "Ujian Interval",
          color: "text-purple-400",
          bg: "bg-purple-500/10",
          border: "border-purple-500/20",
          icon: Target,
          description: "Item sedang dalam ujian interval (FSRS aktif)",
          buttonText: "Luluskan Item Ini",
          buttonAction: () => setIsDeactivateModalOpen(true),
          isDisabled: false,
          isLoading: false,
        };
      case "graduate":
      case "inactive":
        return {
          label: "Lulus",
          color: "text-emerald-400",
          bg: "bg-emerald-500/10",
          border: "border-emerald-500/20",
          icon: CheckCircle2,
          description: "Item telah lulus dari sistem review",
          buttonText: "Aktifkan Kembali",
          buttonAction: () => setIsReactivateModalOpen(true),
          isDisabled: false,
          isLoading: false,
        };
      default:
        return {
          label: "Belum Mulai",
          color: "text-gray-400",
          bg: "bg-gray-500/10",
          border: "border-gray-500/20",
          icon: Brain,
          description: "Mulai menghafal item ini untuk pertama kali",
          buttonText: "Mulai Menghafal",
          buttonAction: () => setIsStartModalOpen(true),
          isLoading: isStarting,
        };
    }
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  return (
    <div className="min-h-screen bg-[#090A0F] text-white font-primary selection:bg-blue-500/30">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-15%] right-[-10%] w-[700px] h-[700px] bg-blue-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[120px]" />
      </div>

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={() => setIsSidebarOpen(false)}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Top nav */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2.5 rounded-2xl border border-white/5 hover:border-white/20 bg-white/5 hover:bg-white/10 transition-all duration-300 backdrop-blur-xl shadow-lg text-gray-400 hover:text-white"
          >
            <LayoutList className="w-5 h-5" />
          </button>
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/15 text-gray-400 hover:text-white transition-all duration-300 text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Kembali</span>
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-40 gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-3xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
              </div>
              <div className="absolute inset-0 bg-blue-500/10 rounded-3xl blur-xl animate-pulse" />
            </div>
            <p className="text-gray-500 text-sm animate-pulse">
              Memuat detail item...
            </p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-40 gap-4">
            <div className="w-16 h-16 rounded-3xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-rose-400" />
            </div>
            <p className="text-rose-400 text-sm font-medium">{error}</p>
            <button
              onClick={() => bookId && fetchBookTree(bookId)}
              className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-medium text-gray-300 hover:text-white transition"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {/* Not Found */}
        {!loading && !error && !item && tree && (
          <div className="flex flex-col items-center justify-center py-40 gap-4">
            <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-amber-400" />
            </div>
            <p className="text-amber-400 text-sm font-medium">
              Item tidak ditemukan
            </p>
            <button
              onClick={() => window.history.back()}
              className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-medium text-gray-300 hover:text-white transition"
            >
              Kembali
            </button>
          </div>
        )}

        {/* Item Detail Content */}
        {!loading && !error && item && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Hero Card */}
            <div className="relative rounded-[2.5rem] overflow-hidden border border-white/5 bg-[#0E1420] shadow-[0_30px_60px_-20px_rgba(0,0,0,0.8)]">
              <div className="absolute top-0 inset-x-0 h-px bg-linear-to-r from-transparent via-blue-500/40 to-transparent" />

              <div className="px-8 sm:px-10 py-8">
                {/* Status Badge */}
                <div className="flex items-center justify-between mb-6">
                  <div
                    className={`flex items-center gap-2 px-4 py-2 rounded-full ${statusConfig.bg} border ${statusConfig.border} backdrop-blur-xl`}
                  >
                    <StatusIcon className={`w-4 h-4 ${statusConfig.color}`} />
                    <span
                      className={`text-xs font-bold tracking-widest uppercase ${statusConfig.color}`}
                    >
                      {statusConfig.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Flame className="w-4 h-4 text-amber-400" />
                    <span className="text-amber-400 font-bold">
                      {item.review_count ?? 0}x
                    </span>
                    <span>review</span>
                  </div>
                </div>

                {/* Question & Answer */}
                <div className="space-y-4">
                  {itemImage && (
                    <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5">
                      <div className="flex items-center gap-2 border-b border-white/5 px-5 py-3">
                        <Image className="h-4 w-4 text-cyan-400" />
                        <span className="text-xs font-bold uppercase tracking-wider text-cyan-300">
                          Gambar Item
                        </span>
                      </div>
                      <img
                        src={itemImage}
                        alt={item.content || "Gambar item"}
                        className="max-h-[420px] w-full object-contain bg-black/20"
                      />
                    </div>
                  )}

                  {/* Question */}
                  <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-2 mb-3">
                      <FileText className="w-5 h-5 text-blue-400" />
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                        Pertanyaan
                      </span>
                    </div>
                    <p className="text-lg text-white leading-relaxed whitespace-pre-wrap">
                      {item.content}
                    </p>
                  </div>

                  {/* Answer */}
                  <div className="p-5 rounded-2xl bg-linear-to-br from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20">
                    <div className="flex items-center gap-2 mb-3">
                      <Lock className="w-5 h-5 text-emerald-400" />
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                        Jawaban
                      </span>
                    </div>
                    <p className="text-lg text-emerald-100 leading-relaxed whitespace-pre-wrap">
                      {item.answer}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons - Edit & Delete */}
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-linear-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-base transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(59,130,246,0.3)]"
              >
                <PenSquare className="w-5 h-5 fill-current" />
                Edit Item
              </button>
              <button
                onClick={() => setIsDeleteModalOpen(true)}
                className="flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-linear-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-base transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(244,63,94,0.3)]"
              >
                <Trash2 className="w-5 h-5 fill-current" />
                Hapus Item
              </button>
            </div>

            {/* Action Section - Hafalan Stages */}
            <div className="relative rounded-[2.5rem] overflow-hidden border border-white/5 bg-[#0E1420]">
              <div className="absolute top-0 inset-x-0 h-px bg-linear-to-r from-transparent via-emerald-500/30 to-transparent" />

              <div className="px-6 sm:px-8 py-6 sm:py-7 border-b border-white/5">
                <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2.5">
                  <Brain className="w-5 h-5 text-emerald-400" />
                  Tahapan Hafalan
                </h2>
                <p className="text-gray-500 text-xs sm:text-sm mt-1">
                  {statusConfig.description}
                </p>
              </div>

              {/* Graduated banner */}
              {(getNormalizedStatus() === "inactive" ||
                getNormalizedStatus() === "graduate") && (
                <div className="mx-4 sm:mx-8 mt-6 rounded-2xl overflow-hidden border border-emerald-500/30 bg-linear-to-br from-emerald-500/10 to-cyan-500/5">
                  <div className="px-5 py-4 flex items-center gap-4">
                    <div className="text-3xl">🎓</div>
                    <div>
                      <p className="text-emerald-300 font-black text-base">
                        Item Ini Sudah Lulus!
                      </p>
                      <p className="text-emerald-400/60 text-xs mt-0.5">
                        Hafalan kamu untuk item ini sudah sangat kuat.
                        Pertahankan terus!
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="p-4 sm:p-8">
                {/* Progress Steps - Mobile: Horizontal Scroll, Desktop: Flex */}
                <div className="mb-6 sm:mb-8">
                  {/* Desktop View - Hidden on Mobile */}
                  <div className="hidden sm:block relative">
                    <div className="flex items-center justify-between mb-8 relative">
                      {/* Progress Line */}
                      <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-700">
                        <div
                          className="h-full bg-linear-to-r from-emerald-500 to-cyan-500 transition-all duration-500"
                          style={{
                            width:
                              getNormalizedStatus() === "belum_mulai"
                                ? "0%"
                                : getNormalizedStatus() === "menghafal"
                                  ? "35%"
                                  : getNormalizedStatus() === "fsrs_active"
                                    ? "65%"
                                    : "100%",
                          }}
                        />
                      </div>

                      {/* Steps */}
                      {[
                        { key: "belum_mulai", label: "Mulai", icon: Play },
                        { key: "menghafal", label: "Menghafal", icon: Brain },
                        { key: "fsrs_active", label: "Ujian", icon: Target },
                        { key: "graduate", label: "Lulus", icon: CheckCircle2 },
                      ].map((step) => {
                        const status = getNormalizedStatus();
                        const phases = [
                          "belum_mulai",
                          "menghafal",
                          "fsrs_active",
                          "graduate",
                        ];
                        const currentIndex = phases.indexOf(status);
                        const stepIndex = phases.indexOf(step.key);

                        const isActive = status === step.key;
                        const isCompleted = currentIndex > stepIndex;

                        return (
                          <div
                            key={step.key}
                            className="relative z-10 flex flex-col items-center gap-2"
                          >
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                                isActive
                                  ? "bg-emerald-500 border-emerald-400 text-white scale-110 shadow-lg shadow-emerald-500/30"
                                  : isCompleted
                                    ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400"
                                    : "bg-gray-800 border-gray-600 text-gray-500"
                              }`}
                            >
                              <step.icon className="w-5 h-5" />
                            </div>
                            <span
                              className={`text-xs font-bold uppercase tracking-wider ${
                                isActive
                                  ? "text-emerald-400"
                                  : isCompleted
                                    ? "text-emerald-400/70"
                                    : "text-gray-600"
                              }`}
                            >
                              {step.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Mobile View */}
                  <div className="sm:hidden">
                    <div className="flex items-start justify-center gap-4 flex-wrap pt-2">
                      {[
                        { key: "belum_mulai", label: "Mulai", icon: Play },
                        { key: "menghafal", label: "Menghafal", icon: Brain },
                        { key: "fsrs_active", label: "Ujian", icon: Target },
                        { key: "graduate", label: "Lulus", icon: CheckCircle2 },
                      ].map((step, idx, arr) => {
                        const status = getNormalizedStatus();
                        const phases = [
                          "belum_mulai",
                          "menghafal",
                          "fsrs_active",
                          "graduate",
                        ];
                        const currentIndex = phases.indexOf(status);
                        const stepIndex = phases.indexOf(step.key);

                        const isActive = status === step.key;
                        const isCompleted = currentIndex > stepIndex;

                        return (
                          <div
                            key={step.key}
                            className="flex flex-col items-center gap-2 min-w-[60px]"
                          >
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                                isActive
                                  ? "bg-emerald-500 border-emerald-400 text-white shadow-lg shadow-emerald-500/30"
                                  : isCompleted
                                    ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400"
                                    : "bg-gray-800 border-gray-600 text-gray-500"
                              }`}
                            >
                              <step.icon className="w-4 h-4" />
                            </div>
                            <span
                              className={`text-[10px] font-bold uppercase tracking-wider text-center ${
                                isActive
                                  ? "text-emerald-400"
                                  : isCompleted
                                    ? "text-emerald-400/70"
                                    : "text-gray-600"
                              }`}
                            >
                              {step.label}
                            </span>
                            {/* Connector Line */}
                            {idx < arr.length - 1 && (
                              <div className="absolute top-14 left-10 w-8 h-0.5 bg-gray-700 -z-10">
                                {isCompleted ||
                                (isActive && idx < currentIndex) ? (
                                  <div className="h-full bg-emerald-500 w-full" />
                                ) : null}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                {(() => {
                  if (statusConfig.buttonAction && !statusConfig.isDisabled) {
                    return (
                      <button
                        onClick={statusConfig.buttonAction}
                        disabled={statusConfig.isLoading}
                        className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-linear-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold text-base transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                      >
                        {statusConfig.isLoading ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Play className="w-5 h-5 fill-current" />
                        )}
                        {statusConfig.isLoading
                          ? "Memproses..."
                          : statusConfig.buttonText}
                      </button>
                    );
                  }
                  return (
                    <div className="text-center p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                      <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                      <p className="text-emerald-100 font-medium mb-1">
                        {statusConfig.buttonText}
                      </p>
                      <p className="text-emerald-400/70 text-sm">
                        Terus pertahankan hafalanmu!
                      </p>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Start Hafalan Modal */}
      {isStartModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div
            className="absolute inset-0 bg-black/75 backdrop-blur-md"
            onClick={() => setIsStartModalOpen(false)}
          />
          <div className="relative z-10 w-full max-w-lg animate-in fade-in zoom-in-95 duration-300">
            <div className="absolute -inset-px rounded-[2.5rem] bg-linear-to-br from-emerald-500/30 via-cyan-500/20 to-transparent blur-sm pointer-events-none" />
            <div className="relative rounded-[2.5rem] sm:rounded-[2.5rem] bg-[#0E1420] border border-white/10 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.9)] overflow-hidden p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
              <div className="text-center">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
                  <Brain className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-400" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
                  Mulai Menghafal?
                </h3>
                <p className="text-gray-400 text-xs sm:text-sm mb-6 leading-relaxed">
                  Apakah Anda yakin ingin memulai menghafal item ini? Setelah
                  dimulai, item akan masuk ke sistem interval review.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => setIsStartModalOpen(false)}
                    disabled={isStarting}
                    className="flex-1 px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white text-sm font-medium transition disabled:opacity-50 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleStartPhase}
                    disabled={isStarting}
                    className="flex-1 px-5 py-3 rounded-xl bg-linear-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white text-sm font-bold transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isStarting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Memproses...
                      </>
                    ) : (
                      "Ya, Mulai"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Interval Modal */}
      {isIntervalModalOpen && item && (
        <IntervalModal
          isOpen={isIntervalModalOpen}
          onClose={() => setIsIntervalModalOpen(false)}
          itemTitle={item.title}
          onSubmit={handleIntervalSubmit}
          isLoading={isStartingInterval}
        />
      )}

      {/* Activate FSRS Confirm Modal */}
      <ConfirmModal
        isOpen={isActivateFsrsModalOpen}
        onClose={() => setIsActivateFsrsModalOpen(false)}
        onConfirm={handleActivateFsrsPhase}
        title="Mulai Ujian Interval?"
        message="Apakah Anda yakin ingin memulai ujian interval? Item akan masuk ke sistem FSRS untuk review terjadwal."
        confirmText="Ya, Mulai"
        cancelText="Tidak"
        icon={Target}
        variant="info"
      />

      {/* Deactivate (Graduate) Confirm Modal */}
      <ConfirmModal
        isOpen={isDeactivateModalOpen}
        onClose={() => setIsDeactivateModalOpen(false)}
        onConfirm={handleDeactivate}
        title="Luluskan Item Ini?"
        message="Item akan ditandai sebagai lulus dan tidak akan muncul di review harian. Anda bisa mengaktifkannya kembali kapan saja."
        confirmText="Ya, Luluskan"
        cancelText="Batal"
        icon={CheckCircle2}
        variant="success"
      />

      {/* Reactivate Confirm Modal */}
      <ConfirmModal
        isOpen={isReactivateModalOpen}
        onClose={() => setIsReactivateModalOpen(false)}
        onConfirm={handleReactivate}
        title="Aktifkan Kembali?"
        message="Item akan dikembalikan ke fase ujian interval dan akan muncul kembali di review harian."
        confirmText="Ya, Aktifkan"
        cancelText="Batal"
        icon={Target}
        variant="info"
      />

      {/* Edit Item Modal */}
      {isEditModalOpen && item && (
        <EditItemModal
          isOpen={isEditModalOpen}
          item={item}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteSuccess}
        title="Hapus Item?"
        message="Apakah Anda yakin ingin menghapus item ini? Tindakan ini tidak dapat dibatalkan dan item akan dihapus secara permanen."
        confirmText="Ya, Hapus"
        cancelText="Batal"
        icon={AlertTriangle}
        variant="danger"
      />
    </div>
  );
};

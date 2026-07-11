import { useState, useEffect, useCallback, useRef } from "react";
import type { MyItemDetail } from "@/features/alquran/types/quran.types";
import { StartIntervalModal } from "@/features/alquran/components/StartIntervalModal";
import { ItemDetailActionSection } from "@/features/alquran/components/item-detail/ItemDetailActionSection";
import { ItemDetailHero } from "@/features/alquran/components/item-detail/ItemDetailHero";
import { useActivateFsrs } from "@/features/alquran/hooks/useActivateFsrs";
import { alquranService } from "@/features/alquran/services/alquran.services";
import { EditItemModal } from "@/features/alquran/components/EditItemModal";
import { DeleteConfirmModal } from "@/features/alquran/components/DeleteConfirmModal";
import { SuccessModal } from "@/features/alquran/components/SuccessModal";
import {
  getActionConfig,
  getInitialPhase,
  getStatusDisplayByPhase,
  getStatusStyleByPhase,
  parseContentRef,
  type ActionPhase,
} from "@/features/alquran/components/item-detail/ItemDetailView.config";

export type { ActionPhase };

interface ItemDetailViewProps {
  item: MyItemDetail;
  juzIndex: number;
  backToJuzDetail: () => void;
  currentPhase?: ActionPhase;
  onPhaseChange: (phase: ActionPhase) => void;
  onRedirect?: () => void;
}

export const ItemDetailView = ({
  item,
  juzIndex,
  backToJuzDetail,
  currentPhase,
  onPhaseChange,
  onRedirect,
}: ItemDetailViewProps) => {
  const phase = currentPhase ?? getInitialPhase(item.status);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<MyItemDetail>(item);
  const itemIdRef = useRef<string>(item.item_id);
  const refreshTimeoutRef = useRef<number | null>(null);

  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState({
    title: "",
    message: "",
  });

  const {
    activateFsrs,
    loading: activateFsrsLoading,
    error: activateFsrsError,
  } = useActivateFsrs();

  const info = parseContentRef(currentItem.content_ref);
  const statusStyle = getStatusStyleByPhase(phase);
  const statusDisplay = getStatusDisplayByPhase(phase);
  const config = getActionConfig(phase);

  const createdDate = new Date(currentItem.created_at).toLocaleDateString(
    "id-ID",
    {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    },
  );

  const refreshItemData = useCallback(async () => {
    try {
      const [fsrsResponse, intervalResponse] = await Promise.all([
        alquranService.getItemsByStatus("fsrs_active"),
        alquranService.getItemsByStatus("interval"),
      ]);

      const allItems = [...fsrsResponse.data, ...intervalResponse.data];
      const foundItem = allItems.find(
        (item) => item.item_id === itemIdRef.current,
      );

      if (foundItem) {
        setCurrentItem({
          ...foundItem,
          next_review_at:
            foundItem.next_review_at ?? currentItem.next_review_at,
          review_count: foundItem.review_count ?? currentItem.review_count,
          interval_days: foundItem.interval_days ?? currentItem.interval_days,
        });
      }
    } catch (error) {
      // Error handled silently
    }
  }, [
    currentItem.next_review_at,
    currentItem.review_count,
    currentItem.interval_days,
  ]);

  useEffect(() => {
    itemIdRef.current = item.item_id;

    // Fetch interval_days on mount if not present
    if (!item.interval_days) {
      void refreshItemData();
    }
  }, [item.item_id, refreshItemData]);

  // Sync currentItem with item prop when item changes
  useEffect(() => {
    setCurrentItem(item);
  }, [item]);

  useEffect(() => {
    const handleReviewComplete = (
      event: CustomEvent<{ itemId: string; delay?: number }>,
    ) => {
      if (event.detail.itemId === itemIdRef.current) {
        // Clear any pending refresh
        if (refreshTimeoutRef.current) {
          window.clearTimeout(refreshTimeoutRef.current);
        }

        // Delay refresh to ensure server has updated the data
        const delay = event.detail.delay ?? 500;
        refreshTimeoutRef.current = window.setTimeout(() => {
          void refreshItemData();
        }, delay);
      }
    };

    window.addEventListener(
      "alquran:item-reviewed",
      handleReviewComplete as EventListener,
    );

    return () => {
      if (refreshTimeoutRef.current) {
        window.clearTimeout(refreshTimeoutRef.current);
      }
      window.removeEventListener(
        "alquran:item-reviewed",
        handleReviewComplete as EventListener,
      );
    };
  }, [refreshItemData]);

  const transitionTo = (newPhase: ActionPhase) => {
    onPhaseChange(newPhase);
  };

  const handleActionClick = async () => {
    switch (phase) {
      case "menghafal":
        transitionTo("interval_start");
        break;
      case "interval_start":
        setIsModalOpen(true);
        break;
      case "interval_end":
      case "terjaga":
      case "graduate":
        if (onRedirect) {
          onRedirect();
        } else if (config.href) {
          window.location.href = config.href;
        }
        break;
      default:
        break;
    }
  };

  const handleSecondaryActionClick = async () => {
    if (phase !== "interval_end") return;

    try {
      await activateFsrs(item.item_id);
      transitionTo("terjaga");
    } catch {
      // Error ditampilkan di action section.
    }
  };

  const handleIntervalSuccess = () => {
    transitionTo("interval_end");
  };

  const handleEditSuccess = (updatedData: {
    ContentRef: string;
    NextReviewAt: string | null;
    ReviewCount: number;
    IntervalDays: number;
  }) => {
    // Update currentItem directly with API response data
    setCurrentItem((prev) => {
      const newItem = {
        ...prev,
        content_ref: updatedData.ContentRef,
        next_review_at: updatedData.NextReviewAt ?? prev.next_review_at,
        review_count: updatedData.ReviewCount,
        interval_days: updatedData.IntervalDays,
      };
      return newItem;
    });

    // Show success modal
    setSuccessMessage({
      title: "Item Berhasil Diedit",
      message: "Data hafalan telah diperbarui",
    });
    setIsSuccessModalOpen(true);
  };

  const handleDeleteSuccess = () => {
    // Navigate back to juz detail after successful deletion
    backToJuzDetail();
  };

  return (
    <div className="animate-fadeIn pb-20 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <ItemDetailHero
        juzIndex={juzIndex}
        info={info}
        statusStyle={statusStyle}
        onBack={backToJuzDetail}
      />

      <ItemDetailActionSection
        phase={phase}
        config={config}
        statusDisplay={statusDisplay}
        onPrimaryAction={handleActionClick}
        onSecondaryAction={handleSecondaryActionClick}
        secondaryActionDisabled={activateFsrsLoading}
        secondaryActionLabel={
          activateFsrsLoading ? "Mengaktifkan..." : undefined
        }
        secondaryActionError={activateFsrsError}
        onEditClick={() => setIsEditModalOpen(true)}
        onDeleteClick={() => setIsDeleteModalOpen(true)}
      />

      <StartIntervalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        itemId={currentItem.item_id}
        itemTitle={`${info.title} – ${info.subtitle}`}
        onSuccess={handleIntervalSuccess}
      />

      <EditItemModal
        isOpen={isEditModalOpen}
        itemId={currentItem.item_id}
        contentRef={currentItem.content_ref}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={handleEditSuccess}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        itemId={currentItem.item_id}
        contentRef={currentItem.content_ref}
        onClose={() => setIsDeleteModalOpen(false)}
        onSuccess={handleDeleteSuccess}
      />

      <SuccessModal
        isOpen={isSuccessModalOpen}
        title={successMessage.title}
        message={successMessage.message}
        onClose={() => setIsSuccessModalOpen(false)}
      />
    </div>
  );
};

import { api } from "@/lib/axios";
import type {
  ActivateFsrsResponse,
  ClassJuzCreateResponse,
  CreateJuzItemPayload,
  CreateJuzItemResponse,
  CreateJuzResponse,
  DailyTask,
  DailyTasksResponse,
  DailyGenerateResponse,
  GetJuzResponse,
  MyItemsQuranResponse,
  ReviewIntervalPayload,
  ReviewIntervalResponse,
  ReviewFsrsPayload,
  ReviewFsrsResponse,
  StartIntervalPayload,
  StartIntervalResponse,
  ItemsByStatusResponse,
  RawItemByStatus,
  JuzToggleActiveResponse,
  UpdateItemPayload,
  UpdateItemResponse,
  DeleteItemResponse,
  EditIntervalDaysPayload,
  EditIntervalDaysResponse,
} from "@/features/alquran/types/quran.types";

export interface UserProgressResponse {
  status: number;
  message: string;
  data: {
    completed_juz: number[];
  };
  timestamp: string;
  path: string;
}

export interface SaveUserProgressPayload {
  completed_juz: number[];
}

export interface SaveUserProgressResponse {
  status: number;
  message: string;
  data: {
    completed_juz: number[];
  };
  timestamp: string;
  path: string;
}

export const alquranService = {
  async createJuz(juzIndex: number): Promise<CreateJuzResponse> {
    const response = await api.post(`/api/v1/juz/${juzIndex}`);
    return response.data;
  },

  async createClassJuz(
    juzIndex: number,
    classId: string,
  ): Promise<ClassJuzCreateResponse> {
    const response = await api.post(
      `/api/v1/juz/${juzIndex}?class_id=${encodeURIComponent(classId)}`,
    );
    return response.data;
  },

  async getJuz(classId?: string): Promise<GetJuzResponse> {
    const query = classId ? `?class_id=${encodeURIComponent(classId)}` : "";
    const response = await api.get(`/api/v1/juz${query}`);
    return response.data;
  },

  async createJuzItem(
    juzId: string,
    data: CreateJuzItemPayload,
  ): Promise<CreateJuzItemResponse> {
    const response = await api.post(`/api/v1/juz/${juzId}/items`, data);
    return response.data;
  },

  async getMyItems(
    type: "quran" | "book" = "quran",
    classId?: string,
  ): Promise<MyItemsQuranResponse> {
    const classQuery = classId
      ? `&class_id=${encodeURIComponent(classId)}`
      : "";
    const response = await api.get(
      `/api/v1/my-items?type=${type}${classQuery}`,
    );
    const raw = response.data;
    if (raw?.data?.groups && Array.isArray(raw.data.groups)) {
      raw.data.groups.forEach((group: any) => {
        if (Array.isArray(group.items)) {
          group.items.forEach((item: any) => {
            if (!item.next_review_at && item.next_review) {
              item.next_review_at = item.next_review;
            }
          });
        }
      });
    }
    return raw;
  },

  async generateDaily(): Promise<DailyGenerateResponse> {
    const response = await api.post("/api/v1/daily/generate");
    return response.data;
  },

  async getDaily(group: "quran"): Promise<DailyTasksResponse> {
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    const response = await api.get(
      `/api/v1/daily?date=${dateStr}&group=${group}`,
    );
    return response.data;
  },

  async getClassDaily(classId: string): Promise<DailyTasksResponse> {
    const response = await api.get(
      `/api/v1/class-daily?class_id=${encodeURIComponent(classId)}&group=juz`,
    );
    return response.data.data;
  },

  async getClassDailyBook(classId: string): Promise<DailyTask[]> {
    const response = await api.get(
      `/api/v1/class-daily-book?class_id=${encodeURIComponent(classId)}`,
    );
    return response.data.data;
  },

  async reviewInterval(
    itemId: string,
    payload: ReviewIntervalPayload,
  ): Promise<ReviewIntervalResponse> {
    const response = await api.post(
      `/api/v1/items/${itemId}/review-interval`,
      payload,
    );
    return response.data;
  },

  // INTERVAL

  async startInterval(
    itemId: string,
    payload: StartIntervalPayload,
  ): Promise<StartIntervalResponse> {
    const response = await api.post(
      `/api/v1/items/${itemId}/start-interval`,
      payload,
    );
    return response.data;
  },

  async activateFsrs(itemId: string): Promise<ActivateFsrsResponse> {
    const response = await api.post(`/api/v1/items/${itemId}/activate-fsrs`);
    return response.data;
  },

  async reviewFsrs(
    itemId: string,
    payload: ReviewFsrsPayload,
  ): Promise<ReviewFsrsResponse> {
    const response = await api.post(`/api/v1/items/${itemId}/review`, payload);
    return response.data;
  },

  async getItemsByStatus(
    status: string,
    classId?: string,
  ): Promise<ItemsByStatusResponse> {
    const classQuery = classId
      ? `&class_id=${encodeURIComponent(classId)}`
      : "";
    const response = await api.get(
      `/api/v1/items?status=${status}${classQuery}`,
    );
    const raw = response.data;

    return {
      ...raw,
      data: raw.data.map((item: RawItemByStatus) => ({
        item_id: item.ID,
        content_ref: item.ContentRef,
        status: item.Status,
        review_count: item.ReviewCount,
        created_at: item.CreatedAt,
        next_review_at: item.NextReviewAt ?? undefined,
        last_review_at: item.LastReviewAt ?? undefined,
        interval_next_review_at: item.IntervalNextReviewAt ?? undefined,
        interval_days: item.IntervalDays,
        stability: item.Stability,
        difficulty: item.Difficulty,
        estimatedReviewSeconds: item.EstimatedReviewSeconds ?? 0,
      })),
    };
  },

  async activateJuz(juzIndex: number): Promise<JuzToggleActiveResponse> {
    const response = await api.post(`/api/v1/juz/${juzIndex}/activate`);
    return response.data;
  },

  async deactivateJuz(juzIndex: number): Promise<JuzToggleActiveResponse> {
    const response = await api.post(`/api/v1/juz/${juzIndex}/deactivate`);
    return response.data;
  },

  // User Progress (Completed Juz per User)
  async getUserProgress(): Promise<UserProgressResponse> {
    const response = await api.get("/api/v1/user/progress");
    return response.data;
  },

  async saveUserProgress(
    payload: SaveUserProgressPayload,
  ): Promise<SaveUserProgressResponse> {
    const response = await api.post("/api/v1/user/progress", payload);
    return response.data;
  },

  // Item Management
  async updateItem(
    itemId: string,
    payload: UpdateItemPayload,
  ): Promise<UpdateItemResponse> {
    const response = await api.put(`/api/v1/juz/items/${itemId}`, payload);
    return response.data;
  },

  async deleteItem(itemId: string): Promise<DeleteItemResponse> {
    const response = await api.delete(`/api/v1/juz/items/${itemId}`);
    return response.data;
  },

  async editIntervalDays(
    itemId: string,
    payload: EditIntervalDaysPayload,
  ): Promise<EditIntervalDaysResponse> {
    const response = await api.put(
      `/api/v1/items/${itemId}/interval-days`,
      payload,
    );
    return response.data;
  },
};

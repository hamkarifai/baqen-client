// CREATE JUZ

export interface CreateJuzResponse {
  status: number;
  message: string;
  data: DataJuz;
  timestamp: string;
  path: string;
}

export interface ClassJuzCreateResponse {
  status: number;
  message: string;
  data: {
    id: string;
    user_id: string;
    index: number;
    is_active: boolean;
    is_done: boolean;
    created_at: string;
    updated_at: string;
  };
  timestamp: string;
  path: string;
}

export interface DataJuz {
  ID: string;
  UserID: string;
  Index: number;
  CreatedAt: string;
}

export interface GetJuzResponse {
  status: number;
  message: string;
  data: CardJuzData[];
}

export interface CardJuzData {
  juz_id: string;
  class_id?: string;
  juz_index: number;
  is_active?: boolean;
  is_done?: boolean;
  done_at?: string | null;
  total_items: number;
  menghafal: number;
  interval: number;
  fsrs_active: number;
  graduate: number;
  active: boolean;
}

export interface CreateJuzItemResponse {
  status: number;
  message: string;
  data: DataJuzItem;
  timestamp: string;
  path: string;
}

export interface DataJuzItem {
  item_id: string;
  juz_id: string;
  source_stype: string;
  content_ref: string;
  status: string;
}

export interface CreateJuzItemPayload {
  mode: string;
  content_ref: string;
  estimate_value?: number;
  estimate_unit?: string;
}

export interface DailyGenerateResponse {
  count: number;
  task_date: string;
}

export interface DailyTask {
  item_id: string;
  source: string;
  state: string;
  task_date: string;
  content_ref: string;
  juz_index: number;
  status?: string;
  estimated_review_seconds?: number;
  book_title?: string;
  image_url?: string;
}

export interface DailyTaskGroup {
  juz_index: number;
  items: DailyTask[];
}

export type DailyTasksResponse = DailyTaskGroup[];

export interface ReviewIntervalPayload {
  rating: 1 | 2 | 3;
}

export interface ReviewIntervalResult {
  item_id: string;
  status: string;
  rating: number;
  rating_label: string;
  interval_days: number;
  interval_next_review_at: string;
  review_count: number;
  content_ref: string;
}

export interface ReviewIntervalResponse {
  status: number;
  message: string;
  data: ReviewIntervalResult;
  timestamp: string;
  path: string;
}

// Start Interval
export interface StartIntervalPayload {
  interval_days: number;
}

export interface StartIntervalResponse {
  status: number;
  message: string;
  error: string;
  status_code: number;
  timestamp?: string;
  path?: string;
}

// Activate FSRS
export interface ActivateFsrsResponse {
  status: number;
  message: string;
  data: Record<string, unknown>;
  timestamp?: string;
  path?: string;
}

// Review FSRS (for fsrs_active items)
export interface ReviewFsrsPayload {
  rating: 1 | 2 | 3 | 4;
}

export interface ReviewFsrsResponse {
  status: number;
  message: string;
  data: Record<string, unknown>;
  timestamp?: string;
  path?: string;
}

// Update Item
export interface UpdateItemPayload {
  mode: "surah" | "page";
  content_ref: string;
  estimate_value: number;
  estimate_unit: "minutes" | "seconds";
}

export interface UpdateItemResponse {
  status: number;
  message: string;
  data: {
    ID: string;
    OwnerID: string;
    SourceType: string;
    ContentRef: string;
    Status: string;
    IntervalDays: number;
    IntervalStartAt: string;
    IntervalEndAt: string | null;
    IntervalNextReviewAt: string;
    Stability: number;
    Difficulty: number;
    ReviewCount: number;
    LastReviewAt: string | null;
    NextReviewAt: string;
    ApprovedBy: string | null;
    ApprovedAt: string | null;
    FSRSStartAt: string | null;
    EstimatedReviewSeconds: number;
    CreatedAt: string;
  };
  timestamp: string;
  path: string;
}

// Delete Item
export interface DeleteItemResponse {
  status: number;
  message: string;
  timestamp: string;
  path: string;
}

// Edit Interval Days
export interface EditIntervalDaysPayload {
  interval_days: number;
}

export interface EditIntervalDaysResponse {
  status: number;
  message: string;
  data: {
    ID: string;
    OwnerID: string;
    SourceType: string;
    ContentRef: string;
    Status: string;
    IntervalDays: number;
    IntervalStartAt: string;
    IntervalEndAt: string | null;
    IntervalNextReviewAt: string;
    Stability: number;
    Difficulty: number;
    ReviewCount: number;
    LastReviewAt: string | null;
    NextReviewAt: string | null;
    ApprovedBy: string | null;
    ApprovedAt: string | null;
    FSRSStartAt: string | null;
    EstimatedReviewSeconds: number;
    CreatedAt: string;
  };
  timestamp: string;
  path: string;
}

// My Items API Response

export interface MyItemDetail {
  item_id: string;
  content_ref: string;
  status: string;
  review_count: number;
  created_at: string;
  next_review_at: string; // Next review schedule
  next_review?: string;
  interval_days?: number;
}

export interface QuranGroup {
  juz_index: number;
  juz_id: string;
  class_id?: string | null;
  item_count: number;
  items: MyItemDetail[];
}

export interface MyItemsQuranResponse {
  status: number;
  message: string;
  data: {
    type: string;
    groups: QuranGroup[];
  };
}

// Items by Status API Response (for fsrs_active, etc.)
export interface ItemByStatus {
  item_id: string;
  content_ref: string;
  status: string;
  review_count: number;
  created_at: string;
  next_review_at?: string;
  last_review_at?: string;
  interval_next_review_at?: string;
  interval_days: number;
  stability: number;
  difficulty: number;
  estimatedReviewSeconds?: number;
}

export interface RawItemByStatus {
  ID: string;
  ContentRef: string;
  Status: string;
  ReviewCount: number;
  CreatedAt: string;
  NextReviewAt: string | null;
  LastReviewAt: string | null;
  IntervalNextReviewAt: string | null;
  IntervalDays: number;
  Stability: number;
  Difficulty: number;
  EstimatedReviewSeconds?: number;
}


export interface ItemsByStatusResponse {
  status: number;
  message: string;
  data: ItemByStatus[];
  timestamp: string;
  path: string;
}

// Juz Activate/Deactivate Response
export interface JuzToggleActiveResponse {
  status: number;
  message: string;
  data: {
    active: boolean;
    index: number;
  };
  timestamp: string;
  path: string;
}

// Lifecycle statistics
export interface LifecycleStats {
  menghafal: number;
  murajaah: number;
  terjaga: number;
  selesai: number;
}

// Enum for item lifecycle status
// Item lifecycle status type
export type ItemStatus =
  | "new"
  | "memorizing"
  | "consolidation"
  | "active"
  | "maintenance"
  | "graduated";

// Surah information
export interface SurahInfo {
  n: string; // Name
  a: number; // Total ayat
}

// Juz page range
export interface JuzPageRange {
  min: number;
  max: number;
}

// Material (Juz/Surah metadata)
export interface Material {
  id: string;
  type: "quran";
  title: string;
  meta: {
    juz: string;
  };
}

// Main Quran item
export interface QuranItem {
  id_system: string;
  id_visual: number;
  material_id: string;
  range: {
    ayat: string; // e.g., "1-7"
    page: string; // e.g., "1-2"
  };
  time: {
    value: number;
    unit: string;
  };
  status: ItemStatus;
  consolidationDays: number;
  activeStage: number;
  stageStreak: number;
  lastReview: number | null;
  nextReview: number | null;
  fingerprint: string;
}

// Database structure
export interface QuranDatabase {
  version: number;
  items: QuranItem[];
  materials: Record<string, Material>;
}

// Draft for creating new item
export interface QuranDraft {
  juz: string;
  surahIdx: string;
  surahName: string;
  ayatStart: number;
  ayatEnd: number;
  pageStart: number;
  pageEnd: number;
  time: number;
}

/// CLASSROOM TYPES

import type { Book } from "@/features/personal/types/personal.types";

export interface ClassItem {
  id: string;
  guru_id: string;
  name: string;
  description: string;
  cover_image?: string | null;
  class_code: string;
  type: "book" | "quran";
  is_active: boolean;
  owner_name: string;
  student_count: number;
  book_count: number;
  created_at: string;
  updated_at: string;
}

export interface CreateClassPayload {
  name: string;
  description: string;
  type: "book" | "quran";
  cover_image?: File | string;
}

export interface JoinClassPayload {
  code: string;
}

export interface UpdateClassPayload {
  name?: string;
  description?: string;
  type: "book" | "quran";
  cover_image?: File | string;
}

/// CLASSROOM CARD

export type ClassroomCardTone =
  | "blue"
  | "emerald"
  | "amber"
  | "violet"
  | "rose"
  | "indigo"
  | "teal"
  | "cyan"
  | "fuchsia"
  | "pink"
  | "yellow"
  | "lime"
  | "gray";

export interface ClassroomCardProps {
  id?: string;
  title: string;
  description?: string;
  classCode?: string;
  teacherName?: string;
  memberCount: number;
  type: string;
  bookCount: number;
  nextSessionLabel?: string;
  status?: "active" | "draft" | "archived";
  tone?: ClassroomCardTone;
  coverImage?: string | null;
  onClick?: () => void;
  onMenuClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export interface CreateClassButtonProps {
  onClick?: () => void;
}

// GET CLASS MEMBER

export type ClassMember = {
  user_id: string;
  email: string;
  full_name: string;
  joined_at: string;
};

// GET CLASS BOOK

export type GetClassBook = {
  id: string;
  class_id: string;
  book_id: string;
  order: number;
  created_at: string;
  book: Book;
};

// REMOVE BOOK FROM CLASS

export type RemoveBookFromClassResponse = {
  status: number;
  message: string;
  timestamp: string;
  path: string;
};

// GRADUATION

export type PendingGraduation = {
  item_id: string;
  content_ref: string;
  student_id: string;
  student_email: string;
  student_name: string;
  created_at: string;
  stability: string;
  last_interval_days: number;
};

export type GraduationActionResponse = {
  status: number;
  message: string;
  timestamp: string;
  path: string;
};

// STUDENT PROGRESS (TEACHER - QURAN CLASS)

export type StudentProgressItem = {
  item_id: string;
  content_ref: string;
  status:
    | "start"
    | "menghafal"
    | "interval"
    | "fsrs_active"
    | "pending_graduate"
    | "graduate"
    | "inactive";
  created_at: string;
};

export type StudentProgress = {
  user_id: string;
  email: string;
  full_name: string;
  total_items: number;
  start: number;
  menghafal: number;
  interval: number;
  fsrs_active: number;
  pending_graduate: number;
  graduate: number;
  inactive: number;
  progress_pct: number;
  items: StudentProgressItem[];
};

// CLASS BOOK STUDENT PROGRESS (TEACHER - BOOK CLASS)

export type StudentBookItemProgress = {
  item_id: string;
  book_item_id: string;
  title: string;
  status: string;
  stability: string;
  review_interval_days?: number;
  fsrs_stability_days: number;
  review_count: number;
  last_review_at?: string;
  next_review_at?: string;
};

export type StudentBookProgress = {
  user_id: string;
  email: string;
  full_name: string;
  total_items: number;
  start: number;
  menghafal: number;
  interval: number;
  fsrs_active: number;
  pending_graduate: number;
  graduate: number;
  inactive: number;
  total_unreviewed: number;
  total_fsrs_active: number;
  total_inactive: number;
  average_stability: number;
  average_started_stability: number;
  items: StudentBookItemProgress[];
};

export type ClassBookStudentProgress = {
  class_id: string;
  book_id: string;
  book_title: string;
  total_book_items: number;
  students: StudentBookProgress[];
};

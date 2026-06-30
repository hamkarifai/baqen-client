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

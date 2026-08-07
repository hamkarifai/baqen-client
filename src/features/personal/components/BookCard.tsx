import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  MoreVertical,
  Edit2,
  Trash2,
  Calendar,
  Box,
  MoreHorizontalIcon,
} from "lucide-react";
import type { Book } from "../types/personal.types";
import { useRemoveBookFromClass } from "@/features/classroom/hooks/useClassroom";
import { toast } from "sonner";

export interface BookCardProps {
  book: Book;
  showMenu?: boolean;
  classroomId?: string;
  onClick?: () => void;
  onEdit?: (book: Book) => void;
  onDelete?: (book: Book) => void;
}

export const BookCard = ({
  book,
  showMenu,
  classroomId,
  onClick,
  onEdit,
  onDelete,
}: BookCardProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, right: 0 });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const removeBookMutation = useRemoveBookFromClass();

  const btnRef = useRef<HTMLButtonElement>(null);

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!classroomId) return;
    
    setIsDropdownOpen(false);
    setMenuOpen(false);
    const toastId = toast.loading("Menghapus buku dari kelas...");

    removeBookMutation.mutate(
      { classId: classroomId, bookId: book.id },
      {
        onSuccess: () => {
          toast.success("Buku berhasil dihapus dari kelas!", {
            id: toastId,
            duration: 3000,
          });
        },
        onError: (err: any) => {
          toast.error(
            err?.response?.data?.message || err?.message || "Gagal menghapus buku dari kelas.",
            {
              id: toastId,
              duration: 4000,
            }
          );
        },
      }
    );
  };

  const formattedDate = new Date(book.created_at).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const menuRef = useRef<HTMLDivElement>(null);

  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!menuOpen && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setMenuPos({
        top: rect.bottom + 6,
        right: window.innerWidth - rect.right,
      });
    }
    setMenuOpen((prev) => !prev);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setMenuOpen(false);
    onEdit?.(book);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setMenuOpen(false);
    onDelete?.(book);
  };

  // Close on outside click — use mousedown so it fires before the click
  // event that opened the menu has finished bubbling, preventing instant close.
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (btnRef.current?.contains(e.target as Node)) return;
      if (menuRef.current?.contains(e.target as Node)) return;
      setMenuOpen(false);
    };
    const id = setTimeout(() => {
      document.addEventListener("click", handler, true);
    }, 0);
    return () => {
      clearTimeout(id);
      document.removeEventListener("click", handler, true);
    };
  }, [menuOpen]);

  const hasMenuActions = Boolean(onEdit || onDelete || (showMenu && classroomId));

  return (
    <div
      onClick={onClick}
      className="relative flex flex-col justify-between overflow-hidden group 
                 rounded-2xl sm:rounded-[2.5rem] bg-linear-to-b from-[#1E2736] to-[#0A0D14] 
                 border border-white/5 hover:border-white/10 
                 transition-all duration-700 min-h-[200px] sm:min-h-[320px]
                 hover:-translate-y-1 hover:shadow-[0_20px_40px_-20px_rgba(0,0,0,0.8)] 
                 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] cursor-pointer"
    >
      {/* Ambient effects */}
      <div className="absolute top-0 inset-x-0 h-px bg-linear-to-r from-transparent via-blue-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
      <div className="absolute -inset-10 bg-blue-500/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000 rounded-full pointer-events-none" />

      {/* Three-dot button — inside card, z-20 */}
      {hasMenuActions && (
        <button
          ref={btnRef}
          type="button"
          onClick={toggleMenu}
          className="absolute top-3 right-3 z-20 w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full bg-black/50 backdrop-blur-xl border border-white/15 shadow-lg text-gray-300 hover:text-white hover:bg-white/20 transition-all duration-300 cursor-pointer"
        >
          <MoreVertical className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
      )}

      {/* Dropdown via portal — never clipped */}
      {menuOpen &&
        createPortal(
          <div
            ref={menuRef}
            className="fixed w-44 bg-[#161D26]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.8)] overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            style={{ top: menuPos.top, right: menuPos.right, zIndex: 9999 }}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
          >
            {onEdit && (
              <button
                type="button"
                onClick={handleEdit}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-200 hover:text-white hover:bg-blue-500/20 transition-colors text-left cursor-pointer"
              >
                <Edit2 className="w-4 h-4 text-blue-400" />
                <span>Edit Buku</span>
              </button>
            )}
            {onEdit && (onDelete || (showMenu && classroomId)) && (
              <div className="w-full h-px bg-white/5" />
            )}
            {onDelete && (
              <button
                type="button"
                onClick={handleDelete}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors text-left cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Hapus Buku</span>
              </button>
            )}
            {showMenu && classroomId && (
              <button
                type="button"
                onClick={handleRemove}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors text-left cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Hapus dari Kelas</span>
              </button>
            )}
          </div>,
          document.body,
        )}

      {/* Image header */}
      <div className="relative h-28 sm:h-48 w-full shrink-0 flex items-center justify-center bg-[#0A0D14]">
        <div className="absolute bottom-0 inset-x-0 h-24 bg-linear-to-t from-[#0A0D14] to-transparent z-10 pointer-events-none" />

        {book.cover_image ? (
          <img
            src={book.cover_image}
            alt={book.title}
            className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)]"
          />
        ) : (
          <div className="absolute inset-0 w-full h-full bg-linear-to-t from-[#0A0D14] to-[#121822] flex items-center justify-center">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-[100px] pointer-events-none" />
            <div className="w-10 h-10 sm:w-16 sm:h-16 rounded-[1rem] sm:rounded-[1.5rem] bg-[#1E2736]/50 border border-white/5 flex items-center justify-center group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-700 backdrop-blur-md">
              <Box className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500 group-hover:text-gray-300 transition-colors" />
            </div>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-3 sm:p-6 pt-2 flex-1 flex flex-col justify-between relative z-10">
        <div className="mb-2 sm:mb-6">
          <div className="flex items-center gap-2 mb-1 sm:mb-3">
            <div className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md bg-white/5 border border-white/5 text-[8px] sm:text-[9px] font-bold tracking-widest uppercase flex items-center gap-1 sm:gap-1.5 w-max">
              {book.status === "draft" ? (
                <>
                  <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-sm bg-amber-500/80" />
                  <span className="text-amber-400/90">Draft</span>
                </>
              ) : (
                <>
                  <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-sm bg-emerald-500/80" />
                  <span className="text-emerald-400/90">Published</span>
                </>
              )}
            </div>
          </div>

          <h3 className="text-sm sm:text-xl font-bold text-white mb-1 sm:mb-2 leading-tight group-hover:text-blue-100 transition-colors line-clamp-2 pr-6">
            {book.title}
          </h3>
          <p className="hidden sm:block text-sm text-gray-400/90 leading-relaxed font-light line-clamp-2">
            {book.description ||
              "Tidak ada sinopsis atau deskripsi untuk kitab ini."}
          </p>
        </div>

        {/* Stats — desktop only */}
        <div className="hidden sm:flex justify-between items-center bg-white/5 border border-white/5 rounded-2xl p-4 mb-5 shadow-inner">
          <div className="flex flex-col items-center flex-1">
            <div className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-1">
              Total
            </div>
            <span className="text-xl font-black text-gray-200">0</span>
          </div>
          <div className="w-px h-8 bg-white/5" />
          <div className="flex flex-col items-center flex-1">
            <div className="text-[9px] text-blue-500/70 font-bold uppercase tracking-widest mb-1">
              Aktif
            </div>
            <span className="text-xl font-black text-blue-400">0</span>
          </div>
          <div className="w-px h-8 bg-white/5" />
          <div className="flex flex-col items-center flex-1">
            <div className="text-[9px] text-emerald-500/70 font-bold uppercase tracking-widest mb-1">
              Lulus
            </div>
            <span className="text-xl font-black text-emerald-400">0</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center mt-auto">
          <div className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs text-gray-500 font-medium tracking-wide">
            <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span>{formattedDate}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

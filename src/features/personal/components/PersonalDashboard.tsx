import { Sidebar } from "@/components/ui/Sidebar";
import { useState, useEffect } from "react";
import {
  Menu,
  Files,
  BookOpen,
  Share2,
  Download,
  Plus,
  Library,
  Loader2,
} from "lucide-react";
import { useBooks } from "../hooks/useBooks";
import { useMyCollection } from "../hooks/useMyCollection";
import { Link, useNavigate } from "react-router";
import { BookCard } from "./BookCard";
import { CreateBookModal } from "./CreateBookModal";
import { EditBookModal } from "./EditBookModal";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import type { Book } from "../types/personal.types";
import { BookDailyReviewSection } from "./BookDailyReviewSection";

export const PersonalDashboard = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null);
  const [collectionToDelete, setCollectionToDelete] = useState<Book | null>(null);

  const { books, loading, fetchBooks, deleteBook } = useBooks();
  const {
    collection,
    loadingCollection,
    fetchCollection,
    removeFromCollection,
  } = useMyCollection();

  useEffect(() => {
    void fetchBooks();
    void fetchCollection();
  }, [fetchBooks, fetchCollection]);

  const totalMateri = books.length;

  return (
    <>
      <div className="min-h-screen relative bg-[#090A0F] rounded-3xl overflow-hidden selection:bg-blue-500/30">
        {/* --- Dynamic Background Atmosphere --- */}
        <div className="absolute top-0 inset-x-0 h-[500px] bg-linear-to-b from-blue-900/10 vi a-[#090A0F] to-transparent pointer-events-none" />
        <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-[20%] left-[-10%] w-[600px] h-[600px] bg-purple-500/5 blur-[120px] rounded-full pointer-events-none" />

        {/* Decorative Grid Pattern */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none mix-blend-overlay" />

        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Overlay for mobile sidebar */}
        <div
          className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
          onClick={() => setIsSidebarOpen(false)}
        />

        <div className="p-4 sm:p-6 lg:p-8 animate-fadeIn max-w-[1600px] mx-auto relative z-10">
          {/* === TOP NAVIGATION BAR === */}
          <div className="flex justify-between items-center mb-10">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="flex items-center gap-3 text-gray-400 hover:text-white transition-all group cursor-pointer"
            >
              <div className="p-2.5 rounded-2xl border border-white/5 group-hover:border-white/20 bg-white/5 group-hover:bg-white/10 transition-all duration-300 backdrop-blur-xl shadow-lg">
                <Menu className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </div>
              <span className="text-xs font-mono tracking-[0.2em] font-semibold hidden md:inline opacity-70 group-hover:opacity-100 transition-opacity">
                MENU
              </span>
            </button>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#131824]/80 border border-blue-500/20 text-xs text-blue-400 font-bold backdrop-blur-xl shadow-lg shadow-blue-500/5 select-none transition-all hover:bg-[#1A2235]">
                <Files className="w-4 h-4" />
                <span>{totalMateri} Kitab Disimpan</span>
              </div>
            </div>
          </div>

          {/* === HERO / HEADER SECTION === */}
          <div className="mb-12 relative">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 mb-6 text-xs font-medium text-gray-400 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              Personal Workspace
            </div>

            <h1 className="text-4xl md:text-6xl font-serif font-black text-white mb-5 tracking-tight drop-shadow-lg leading-tight">
              Ruang{" "}
              <span className="bg-clip-text text-transparent bg-linear-to-r from-blue-400 via-cyan-300 to-emerald-400">
                Pribadi
              </span>
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl leading-relaxed font-light mb-8">
              Bangun kurikulum hafalan Anda sendiri, kelola materi secara
              mandiri, dan eksplorasi ribuan perpustakaan global untuk
              pengalaman belajar maksimal.
            </p>

            {/* Quick Action Strip */}
            <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap sm:items-stretch sm:gap-0 p-2 rounded-[2rem] bg-[#111620]/60 border border-white/5 backdrop-blur-md shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl pointer-events-none" />

              {/* Buat Materi */}
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="group flex flex-col sm:flex-row items-center sm:gap-4 gap-2 sm:flex-1 px-2 sm:px-6 py-3 sm:py-4 rounded-[1.5rem] hover:bg-blue-500/10 transition-all duration-300 text-center sm:text-left"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 text-blue-400 group-hover:scale-110 group-hover:bg-blue-500/20 transition-all shrink-0">
                  <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <div className="text-xs sm:text-base font-black text-white group-hover:text-blue-300 transition-colors leading-tight">
                    Buat Materi
                  </div>
                  <div className="hidden sm:block text-xs text-gray-500 group-hover:text-gray-400 transition-colors">
                    Buat buku baru dari nol
                  </div>
                </div>
              </button>

              <div className="hidden md:block w-px my-3 bg-white/10" />

              {/* Bagikan Karya */}
              <Link
                to="/dashboard/pribadi/share"
                className="group flex flex-col sm:flex-row items-center sm:gap-4 gap-2 sm:flex-1 px-2 sm:px-6 py-3 sm:py-4 rounded-[1.5rem] hover:bg-emerald-500/10 transition-all duration-300 decoration-transparent text-center sm:text-left"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-400 group-hover:scale-110 group-hover:bg-emerald-500/20 transition-all shrink-0">
                  <Share2 className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <div className="text-xs sm:text-base font-black text-white group-hover:text-emerald-300 transition-colors leading-tight">
                    Bagikan Karya
                  </div>
                  <div className="hidden sm:block text-xs text-gray-500 group-hover:text-gray-400 transition-colors">
                    Publikasikan ke komunitas
                  </div>
                </div>
              </Link>

              <div className="hidden lg:block w-px my-3 bg-white/10" />

              {/* Import Katalog */}
              <Link
                to="/dashboard/pribadi/explore"
                className="group flex flex-col sm:flex-row items-center sm:gap-4 gap-2 sm:flex-1 px-2 sm:px-6 py-3 sm:py-4 rounded-[1.5rem] hover:bg-purple-500/10 transition-all duration-300 decoration-transparent text-center sm:text-left"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 text-purple-400 group-hover:scale-110 group-hover:bg-purple-500/20 transition-all shrink-0">
                  <Download className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <div className="text-xs sm:text-base font-black text-white group-hover:text-purple-300 transition-colors leading-tight">
                    Impor Katalog
                  </div>
                  <div className="hidden sm:block text-xs text-gray-500 group-hover:text-gray-400 transition-colors">
                    Salin materi dari perpustakaan
                  </div>
                </div>
              </Link>
            </div>
          </div>

          {/* === QUICK NAVIGATION === */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            <a
              href="#karya-mandiri"
              className="group flex flex-col md:flex-row items-center gap-3 px-4 py-3.5 rounded-2xl bg-white/5 hover:bg-blue-500/10 border border-white/8 hover:border-blue-500/30 transition-all duration-300"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <Files className="w-4 h-4 text-blue-400" />
              </div>
              <div className="min-w-0">
                <p className="text-white text-sm font-bold leading-tight group-hover:text-blue-300 transition-colors">
                  Karya Mandiri
                </p>
                <p className="text-gray-500 text-xs mt-0.5 truncate hidden md:block">
                  Buku buatan kamu
                </p>
              </div>
            </a>

            <a
              href="#perpustakaan-global"
              className="group flex flex-col md:flex-row items-center gap-3 px-4 py-3.5 rounded-2xl bg-white/5 hover:bg-purple-500/10 border border-white/8 hover:border-purple-500/30 transition-all duration-300"
            >
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <Library className="w-4 h-4 text-purple-400" />
              </div>
              <div className="min-w-0">
                <p className="text-white text-sm font-bold leading-tight group-hover:text-purple-300 transition-colors">
                  Katalog Impor
                </p>
                <p className="text-gray-500 text-xs mt-0.5 truncate hidden md:block">
                  Koleksi dari komunitas
                </p>
              </div>
            </a>
          </div>

          {/* === DAILY REVIEW SECTION (BOOKS ONLY) === */}
          <BookDailyReviewSection />

          {/* === SECTION 1: KARYA MANDIRI === */}
          <div className="mb-20" id="karya-mandiri">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
              <div className="max-w-2xl">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-3xl font-serif font-bold text-white tracking-wide flex items-center gap-3">
                    Karya Mandiri
                    <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 align-middle">
                      Manajemen
                    </span>
                  </h2>
                </div>
                <p className="text-gray-500 text-sm">
                  Buku, kitab, atau kurikulum hafalan yang Anda buat sendiri.
                </p>
              </div>
            </div>

            {loading && books.length === 0 ? (
              <div className="flex flex-col justify-center items-center py-20 bg-[#111620]/30 rounded-[2.5rem] border border-white/5">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-4" />
                <p className="text-gray-500 text-sm animate-pulse">
                  Memuat koleksi...
                </p>
              </div>
            ) : books.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
                {books.map((book) => (
                  <BookCard
                    key={book.id}
                    book={book}
                    onClick={() =>
                      navigate(`/dashboard/pribadi/book/${book.id}`)
                    }
                    onEdit={(b) => setEditingBook(b)}
                    onDelete={(b) => setBookToDelete(b)}
                  />
                ))}
              </div>
            ) : (
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-linear-to-r from-blue-500/20 to-cyan-500/20 rounded-[3rem] blur opacity-30 group-hover:opacity-60 transition duration-1000"></div>
                <div className="relative flex flex-col items-center justify-center py-28 px-4 rounded-[3rem] border border-blue-500/20 bg-[#0F141C] text-center overflow-hidden">
                  <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />
                  <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none" />

                  <div className="relative">
                    <div className="w-24 h-24 rounded-[2rem] bg-[#161D29] flex items-center justify-center mb-8 border border-white/10 shadow-2xl mx-auto relative z-10 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-700">
                      <div className="absolute inset-0 bg-blue-500/10 rounded-[2rem] animate-pulse" />
                      <BookOpen className="w-10 h-10 text-blue-400" />
                    </div>
                  </div>

                  <h3 className="text-3xl font-bold text-white mb-4 tracking-tight drop-shadow-md">
                    Kanvas Anda Masih Kosong
                  </h3>
                  <p className="text-gray-400 max-w-md mb-10 text-lg font-light leading-relaxed">
                    Langkah terbaik dimulai dari huruf pertama. Tulis panduan
                    hafalan Anda sendiri dan rasakan progres belajarnya.
                  </p>

                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="px-8 py-4 rounded-full cursor-pointer bg-white text-black font-bold transition-all hover:scale-105 active:scale-95 flex items-center gap-3 shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_40px_rgba(255,255,255,0.4)]"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Mulai Berkarya</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* === SECTION 2: KOLEKSI PERPUSTAKAAN DUNIA === */}
          <div className="mb-10" id="perpustakaan-global">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
              <div className="max-w-2xl">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-3xl font-serif font-bold text-white tracking-wide flex items-center gap-3">
                    Katalog Impor
                    <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 align-middle flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                      Live
                    </span>
                  </h2>
                </div>
                <p className="text-gray-500 text-sm">
                  Karya pengguna lain yang Anda unduh ke workspace Anda.
                </p>
              </div>
              <div className="flex shrink-0">
                <Link
                  to="/dashboard/pribadi/explore"
                  className="px-6 py-2.5 rounded-full cursor-pointer bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 font-bold transition-all flex items-center gap-2 border border-purple-500/20 shadow-lg shadow-purple-500/5 decoration-transparent"
                >
                  <Download className="w-4 h-4" />
                  <span className="text-sm">Jelajahi Perpustakaan</span>
                </Link>
              </div>
            </div>

            {loadingCollection && collection.length === 0 ? (
              <div className="flex flex-col justify-center items-center py-20 bg-[#111620]/30 rounded-[2.5rem] border border-white/5">
                <Loader2 className="w-8 h-8 text-purple-500 animate-spin mb-4" />
                <p className="text-gray-500 text-sm animate-pulse">
                  Memuat koleksi impor...
                </p>
              </div>
            ) : collection.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
                {collection.map((book) => (
                  <BookCard
                    key={book.id}
                    book={book}
                    onClick={() =>
                      navigate(`/dashboard/pribadi/book/${book.id}`)
                    }
                    onDelete={(b) => setCollectionToDelete(b)}
                  />
                ))}
              </div>
            ) : (
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-linear-to-r from-purple-500/10 to-pink-500/10 rounded-[3rem] blur opacity-40 group-hover:opacity-75 transition duration-1000"></div>
                <div className="relative flex flex-col items-center justify-center py-28 px-4 rounded-[3rem] border border-white/5 bg-[#0F141C] text-center overflow-hidden">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[800px] h-[400px] bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />

                  <div className="relative">
                    <div className="w-24 h-24 rounded-[2rem] bg-linear-to-br from-[#1A1A2E] to-[#16213E] flex items-center justify-center mb-8 border border-purple-500/20 shadow-[0_0_40px_rgba(168,85,247,0.15)] mx-auto relative z-10 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-700">
                      <Library className="w-10 h-10 text-purple-400 drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
                    </div>
                  </div>

                  <h3 className="text-3xl font-bold text-white mb-4 tracking-tight drop-shadow-md">
                    Area Unduhan Kosong
                  </h3>
                  <p className="text-gray-400 max-w-md mb-10 text-lg font-light leading-relaxed">
                    Jelajahi berbagai materi kurikulum pilihan dari penuntut ilmu
                    yang lain yang siap pakai untuk Anda pelajari sekarang.
                  </p>

                  <Link
                    to="/dashboard/pribadi/explore"
                    className="w-max px-8 py-4 rounded-full cursor-pointer bg-[#1A1A2E] border border-purple-500/30 hover:border-purple-400 hover:bg-[#202035] shadow-[0_10px_30px_rgba(168,85,247,0.15)] hover:shadow-[0_10px_40px_rgba(168,85,247,0.3)] text-white font-bold transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3 decoration-transparent"
                  >
                    <Download className="w-5 h-5 text-purple-400" />
                    <span className="tracking-wide">Jelajahi Perpustakaan</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals — outside overflow-hidden div so they render full-screen */}
      {isCreateModalOpen && (
        <CreateBookModal
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={() => fetchBooks()}
        />
      )}

      {editingBook && (
        <EditBookModal
          book={editingBook}
          onClose={() => setEditingBook(null)}
          onSuccess={() => fetchBooks()}
        />
      )}

      <ConfirmModal
        isOpen={!!bookToDelete}
        onClose={() => setBookToDelete(null)}
        onConfirm={async () => {
          if (bookToDelete) {
            await deleteBook(bookToDelete.id);
            setBookToDelete(null);
          }
        }}
        title="Hapus Kitab?"
        message={`Apakah Anda yakin ingin menghapus kitab "${bookToDelete?.title}" secara permanen? Semua data di dalamnya akan hilang.`}
        confirmText="Hapus Permanen"
        variant="danger"
      />

      <ConfirmModal
        isOpen={!!collectionToDelete}
        onClose={() => setCollectionToDelete(null)}
        onConfirm={async () => {
          if (collectionToDelete) {
            await removeFromCollection(collectionToDelete.id);
            setCollectionToDelete(null);
          }
        }}
        title="Hapus Kitab dari Koleksi Impor?"
        message={`Apakah Anda yakin ingin menghapus kitab "${collectionToDelete?.title}" dari koleksi impor Anda?`}
        confirmText="Hapus dari Koleksi"
        variant="danger"
      />
    </>
  );
};

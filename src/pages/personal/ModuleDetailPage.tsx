import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import {
  AlertCircle,
  AlignLeft,
  ArrowLeft,
  BookOpen,
  CheckCircle,
  ChevronRight,
  Edit2,
  FileText,
  Hash,
  Layers,
  LayoutList,
  Loader2,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { Sidebar } from "@/components/ui/Sidebar";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { useBookTree } from "@/features/personal/hooks/useBookTree";
import { useDeleteModule } from "@/features/personal/hooks/useDeleteModule";
import { useCreateModule } from "@/features/personal/hooks/useCreateModule";
import { EditModuleModal } from "@/features/personal/components/EditModuleModal";
import { BookItemCard } from "@/features/personal/components/BookItemCard";
import { AddItemModal } from "@/features/personal/components/AddItemModal";
import { invalidateBookTreeCache } from "@/features/personal/hooks/useBookTree";
import { useBookItemStatusMap, contentRefForItem } from "@/features/personal/hooks/useBookItemStatusMap";
import type { Module, BookItem } from "@/features/personal/types/personal.types";

/* ------------------------------------------------------------------ */
/* Add Item to Module Modal                                             */
/* ------------------------------------------------------------------ */
/* Add Sub Module Modal                                                 */
/* ------------------------------------------------------------------ */
interface AddSubModuleModalProps {
  bookId: string;
  parentId: string;
  onClose: () => void;
  onCreated: (module: import("@/features/personal/types/personal.types").CreatedModule) => void;
  nextOrder: number;
}

const AddSubModuleModal = ({
  bookId,
  parentId,
  onClose,
  onCreated,
  nextOrder,
}: AddSubModuleModalProps) => {
  const { createModule, loading } = useCreateModule();
  const [form, setForm] = useState({
    title: "",
    description: "",
    orderStr: String(nextOrder),
  });
  const [resultState, setResultState] = useState<"idle" | "success" | "error">(
    "idle",
  );
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setErrorMsg("Judul sub-modul wajib diisi.");
      setResultState("error");
      return;
    }
    const order = Math.max(1, parseInt(form.orderStr) || 1);
    try {
      const created = await createModule(bookId, {
        title: form.title.trim(),
        description: form.description.trim(),
        order,
        parent_id: parentId,
      });
      onCreated(created);
      setResultState("success");
    } catch (err: unknown) {
      setErrorMsg((err as Error).message ?? "Terjadi kesalahan.");
      setResultState("error");
    }
  };

  const handleSuccessClose = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-md"
        onClick={resultState === "idle" ? onClose : undefined}
      />

      <div className="relative z-10 w-full max-w-lg animate-in fade-in zoom-in-95 duration-300">
        <div className="absolute -inset-px rounded-[2.5rem] bg-linear-to-br from-indigo-500/30 via-purple-500/20 to-transparent blur-sm pointer-events-none" />

        <div className="relative rounded-[2.5rem] bg-[#0E1420] border border-white/10 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.9)] overflow-hidden">
          {/* ---- Success State ---- */}
          {resultState === "success" && (
            <div className="p-10 flex flex-col items-center text-center gap-5">
              <div className="relative">
                <div className="w-20 h-20 rounded-[2rem] bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-indigo-400" />
                </div>
                <div className="absolute inset-0 bg-indigo-500/10 rounded-[2rem] blur-2xl" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Sub-Modul Berhasil Dibuat!
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Sub-modul{" "}
                  <span className="text-white font-semibold">
                    "{form.title}"
                  </span>{" "}
                  telah berhasil ditambahkan.
                </p>
              </div>
              <button
                onClick={handleSuccessClose}
                className="px-8 py-3 rounded-2xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-sm transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(99,102,241,0.3)]"
              >
                Lihat Sub-Modul
              </button>
            </div>
          )}

          {/* ---- Error State ---- */}
          {resultState === "error" && (
            <div className="p-10 flex flex-col items-center text-center gap-5">
              <div className="relative">
                <div className="w-20 h-20 rounded-[2rem] bg-rose-500/15 border border-rose-500/30 flex items-center justify-center">
                  <AlertCircle className="w-10 h-10 text-rose-400" />
                </div>
                <div className="absolute inset-0 bg-rose-500/10 rounded-[2rem] blur-2xl" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Gagal Membuat Sub-Modul
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {errorMsg}
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setResultState("idle")}
                  className="px-6 py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium text-sm transition"
                >
                  Coba Lagi
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-3 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 font-medium text-sm transition"
                >
                  Tutup
                </button>
              </div>
            </div>
          )}

          {/* ---- Form State ---- */}
          {resultState === "idle" && (
            <>
              {/* Header */}
              <div className="relative px-8 pt-8 pb-6 border-b border-white/5">
                <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/5 blur-3xl rounded-full pointer-events-none" />
                <button
                  onClick={onClose}
                  className="absolute top-6 right-6 w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center">
                    <Layers className="w-5 h-5 text-indigo-400" />
                  </div>
                  <h2 className="text-xl font-bold text-white tracking-tight">
                    Tambah Sub-Modul
                  </h2>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Buat sub-modul di dalam modul ini.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-8 space-y-5">
                {/* Title */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-indigo-400">
                    <FileText className="w-3.5 h-3.5" />
                    Judul Sub-Modul
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="cth. Sub Bab 1: Pendahuluan"
                    value={form.title}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, title: e.target.value }))
                    }
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-indigo-500/50 focus:outline-none text-white text-sm placeholder-gray-600 transition-colors"
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-indigo-400">
                    <AlignLeft className="w-3.5 h-3.5" />
                    Deskripsi
                    <span className="text-gray-600 font-normal normal-case tracking-normal">
                      (opsional)
                    </span>
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Gambaran singkat isi sub-modul ini..."
                    value={form.description}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, description: e.target.value }))
                    }
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-indigo-500/50 focus:outline-none text-white text-sm placeholder-gray-600 transition-colors resize-none"
                  />
                </div>

                {/* Order */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-indigo-400">
                    <Hash className="w-3.5 h-3.5" />
                    Urutan
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={form.orderStr}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        orderStr: e.target.value,
                      }))
                    }
                    className="w-32 px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-indigo-500/50 focus:outline-none text-white text-sm transition-colors"
                  />
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white text-sm font-medium transition"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !form.title.trim()}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(99,102,241,0.3)]"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        Buat Sub-Modul
                      </>
                    )}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Module Detail Page                                                   */
/* ------------------------------------------------------------------ */
export const ModuleDetailPage = () => {
  const { bookId, moduleId } = useParams<{
    bookId: string;
    moduleId: string;
  }>();
  const navigate = useNavigate();
  const { tree, loading, error, fetchBookTree, addItemToModule, addChildModuleToTree } = useBookTree();
  const { statusMap, fetchStatusMap } = useBookItemStatusMap();
  const { deleteModule } = useDeleteModule();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [isAddSubModuleModalOpen, setIsAddSubModuleModalOpen] = useState(false);

  useEffect(() => {
    if (bookId) {
      fetchBookTree(bookId, true);
      void fetchStatusMap();
    }
  }, [bookId, fetchBookTree, fetchStatusMap]);

  // Find the module from tree
  const findModule = (modules: Module[], id: string): Module | null => {
    for (const mod of modules) {
      if (mod.id === id) return mod;
      if (mod.children?.length) {
        const found = findModule(mod.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const module = tree && moduleId ? findModule(tree.modules, moduleId) : null;
  const items = module?.items ?? [];

  const handleEditSuccess = () => {
    if (bookId) fetchBookTree(bookId, true); // force refresh setelah edit
  };

  const handleAddItemSuccess = (created: import("@/features/personal/types/personal.types").CreatedModuleItem) => {
    addItemToModule(bookId!, moduleId!, {
      id: created.id,
      book_id: created.book_id,
      title: created.title,
      content: created.content,
      answer: created.answer,
      image: created.image,
      order: created.order,
      estimated_review_seconds: created.estimated_review_seconds,
      review_count: 0,
      status: 'belum_mulai',
      created_at: created.created_at,
      updated_at: created.updated_at,
    });
    void fetchBookTree(bookId!, true);
  };

  const handleAddSubModuleSuccess = (created: import("@/features/personal/types/personal.types").CreatedModule) => {
    addChildModuleToTree(bookId!, moduleId!, {
      id: created.id,
      title: created.title,
      description: created.description,
      order: created.order,
      items: [],
      children: [],
    });
  };

  const handleDelete = async () => {
    if (!moduleId) return;
    try {
      await deleteModule(moduleId);
      setIsDeleteModalOpen(false);
      // Invalidate tree cache so BookDetailPage shows updated modules
      if (bookId) invalidateBookTreeCache(bookId);
      navigate(`/dashboard/pribadi/book/${bookId}`);
    } catch {
      // Error is handled by the hook and will be shown via toast/notification
    }
  };

  return (
    <div className="min-h-screen bg-[#090A0F] text-white font-primary selection:bg-blue-500/30">
      {/* Ambient bg */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-15%] right-[-10%] w-[700px] h-[700px] bg-purple-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[120px]" />
      </div>

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={() => setIsSidebarOpen(false)}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Top nav */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2.5 rounded-2xl border border-white/5 hover:border-white/20 bg-white/5 hover:bg-white/10 transition-all duration-300 backdrop-blur-xl shadow-lg text-gray-400 hover:text-white"
            >
              <LayoutList className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/15 text-gray-400 hover:text-white transition-all duration-300 text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Kembali</span>
            </button>
          </div>

          {/* Breadcrumb */}
          {tree && module && (
            <div className="hidden md:flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white/5 border border-white/5 text-xs text-gray-400 max-w-sm">
              <BookOpen className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span
                className="text-gray-500 hover:text-white truncate cursor-pointer transition-colors max-w-[100px]"
                onClick={() => navigate(`/dashboard/pribadi/book/${bookId}`)}
              >
                {tree.title}
              </span>
              <ChevronRight className="w-3 h-3 text-gray-600 shrink-0" />
              <span className="font-medium text-white truncate max-w-[120px]">
                {module.title}
              </span>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-amber-500/30 text-gray-400 hover:text-amber-400 text-sm font-medium transition-all duration-300"
            >
              <Edit2 className="w-4 h-4" />
              <span className="hidden sm:inline">Edit</span>
            </button>
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/5 hover:bg-rose-500/10 border border-white/5 hover:border-rose-500/30 text-gray-400 hover:text-rose-400 text-sm font-medium transition-all duration-300"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Hapus</span>
            </button>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-40 gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-3xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
              </div>
              <div className="absolute inset-0 bg-purple-500/10 rounded-3xl blur-xl animate-pulse" />
            </div>
            <p className="text-gray-500 text-sm animate-pulse">
              Memuat detail modul...
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

        {/* Not found */}
        {!loading && !error && tree && !module && (
          <div className="flex flex-col items-center justify-center py-40 gap-4">
            <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Layers className="w-8 h-8 text-amber-400" />
            </div>
            <p className="text-gray-400 text-sm">Modul tidak ditemukan.</p>
            <button
              onClick={() => navigate(-1)}
              className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-medium text-gray-300 hover:text-white transition"
            >
              Kembali
            </button>
          </div>
        )}

        {/* Module Detail */}
        {!loading && !error && module && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Module Hero */}
            <div className="relative rounded-[2.5rem] overflow-hidden border border-white/5 bg-[#0E1420] shadow-[0_30px_60px_-20px_rgba(0,0,0,0.8)]">
              {/* Decorative gradient top */}
              <div className="absolute top-0 inset-x-0 h-px bg-linear-to-r from-transparent via-purple-500/40 to-transparent" />
              <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/5 blur-[80px] rounded-full pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-60 h-60 bg-blue-500/5 blur-[60px] rounded-full pointer-events-none" />

              <div className="relative px-8 sm:px-10 py-10">
                {/* Order & type badge */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 backdrop-blur-xl">
                    <Layers className="w-3.5 h-3.5 text-purple-400" />
                    <span className="text-[11px] font-bold tracking-widest uppercase text-purple-400">
                      Modul
                    </span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                    <Hash className="w-3.5 h-3.5 text-gray-500" />
                    <span className="text-[11px] font-bold tracking-widest text-gray-400">
                      Urutan {module.order}
                    </span>
                  </div>
                </div>

                <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight mb-4">
                  {module.title}
                </h1>

                {module.description ? (
                  <p className="text-gray-400 text-base leading-relaxed font-light max-w-2xl whitespace-pre-wrap break-words">
                    {module.description}
                  </p>
                ) : (
                  <p className="text-gray-600 text-sm italic">
                    Tidak ada deskripsi.
                  </p>
                )}

                {/* Stats strip */}
                <div className="flex flex-wrap items-center gap-6 mt-8 pt-6 border-t border-white/5">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <FileText className="w-4 h-4 text-gray-600" />
                    <span>
                      <span className="text-white font-semibold">
                        {items.length}
                      </span>{" "}
                      item hafalan
                    </span>
                  </div>
                  {module.children?.length > 0 && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Layers className="w-4 h-4 text-gray-600" />
                      <span>
                        <span className="text-white font-semibold">
                          {module.children.length}
                        </span>{" "}
                        sub-modul
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sub-modules (if any) */}
            {module.children && module.children.length > 0 && (
              <div className="relative rounded-[2.5rem] overflow-hidden border border-white/5 bg-[#0E1420]">
                <div className="absolute top-0 inset-x-0 h-px bg-linear-to-r from-transparent via-indigo-500/30 to-transparent" />
                <div className="px-8 py-6 border-b border-white/5 flex flex-col md:flex-row items-center justify-between">
                  <h2 className="text-base font-bold text-white flex items-center gap-2.5">
                    <Layers className="w-4 h-4 text-indigo-400" />
                    Sub-Modul
                    <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold">
                      {module.children.length}
                    </span>
                  </h2>
                  <button
                    onClick={() => setIsAddSubModuleModalOpen(true)}
                    className="flex mt-2 md:mt-0 items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    Tambah Sub-Modul
                  </button>
                </div>
                <div className="p-6 space-y-3">
                  {module.children
                    .slice()
                    .sort((a, b) => a.order - b.order)
                    .map((child) => (
                      <button
                        key={child.id}
                        onClick={() =>
                          navigate(
                            `/dashboard/pribadi/book/${bookId}/module/${child.id}`,
                          )
                        }
                        className="w-full group flex items-center gap-4 p-4 rounded-2xl bg-white/3 hover:bg-white/7 border border-white/5 hover:border-indigo-500/30 transition-all duration-300 text-left"
                      >
                        <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0 group-hover:bg-indigo-500/20 transition-colors">
                          <span className="text-sm font-black text-indigo-400">
                            {child.order}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-white text-sm truncate group-hover:text-indigo-100 transition-colors">
                            {child.title}
                          </p>
                          {child.description && (
                            <p className="text-xs text-gray-500 truncate">
                              {child.description}
                            </p>
                          )}
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                      </button>
                    ))}
                </div>
              </div>
            )}

            {/* No sub-modules - show add button */}
            {(!module.children || module.children.length === 0) && (
              <div className="relative rounded-[2.5rem] overflow-hidden border border-white/5 bg-[#0E1420]">
                <div className="absolute top-0 inset-x-0 h-px bg-linear-to-r from-transparent via-indigo-500/30 to-transparent" />
                <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between">
                  <h2 className="text-base font-bold text-white flex items-center gap-2.5">
                    <Layers className="w-4 h-4 text-indigo-400" />
                    Sub-Modul
                  </h2>
                </div>
                <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                  <div className="relative mb-6">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-[#161D29] border border-white/10 flex items-center justify-center shadow-2xl">
                      <Layers className="w-8 h-8 text-indigo-600" />
                    </div>
                    <div className="absolute -inset-3 bg-indigo-500/5 rounded-[2rem] blur-2xl pointer-events-none" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">
                    Belum Ada Sub-Modul
                  </h3>
                  <p className="text-gray-500 text-sm max-w-xs leading-relaxed mb-6">
                    Buat sub-modul untuk mengorganisir konten secara hierarkis.
                  </p>
                  <button
                    onClick={() => setIsAddSubModuleModalOpen(true)}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-bold transition-all hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(99,102,241,0.3)]"
                  >
                    <Plus className="w-4 h-4" />
                    Tambah Sub-Modul Pertama
                  </button>
                </div>
              </div>
            )}

            {/* Items Section */}
            <div className="relative rounded-[2.5rem] overflow-hidden border border-white/5 bg-[#0E1420]">
              <div className="absolute top-0 inset-x-0 h-px bg-linear-to-r from-transparent via-emerald-500/30 to-transparent" />

              <div className="px-8 py-6 border-b border-white/5 flex flex-col md:flex-row items-center justify-between">
                <h2 className="text-base font-bold text-white flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-emerald-400" />
                  Item Hafalan
                  {items.length > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
                      {items.length}
                    </span>
                  )}
                </h2>
                <button
                  onClick={() => setIsAddItemModalOpen(true)}
                  className="flex mt-2 md:mt-0 items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 hover:text-emerald-300 text-sm font-medium transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Tambah Item
                </button>
              </div>

              {items.length > 0 ? (
                <div className="p-3 sm:p-6 grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {items.map((item: BookItem) => (
                    <BookItemCard
                      key={item.id}
                      item={item}
                      bookId={bookId!}
                      realItemId={statusMap.get(contentRefForItem(bookId!, item.id))?.item_id}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
                  <div className="relative mb-6">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-[#161D29] border border-white/10 flex items-center justify-center shadow-2xl">
                      <FileText className="w-8 h-8 text-gray-600" />
                    </div>
                    <div className="absolute -inset-3 bg-emerald-500/5 rounded-[2rem] blur-2xl pointer-events-none" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">
                    Belum Ada Item
                  </h3>
                  <p className="text-gray-500 text-sm max-w-xs leading-relaxed mb-6">
                    Mulai tambahkan item hafalan ke dalam modul ini.
                  </p>
                  <button
                    onClick={() => setIsAddItemModalOpen(true)}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-linear-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white text-sm font-bold transition-all hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                  >
                    <Plus className="w-4 h-4" />
                    Tambah Item Pertama
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Edit Module Modal */}
      {isEditModalOpen && module && (
        <EditModuleModal
          module={module}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* Add Item to Module Modal */}
      {isAddItemModalOpen && module && (
        <AddItemModal
          bookId={bookId!}
          moduleId={moduleId!}
          onClose={() => setIsAddItemModalOpen(false)}
          onCreated={(item) => handleAddItemSuccess(item as import("@/features/personal/types/personal.types").CreatedModuleItem)}
          nextOrder={(items?.length ?? 0) + 1}
        />
      )}

      {/* Add Sub Module Modal */}
      {isAddSubModuleModalOpen && module && (
        <AddSubModuleModal
          bookId={bookId!}
          parentId={moduleId!}
          onClose={() => setIsAddSubModuleModalOpen(false)}
          onCreated={handleAddSubModuleSuccess}
          nextOrder={(module.children?.length ?? 0) + 1}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Hapus Modul"
        message={`Apakah Anda yakin ingin menghapus modul "${module?.title}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Ya, Hapus"
        cancelText="Batal"
        icon={Trash2}
        variant="danger"
      />
    </div>
  );
};

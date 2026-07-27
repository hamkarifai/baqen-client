import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import {
  AlertCircle,
  AlignLeft,
  ArrowLeft,
  BookOpen,
  Calendar,
  CheckCircle,
  CheckCircle2,
  Clock,
  FileText,
  Globe,
  Hash,
  ImageOff,
  Layers,
  ListPlus,
  Loader2,
  Lock,
  Plus,
  Sparkles,
  X,
  ChevronRight,
  Play,
} from "lucide-react";
import { Sidebar } from "@/components/ui/Sidebar";
import { useBookDetail } from "@/features/personal/hooks/useBookDetail";
import { useBookTree } from "@/features/personal/hooks/useBookTree";
import { useCreateModule } from "@/features/personal/hooks/useCreateModule";
import { useBookItemStatusMap, contentRefForItem } from "@/features/personal/hooks/useBookItemStatusMap";
import { useStartItemPhase } from "@/features/personal/hooks/useStartItemPhase";
import { AddItemModal } from "@/features/personal/components/AddItemModal";
import { BookItemCard } from "@/features/personal/components/BookItemCard";
import { useAuthStore } from "@/features/auth/stores/auth.store";
import type { Module } from "@/features/personal/types/personal.types";
import type { CreatedItem, CreatedModule } from "@/features/personal/types/personal.types";
import { toast } from "sonner";

interface AddModuleModalProps {
  bookId: string;
  onClose: () => void;
  onCreated: (module: CreatedModule) => void;
  nextOrder: number;
}

const AddModuleModal = ({
  bookId,
  onClose,
  onCreated,
  nextOrder,
}: AddModuleModalProps) => {
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
    const order = Math.max(1, parseInt(form.orderStr) || 1);
    try {
      const created = await createModule(bookId, {
        title: form.title.trim(),
        description: form.description.trim(),
        order,
        parent_id: null,
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
        <div className="absolute -inset-px rounded-[2.5rem] bg-linear-to-br from-blue-500/30 via-purple-500/20 to-transparent blur-sm pointer-events-none" />
        <div className="relative rounded-[2.5rem] bg-[#0E1420] border border-white/10 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.9)] overflow-hidden">
          {resultState === "success" && (
            <div className="p-10 flex flex-col items-center text-center gap-5">
              <div className="relative">
                <div className="w-20 h-20 rounded-[2rem] bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-emerald-400" />
                </div>
                <div className="absolute inset-0 bg-emerald-500/10 rounded-[2rem] blur-2xl" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Modul Berhasil Dibuat!
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Modul{" "}
                  <span className="text-white font-semibold">
                    "{form.title}"
                  </span>{" "}
                  telah berhasil ditambahkan ke buku ini.
                </p>
              </div>
              <button
                onClick={handleSuccessClose}
                className="px-8 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-sm transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
              >
                Lihat Modul
              </button>
            </div>
          )}
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
                  Gagal Membuat Modul
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
          {resultState === "idle" && (
            <>
              <div className="relative px-8 pt-8 pb-6 border-b border-white/5">
                <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 blur-3xl rounded-full pointer-events-none" />
                <button
                  onClick={onClose}
                  className="absolute top-6 right-6 w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-10 h-10 rounded-2xl bg-blue-500/15 border border-blue-500/20 flex items-center justify-center">
                    <Layers className="w-5 h-5 text-blue-400" />
                  </div>
                  <h2 className="text-xl font-bold text-white tracking-tight">
                    Tambah Modul
                  </h2>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Buat bab atau bagian baru untuk mengelompokkan konten.
                </p>
              </div>
              <form onSubmit={handleSubmit} className="p-8 space-y-5">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400">
                    <FileText className="w-3.5 h-3.5" />
                    Judul Modul
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="cth. Bab 1: Muqaddimah"
                    value={form.title}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, title: e.target.value }))
                    }
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-blue-500/50 focus:outline-none text-white text-sm placeholder-gray-600 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400">
                    <AlignLeft className="w-3.5 h-3.5" />
                    Deskripsi
                    <span className="text-gray-600 font-normal normal-case tracking-normal">
                      (opsional)
                    </span>
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Gambaran singkat isi modul ini..."
                    value={form.description}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, description: e.target.value }))
                    }
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-blue-500/50 focus:outline-none text-white text-sm placeholder-gray-600 transition-colors resize-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400">
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
                    className="w-32 px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-blue-500/50 focus:outline-none text-white text-sm transition-colors"
                  />
                </div>
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
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-linear-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-cyan-500 text-white text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        Buat Modul
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

interface AddContentModalProps {
  onClose: () => void;
  onSelectModule: () => void;
  onSelectItem: () => void;
}

const AddContentModal = ({
  onClose,
  onSelectModule,
  onSelectItem,
}: AddContentModalProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-md animate-in fade-in zoom-in-95 duration-300">
        <div className="absolute -inset-px rounded-[2.5rem] bg-linear-to-br from-blue-500/30 via-purple-500/20 to-transparent blur-sm pointer-events-none" />
        <div className="relative rounded-[2.5rem] bg-[#0E1420] border border-white/10 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.9)] overflow-hidden">
          <div className="relative px-8 pt-8 pb-6 border-b border-white/5">
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 blur-3xl rounded-full pointer-events-none" />
            <button
              onClick={onClose}
              className="absolute top-6 right-6 w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-2xl bg-blue-500/15 border border-blue-500/20 flex items-center justify-center">
                <Plus className="w-5 h-5 text-blue-400" />
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Tambah Hafalan
              </h2>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Pilih jenis konten yang ingin ditambahkan ke buku ini.
            </p>
          </div>
          <div className="p-6 space-y-4">
            <button
              onClick={onSelectModule}
              className="w-full group flex items-center gap-5 p-5 rounded-2xl bg-linear-to-r from-blue-500/10 to-transparent border border-blue-500/20 hover:border-blue-400/60 hover:from-blue-500/20 transition-all duration-300 text-left cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                <Layers className="w-6 h-6 text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-white text-base mb-1">
                  Tambah Modul
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Kelompokkan konten menjadi bab atau bagian terstruktur.
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
            </button>
            <button
              onClick={onSelectItem}
              className="w-full group flex items-center gap-5 p-5 rounded-2xl bg-linear-to-r from-emerald-500/10 to-transparent border border-emerald-500/20 hover:border-emerald-400/60 hover:from-emerald-500/20 transition-all duration-300 text-left cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                <FileText className="w-6 h-6 text-emerald-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-white text-base mb-1">
                  Tambah Item
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Tambahkan unit hafalan langsung, tanpa modul.
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ModuleCard = ({
  module,
  onClick,
}: {
  module: Module;
  onClick: () => void;
}) => {
  const itemCount = module.items?.length ?? 0;
  const childCount = module.children?.length ?? 0;
  return (
    <button
      onClick={onClick}
      className="group relative bg-[#0F1218]/80 backdrop-blur-md border border-white/5 rounded-2xl sm:rounded-[2rem] p-3 sm:p-6 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/30 hover:shadow-xl hover:shadow-blue-500/10 flex flex-col overflow-hidden"
    >
      <div className="absolute inset-0 bg-linear-to-b from-white/2 to-transparent opacity-100 group-hover:opacity-0 transition-opacity duration-300" />
      <div className="absolute inset-0 bg-linear-to-br from-blue-500/10 via-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute -right-6 -bottom-6 opacity-[0.03] group-hover:opacity-[0.08] transition-all duration-500 transform group-hover:scale-125 group-hover:-rotate-12 pointer-events-none">
        <Layers className="w-40 h-40 text-white" />
      </div>
      <div className="absolute top-2 right-4 text-7xl font-serif font-bold text-white/3 group-hover:text-blue-500/5 transition-colors duration-500 pointer-events-none select-none">
        {module.order}
      </div>
      <div className="relative z-10 mb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-sm sm:text-xl font-bold text-white mb-1 group-hover:text-blue-400 transition-colors duration-300 line-clamp-2">
              {module.title}
            </h3>
            <p className="text-gray-500 text-xs font-medium tracking-wide">
              MODUL
            </p>
          </div>
        </div>
      </div>
      <div className="relative z-10 flex-1 mb-4">
        {module.description ? (
          <div className="p-3 rounded-xl bg-white/2 group-hover:bg-white/5 transition-colors border border-transparent group-hover:border-white/5">
            <div className="flex items-center gap-2 mb-2">
              <AlignLeft className="w-3 h-3 text-gray-500" />
              <span className="text-[0.6rem] text-gray-500 uppercase tracking-wider font-bold">
                Deskripsi
              </span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed line-clamp-3">
              {module.description}
            </p>
          </div>
        ) : (
          <div className="p-3 rounded-xl bg-white/2 border border-dashed border-white/5 flex items-center justify-center h-full">
            <p className="text-xs text-gray-600 italic">Tidak ada deskripsi</p>
          </div>
        )}
      </div>
      <div className="relative z-10 grid grid-cols-2 gap-2 mt-auto pt-4 border-t border-white/5">
        <div className="flex flex-col p-2 rounded-xl bg-white/2 group-hover:bg-white/5 transition-colors border border-transparent group-hover:border-white/5">
          <div className="flex items-center gap-1.5 mb-1">
            <FileText className="w-3 h-3 text-blue-400" />
            <span className="text-[0.6rem] text-gray-500 uppercase tracking-wider font-bold">
              Item
            </span>
          </div>
          <span className="text-base font-mono font-bold text-blue-400 leading-none">
            {itemCount}
          </span>
        </div>
        <div className="flex flex-col p-2 rounded-xl bg-white/2 group-hover:bg-white/5 transition-colors border border-transparent group-hover:border-white/5">
          <div className="flex items-center gap-1.5 mb-1">
            <Layers className="w-3 h-3 text-purple-400" />
            <span className="text-[0.6rem] text-gray-500 uppercase tracking-wider font-bold">
              Sub-modul
            </span>
          </div>
          <span className="text-base font-mono font-bold text-purple-400 leading-none">
            {childCount}
          </span>
        </div>
      </div>
    </button>
  );
};

export const ClassroomBookDetailView = () => {
  const { classroomId, bookId } = useParams<{
    classroomId: string;
    bookId: string;
  }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isTeacher = user?.role === "teacher";

  const { book, loading, error, fetchBookDetail } = useBookDetail();
  const { tree, fetchBookTree, addModuleToTree, addItemToTree } = useBookTree();
  const { statusMap, fetchStatusMap } = useBookItemStatusMap();
  const { startPhase, loading: startLoading } = useStartItemPhase();

  const [modalStep, setModalStep] = useState<
    null | "picker" | "module" | "item"
  >(null);

  useEffect(() => {
    if (bookId) {
      fetchBookDetail(bookId);
      fetchBookTree(bookId, true);
      void fetchStatusMap();
    }
  }, [bookId, fetchBookDetail, fetchBookTree, fetchStatusMap]);

  const handleModuleCreated = (created: CreatedModule) => {
    addModuleToTree(bookId!, {
      id: created.id,
      title: created.title,
      description: created.description,
      order: created.order,
      items: [],
      children: [],
    });
  };

  const handleItemCreated = (created: CreatedItem) => {
    addItemToTree(bookId!, {
      id: created.id,
      book_id: created.book_id,
      title: created.title,
      content: created.content,
      answer: created.answer,
      image: created.image,
      order: created.order,
      estimated_review_seconds: created.estimated_review_seconds,
      review_count: 0,
      status: "belum_mulai",
      created_at: created.created_at,
      updated_at: created.updated_at,
    });
    void fetchBookTree(bookId!, true);
  };

  const handleStartItem = async (itemId: string) => {
    if (!bookId) return;
    try {
      const result = await startPhase(bookId, itemId);
      const itemsBookItemId = result.item_id;
      navigate(
        `/dashboard/pribadi/book/${bookId}/item/${itemsBookItemId}`,
      );
    } catch {
      toast.error("Gagal memulai item.");
    }
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  const statusConfig = {
    draft: {
      label: "Draft",
      icon: Lock,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
    },
    pending: {
      label: "Pending Review",
      icon: Clock,
      color: "text-orange-400",
      bg: "bg-orange-500/10",
      border: "border-orange-500/20",
    },
    published: {
      label: "Published",
      icon: Globe,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
    },
  };

  const status =
    statusConfig[book?.status as keyof typeof statusConfig] ??
    statusConfig.draft;
  const StatusIcon = status.icon;

  const modules = tree?.modules ?? [];
  const items = tree?.items ?? [];
  const nextOrder = modules.length + 1;

  return (
    <div className="min-h-screen bg-[#090A0F] text-white font-primary selection:bg-blue-500/30">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-15%] right-[-10%] w-[700px] h-[700px] bg-blue-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[120px]" />
      </div>

      <Sidebar isOpen={false} onClose={() => {}} />
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(`/dashboard/kelas/${classroomId}`)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/15 text-gray-400 hover:text-white transition-all duration-300 text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Kembali ke Kelas</span>
            </button>
          </div>

          {book && (
            <div className="hidden md:flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/5 border border-white/5 text-xs text-gray-400 max-w-xs truncate">
              <BookOpen className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span className="truncate font-medium text-white">
                {book.title}
              </span>
            </div>
          )}

          {isTeacher && (
            <button
              onClick={() => setModalStep("picker")}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-linear-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-cyan-500 text-white text-sm font-bold shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] transition-all duration-300 hover:-translate-y-0.5 active:scale-95"
            >
              <ListPlus className="w-4 h-4" />
              <span>Tambah Hafalan</span>
            </button>
          )}
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-40 gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-3xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
              </div>
              <div className="absolute inset-0 bg-blue-500/10 rounded-3xl blur-xl animate-pulse" />
            </div>
            <p className="text-gray-500 text-sm animate-pulse">
              Memuat detail buku...
            </p>
          </div>
        )}

        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-40 gap-4">
            <div className="w-16 h-16 rounded-3xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-rose-400" />
            </div>
            <p className="text-rose-400 text-sm font-medium">{error}</p>
            <button
              onClick={() => bookId && fetchBookDetail(bookId)}
              className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-medium text-gray-300 hover:text-white transition"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {!loading && !error && book && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="relative rounded-[2.5rem] overflow-hidden border border-white/5 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.8)]">
              <div className="relative h-56 sm:h-72 w-full overflow-hidden bg-[#0D1117]">
                {book.cover_image ? (
                  <>
                    <img
                      src={book.cover_image}
                      alt={book.title}
                      className="absolute inset-0 w-full h-full object-cover opacity-60"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-[#0D1117] via-[#0D1117]/60 to-transparent" />
                  </>
                ) : (
                  <>
                    <div className="absolute inset-0 bg-linear-to-br from-[#0D1117] via-[#111827] to-[#0F0A1A]" />
                    <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 blur-[80px] rounded-full" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/10 blur-[60px] rounded-full" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-20 h-20 rounded-[2rem] bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-xl shadow-2xl">
                        <ImageOff className="w-9 h-9 text-gray-600" />
                      </div>
                    </div>
                    <div className="absolute inset-0 bg-linear-to-t from-[#0D1117] via-transparent to-transparent" />
                  </>
                )}
                <div className="absolute top-5 left-5">
                  <div
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${status.bg} border ${status.border} backdrop-blur-xl shadow-lg`}
                  >
                    <StatusIcon className={`w-3.5 h-3.5 ${status.color}`} />
                    <span
                      className={`text-[11px] font-bold tracking-widest uppercase ${status.color}`}
                    >
                      {status.label}
                    </span>
                  </div>
                </div>
              </div>
              <div className="bg-[#0E1420] px-6 sm:px-10 py-8">
                <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight mb-3">
                  {book.title}
                </h1>
                <p className="text-gray-400 text-base leading-relaxed font-light max-w-2xl">
                  {book.description || "Tidak ada deskripsi untuk buku ini."}
                </p>
                <div className="flex flex-wrap items-center gap-5 mt-6 pt-6 border-t border-white/5">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="w-4 h-4 text-gray-600" />
                    <span>Dibuat {formatDate(book.created_at)}</span>
                  </div>
                  {book.published_at && (
                    <div className="flex items-center gap-2 text-sm text-emerald-500/80">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Dipublikasi {formatDate(book.published_at)}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="w-4 h-4 text-gray-600" />
                    <span>Diperbarui {formatDate(book.updated_at)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                {
                  label: "Total Item",
                  value: (tree?.items?.length ?? 0).toString(),
                  color: "text-blue-400",
                  bg: "from-blue-500/10",
                  border: "border-blue-500/15",
                },
                {
                  label: "Modul",
                  value: modules.length.toString(),
                  color: "text-purple-400",
                  bg: "from-purple-500/10",
                  border: "border-purple-500/15",
                },
              ].map((s) => (
                <div
                  key={s.label}
                  className={`relative overflow-hidden rounded-2xl bg-linear-to-br ${s.bg} to-transparent border ${s.border} p-5 text-center`}
                >
                  <div className={`text-3xl font-black ${s.color} mb-1`}>
                    {s.value}
                  </div>
                  <div className="text-[11px] font-bold uppercase tracking-widest text-gray-500">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>

            <div className="relative rounded-[2.5rem] overflow-hidden border border-white/5 bg-[#0E1420]">
              <div className="absolute top-0 inset-x-0 h-px bg-linear-to-r from-transparent via-blue-500/30 to-transparent" />
              <div className="px-8 py-7 border-b border-white/5 flex flex-col md:flex-row items-center justify-between">
                <h2 className="text-lg font-bold text-white flex items-center gap-2.5">
                  <Layers className="w-5 h-5 text-blue-400" />
                  Modul & Konten
                  {(modules.length > 0 || items.length > 0) && (
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold">
                      {modules.length + items.length}
                    </span>
                  )}
                </h2>
                {isTeacher && (
                  <button
                    onClick={() => setModalStep("picker")}
                    className="flex mt-2 md:mt-0 items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20 hover:border-blue-400/50 hover:bg-blue-500/20 text-blue-400 text-sm font-medium transition-all duration-300"
                  >
                    <Plus className="w-4 h-4" />
                    Tambah
                  </button>
                )}
              </div>

              {modules.length > 0 && (
                <div className="p-6 pb-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Layers className="w-4 h-4 text-purple-400" />
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                      Modul ({modules.length})
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    {modules
                      .slice()
                      .sort((a, b) => a.order - b.order)
                      .map((mod) => (
                        <ModuleCard
                          key={mod.id}
                          module={mod}
                          onClick={() =>
                            navigate(
                              `/dashboard/pribadi/book/${bookId}/module/${mod.id}`,
                            )
                          }
                        />
                      ))}
                  </div>
                </div>
              )}

              {items.length > 0 && (
                <>
                  <div className="px-8 py-4 border-t border-white/5">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                      <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                        Item ({items.length})
                      </h3>
                    </div>
                  </div>
                  <div className="p-8 pt-2">
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                      {items
                        .slice()
                        .sort((a, b) => a.order - b.order)
                        .map((item) => (
                          <div key={item.id} className="relative">
                            <BookItemCard
                              item={item}
                              bookId={bookId!}
                              realItemId={statusMap.get(contentRefForItem(bookId!, item.id))?.item_id}
                            />
                            {!isTeacher && (
                              <button
                                onClick={() => handleStartItem(item.id)}
                                disabled={startLoading}
                                className="absolute bottom-4 left-4 right-4 flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-emerald-900/30"
                              >
                                <Play className="w-4 h-4" />
                                {startLoading ? "Memulai..." : "Mulai"}
                              </button>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                </>
              )}

              {modules.length === 0 && items.length === 0 && (
                <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
                  <div className="relative mb-8">
                    <div className="w-20 h-20 rounded-[2rem] bg-[#161D29] border border-white/10 flex items-center justify-center shadow-2xl">
                      <BookOpen className="w-10 h-10 text-gray-600" />
                    </div>
                    <div className="absolute -inset-3 bg-blue-500/5 rounded-[2.5rem] blur-2xl pointer-events-none" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3 tracking-tight">
                    Buku Masih Kosong
                  </h3>
                  <p className="text-gray-500 text-sm max-w-sm leading-relaxed mb-8">
                    {isTeacher
                      ? "Mulai tambahkan modul pertama Anda untuk membangun kurikulum yang terstruktur."
                      : "Belum ada konten yang tersedia di buku ini."}
                  </p>
                  {isTeacher && (
                    <button
                      onClick={() => setModalStep("module")}
                      className="flex items-center gap-2.5 px-7 py-3.5 rounded-2xl bg-white text-black font-bold text-sm transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.15)] hover:shadow-[0_0_40px_rgba(255,255,255,0.3)]"
                    >
                      <Plus className="w-4 h-4" />
                      Tambah Modul Pertama
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {modalStep === "picker" && (
          <AddContentModal
            onClose={() => setModalStep(null)}
            onSelectModule={() => setModalStep("module")}
            onSelectItem={() => setModalStep("item")}
          />
        )}

        {modalStep === "module" && bookId && (
          <AddModuleModal
            bookId={bookId}
            nextOrder={nextOrder}
            onClose={() => setModalStep(null)}
            onCreated={handleModuleCreated}
          />
        )}

        {modalStep === "item" && bookId && (
          <AddItemModal
            bookId={bookId}
            nextOrder={nextOrder}
            onClose={() => setModalStep(null)}
            onCreated={(item) =>
              handleItemCreated(item as CreatedItem)
            }
          />
        )}
      </div>
    </div>
  );
};

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  BookOpen,
  Image,
  LayoutGrid,
  X,
  ChevronDown,
  Save,
  Upload,
} from "lucide-react";

export interface EditClassModalProps {
  isOpen: boolean;
  classData: {
    name: string;
    description: string;
    type: "book" | "quran";
    cover_image?: string;
  };
  onClose: () => void;
  onUpdate: (payload: {
    name: string;
    description: string;
    type: "book" | "quran";
    cover_image?: string | File;
  }) => void;
  isLoading?: boolean;
}

export const EditClassModal = ({
  isOpen,
  classData,
  onClose,
  onUpdate,
  isLoading = false,
}: EditClassModalProps) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    type: "book" | "quran";
    cover_image: string | File;
  }>({
    name: classData.name,
    description: classData.description,
    type: classData.type,
    cover_image: classData.cover_image ?? "",
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: classData.name,
        description: classData.description,
        type: classData.type,
        cover_image: classData.cover_image ?? "",
      });
    }
  }, [isOpen, classData]);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Separate handler for file input
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, cover_image: file }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setErrorMessage("Nama kelas wajib diisi");
      return;
    }

    setErrorMessage(null);
    onUpdate({
      name: formData.name.trim(),
      description: formData.description.trim(),
      type: formData.type as "book" | "quran",
      cover_image:
        formData.cover_image instanceof File
          ? formData.cover_image
          : formData.cover_image.trim() || undefined,
    });

    console.log(formData);
    console.log(formData.cover_image);
    console.log(formData.cover_image instanceof File);
  };

  return createPortal(
    <div className="fixed inset-0 z-9999 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div
        className="absolute inset-0"
        onClick={!isLoading ? onClose : undefined}
      />

      <div className="relative w-full max-w-2xl overflow-hidden rounded-[2rem] border border-white/10 bg-[#0A1120] shadow-[0_40px_100px_rgba(0,0,0,0.7)]">
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="absolute right-4 top-4 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-gray-300 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Tutup"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="relative overflow-hidden px-6 py-6 sm:px-8 sm:py-8">
          <div className="mb-8 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-inner shadow-white/5">
            <div className="flex items-center gap-3 text-cyan-300">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-300 border border-cyan-400/20">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300/80">
                  Edit Kelas
                </p>
                <h2 className="text-2xl font-black text-white">
                  Perbarui Data Kelas
                </h2>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-gray-400">
              Ubah nama, deskripsi, atau gambar sampul kelas. Simpan untuk
              menerapkan perubahan.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-white">
                Nama Kelas <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400">
                  <LayoutGrid className="h-5 w-5" />
                </div>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Contoh: Kelas Tahsin 101"
                  disabled={isLoading}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 py-4 pl-11 pr-4 text-white placeholder:text-gray-500 outline-none transition focus:border-cyan-400 focus:bg-white/10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-white">
                Deskripsi
              </label>
              <div className="relative">
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Opsional: Tambahkan ringkasan tentang kelas ini..."
                  rows={4}
                  disabled={isLoading}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 py-4 px-4 text-white placeholder:text-gray-500 outline-none transition focus:border-cyan-400 focus:bg-white/10 resize-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-white">
                Gambar Sampul (Opsional)
              </label>
              <div className="relative flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/5 p-6 text-center transition hover:bg-white/8 hover:border-cyan-400/30 min-h-36">
                {formData.cover_image ? (
                  <div className="relative z-10 flex flex-col items-center gap-2">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-300 border border-cyan-400/20">
                      <Image className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white truncate max-w-xs">
                        {formData.cover_image instanceof File
                          ? formData.cover_image.name
                          : formData.cover_image}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setFormData((prev) => ({ ...prev, cover_image: "" }));
                      }}
                      className="mt-2 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:underline cursor-pointer"
                    >
                      Hapus Gambar
                    </button>
                  </div>
                ) : (
                  <>
                    <input
                      type="file"
                      id="cover_image_upload"
                      accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                      onChange={handleFileChange}
                      disabled={isLoading}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    />
                    <div className="flex flex-col items-center gap-2 pointer-events-none">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/5 text-gray-400 border border-white/10">
                        <Upload className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-300">
                          Pilih atau seret gambar ke sini
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          PNG, JPG, atau JPEG (Maks. 5MB)
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
            {errorMessage ? (
              <p className="text-sm text-rose-400">{errorMessage}</p>
            ) : null}

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center rounded-2xl bg-linear-to-r from-cyan-500 to-blue-600 px-5 py-4 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              <span className="ml-2">Simpan Perubahan</span>
            </button>
          </form>
        </div>
      </div>
    </div>,
    document.body,
  );
};

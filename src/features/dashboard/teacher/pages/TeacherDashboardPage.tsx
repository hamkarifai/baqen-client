"use client";

import { useState } from "react";
import { useNavigate } from "react-router";
import { Menu, Plus, School } from "lucide-react";
import { Sidebar } from "@/components/ui/Sidebar";
import { QuickAccessCards } from "@/components/ui/QuickAccessCards";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { EmptyStateWrapper } from "@/components/ui/EmptyStateWrapper";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { SectionLoader } from "@/components/ui/SectionLoader";
import { ClassroomCard } from "@/features/classroom/components/dashboard/ClassroomCard";
import {
  useCreateClass,
  useMyClassesTeacher,
  useUpdateClass,
  useDeleteClass,
} from "@/features/classroom/hooks/useClassroom";
import type { ClassItem, ClassroomCardTone } from "@/features/classroom/types";
import { CreateClassButton } from "@/features/classroom/components/dashboard/CreateClassButton";
import { CreateClassModal } from "@/features/classroom/components/dashboard/modals/CreateClassModal";
import { SuccessModal } from "@/components/ui/SuccessModal";
import { EditClassModal } from "@/features/classroom/components/dashboard/modals/EditClassModal";
import { ConfirmModal } from "@/features/classroom/components/dashboard/modals/ConfirmModal";

export const TeacherDashboardPage = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedClassroom, setSelectedClassroom] = useState<ClassItem | null>(
    null,
  );
  const { mutate: updateClass, isPending: isUpdating } = useUpdateClass();
  const { mutate: deleteClass, isPending: isDeleting } = useDeleteClass();
  const { name } = useCurrentUser();
  const { data: classrooms, isLoading, isError, error } = useMyClassesTeacher();
  const tones: ClassroomCardTone[] = [
    "blue",
    "teal",
    "blue",
    "emerald",
    "amber",
    "violet",
    "rose",
    "indigo",
    "teal",
    "cyan",
    "fuchsia",
    "pink",
    "yellow",
    "lime",
    "gray",
  ];

  // Get initial letter for avatar
  const initialLetter = name.charAt(0).toUpperCase();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [successModal, setSuccessModal] = useState({
    isOpen: false,
    title: "",
    description: "",
  });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const { mutate, isPending: isCreating } = useCreateClass();

  return (
    <div className="min-h-screen bg-deep-universe text-white relative overflow-hidden font-primary max-w-7xl mx-auto p-6 md:p-10 transition-all duration-300">
      {/* Background Elements */}
      <div className="stars-overlay"></div>

      {/* Sidebar Integration */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Overlay for mobile sidebar */}
      <div
        className={`sidebar-overlay ${isSidebarOpen ? "active" : ""}`}
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <main className="relative z-10 p-4 md:p-8 transition-all">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-500/50 transition text-amber-500"
            >
              <Menu className="w-5 h-5 md:w-6 md:h-6" />
            </button>
            <div>
              <h1 className="text-xl md:text-3xl font-display font-bold text-white tracking-widest">
                DASHBOARD <span className="text-gold-premium">PENGAJAR</span>
              </h1>
              <p className="text-xs md:text-sm text-gray-400">
                Pusat Monitoring & Bimbingan Siswa
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-white font-serif font-medium">
                {name}
              </p>
              <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">
                Pengajar UnLupa
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-linear-to-b from-amber-500 to-amber-700 flex items-center justify-center font-serif font-bold text-black border-2 border-amber-400/50 shadow-lg shadow-amber-500/20">
              {initialLetter}
            </div>
          </div>
        </header>

        {/* QUICK ACCESS CARDS */}
        <QuickAccessCards role="teacher" />

        {/* CREATE CLASS BUTTON */}
        <CreateClassButton onClick={() => setIsCreateModalOpen(true)} />

        <EmptyStateWrapper
          description="Buat kelas baru untuk mengelola siswa dan materi"
          emptyTitle="Anda Belum Memiliki Kelas"
          icon={School}
          title="Kelas Buatan Saya"
          buttonText="Buat Kelas"
          buttonIcon={Plus}
          className="mb-10"
        >
          {isLoading ? (
            <SectionLoader message="Memuat kelas pengajar..." />
          ) : isError ? (
            <ErrorMessage
              title="Gagal memuat kelas"
              message={
                error instanceof Error
                  ? error.message
                  : String(error ?? "Terjadi kesalahan saat memuat kelas")
              }
            />
          ) : (
            <div className="grid md:grid-cols-3 gap-3">
              {classrooms?.map((classroom, index) => {
                const toneIndex = index % tones.length;
                return (
                  <ClassroomCard
                    key={classroom.id}
                    id={classroom.id}
                    title={classroom.name}
                    description={classroom.description}
                    coverImage={classroom?.cover_image}
                    bookCount={classroom.book_count}
                    memberCount={classroom.student_count}
                    classCode={classroom.class_code}
                    tone={tones[toneIndex]}
                    onClick={() => navigate(`/dashboard/kelas/${classroom.id}`)}
                    onEdit={() => {
                      setSelectedClassroom(classroom);
                      setIsEditModalOpen(true);
                    }}
                    onDelete={() => {
                      setIsDeleteModalOpen(true);
                      setSelectedClassroom(classroom);
                    }}
                  />
                );
              })}
            </div>
          )}
        </EmptyStateWrapper>
      </main>

      <EditClassModal
        isOpen={isEditModalOpen}
        classData={{
          name: selectedClassroom?.name ?? "",
          description: selectedClassroom?.description ?? "",
          type: selectedClassroom?.type ?? "book",
          cover_image: selectedClassroom?.cover_image ?? "",
        }}
        isLoading={isUpdating}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedClassroom(null);
        }}
        onUpdate={(data) => {
          if (!selectedClassroom) return;

          updateClass(
            {
              classId: selectedClassroom.id,
              payload: data,
            },
            {
              onSuccess: () => {
                setIsEditModalOpen(false);
                setSelectedClassroom(null);
                setSuccessModal({
                  isOpen: true,
                  title: "Kelas berhasil diupdate",
                  description:
                    "Kelas berhasil diupdate, anda dapat melihatnya di halaman kelas",
                });
                setTimeout(() => {
                  setSuccessModal((prev) => ({
                    ...prev,
                    isOpen: false,
                  }));
                }, 3000);
              },
              onError: () => {
                setIsEditModalOpen(false);
                setSelectedClassroom(null);
                setSuccessModal({
                  isOpen: true,
                  title: "Gagal mengupdate kelas",
                  description:
                    "Gagal mengupdate kelas, anda dapat melihatnya di halaman kelas",
                });
                setTimeout(() => {
                  setSuccessModal((prev) => ({
                    ...prev,
                    isOpen: false,
                  }));
                }, 3000);
              },
            },
          );
        }}
      />

      <CreateClassModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={(data) => {
          mutate(data, {
            onSuccess: () => {
              setIsCreateModalOpen(false);
              setSuccessModal({
                isOpen: true,
                title: "Kelas berhasil dibuat",
                description:
                  "Kelas berhasil dibuat, anda dapat melihatnya di halaman kelas",
              });
              setTimeout(() => {
                setSuccessModal((prev) => ({
                  ...prev,
                  isOpen: false,
                }));
              }, 3000);
            },
            onError: () => {
              setIsCreateModalOpen(false);
              setSuccessModal({
                isOpen: true,
                title: "Gagal membuat kelas",
                description:
                  "Kelas gagal dibuat, anda dapat melihatnya di halaman kelas",
              });
              setTimeout(() => {
                setSuccessModal((prev) => ({
                  ...prev,
                  isOpen: false,
                }));
              }, 3000);
            },
          });
        }}
        isLoading={isCreating}
      />

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        title="Konfirmasi Hapus Kelas"
        description={`Apakah Anda yakin ingin menghapus kelas "${selectedClassroom?.name ?? ""}"? Tindakan ini tidak dapat dibatalkan.`}
        variant="danger"
        isLoading={isDeleting}
        confirmText="Hapus Kelas"
        cancelText="Batal"
        onConfirm={() => {
          if (!selectedClassroom) return;

          deleteClass(selectedClassroom.id, {
            onSuccess: () => {
              setIsDeleteModalOpen(false);
              setSelectedClassroom(null);
              setSuccessModal({
                isOpen: true,
                title: "Kelas berhasil dihapus",
                description: "Kelas telah berhasil dihapus dari sistem.",
              });
              setTimeout(() => {
                setSuccessModal((prev) => ({
                  ...prev,
                  isOpen: false,
                }));
              }, 3000);
            },
            onError: () => {
              setIsDeleteModalOpen(false);
              setSelectedClassroom(null);
              setSuccessModal({
                isOpen: true,
                title: "Gagal menghapus kelas",
                description: "Terjadi kesalahan saat menghapus kelas.",
              });
              setTimeout(() => {
                setSuccessModal((prev) => ({
                  ...prev,
                  isOpen: false,
                }));
              }, 3000);
            },
          });
        }}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedClassroom(null);
        }}
      />

      <SuccessModal
        isOpen={successModal.isOpen}
        title={successModal.title}
        description={successModal.description}
        onClose={() =>
          setSuccessModal((prev) => ({
            ...prev,
            isOpen: false,
          }))
        }
      />
    </div>
  );
};

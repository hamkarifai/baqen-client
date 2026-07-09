import { ClassroomCard } from "@/features/classroom/components/dashboard/ClassroomCard";
import { CreateClassButton } from "../components/dashboard/CreateClassButton";
import { ClassroomSearchInput } from "../components/shared/ClassroomSearchInput";
import { ClassroomHeader } from "../components/dashboard/ClassroomHeader";
import { TabsNavigation } from "../components/navigation/TabsNavigation";
import { EmptyStateWrapper } from "@/components/ui/EmptyStateWrapper";
import { Book, BookAlertIcon } from "lucide-react";
import { QuickAccessCard } from "../components/dashboard/QuickAccessSection";
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
const classroomSamples = [
  {
    title: "Tahsin & Hafalan Juz 30",
    description:
      "Kelas intensif untuk menjaga hafalan pendek dengan review harian dan pemantauan guru.",
    teacherName: "Ust. Ahmad Fauzi",
    memberCount: 28,
    bookCount: 3,
    type: "quran" as const,
    activeReviewCount: 86,
    nextSessionLabel: "Sesi berikutnya: Kamis, 19.30",
    tone: "emerald" as const,
  },
  {
    title: "Kitab Adab Penuntut Ilmu",
    description:
      "Ruang belajar kitab pilihan dengan target pemahaman bertahap dan catatan murajaah.",
    teacherName: "Ustzh. Khadijah Amin",
    memberCount: 16,
    bookCount: 2,
    type: "book" as const,
    activeReviewCount: 41,
    nextSessionLabel: "Review bersama: Jumat, 06.00",
    tone: "blue" as const,
  },
  {
    title: "Kelas Percobaan Santri Baru",
    description:
      "Wadah onboarding untuk mengecek ritme belajar, komitmen review, dan kesiapan materi.",
    teacherName: "Admin UNLUPA",
    memberCount: 9,
    bookCount: 1,
    type: "book" as const,
    activeReviewCount: 12,
    nextSessionLabel: "Belum ada jadwal tetap",
    status: "draft" as const,
    tone: "amber" as const,
  },
];

export const ClassroomCardSandbox = () => {
  return (
    <main className="min-h-screen bg-[#090A0F] px-4 py-8 text-white sm:px-6 lg:px-10">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute right-[-12%] top-[-18%] h-155 w-155 rounded-full bg-blue-500/6 blur-[120px]" />
        <div className="absolute bottom-[-20%] left-[-14%] h-130 w-130 rounded-full bg-emerald-500/6 blur-[120px]" />
      </div>

      <section className="relative z-10 mx-auto max-w-6xl">
        <ClassroomHeader
          title="Preview Classroom"
          subtitle="Draft tampilan komponen classroom UNLUPA untuk header, pencarian, CTA, dan kartu kelas."
          totalClasses={3}
          totalStudents={53}
          totalBooks={6}
          activeReviews={139}
        />

        <div className="mt-6">
          <ClassroomSearchInput />
        </div>

        <div className="mt-6 w-full grid grid-cols-2 gap-3">
          <QuickAccessCard
            color="blue"
            description="tes"
            href="#karya"
            icon={BookAlertIcon}
            title="uhuy"
          />
          <QuickAccessCard
            color="blue"
            description="tes"
            href="#karya"
            icon={BookAlertIcon}
            title="uhuy"
          />
        </div>

        <div className="mt-6 ">
          <TabsNavigation
            tabs={[
              { id: "all", label: "All" },
              { id: "active", label: "Active" },
              { id: "draft", label: "Draft" },
            ]}
            activeTab="all"
            onTabChange={() => {}}
          />
        </div>

        <div className="mt-6">
          <CreateClassButton />
        </div>

        <div className="grid grid-cols-1 mt-8 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {classroomSamples.map((classroom) => (
            <ClassroomCard key={classroom.title} {...classroom} />
          ))}
        </div>
      </section>

      {/* <JoinClassModal
        isOpen={true}
        onClose={() => {}}
        onJoin={() => {}}
      /> */}

      {/* <ConfirmModal
        isOpen={true}
        title="Konfirmasi Bergabung"
        description="Anda akan bergabung dengan kelas Tahsin & Tajwid Al-Quran. Lanjutkan?"
        confirmText="Ya, Bergabung"
        cancelText="Batal"
        variant="info"
        isLoading={false}
        onClose={() => {}}
        onConfirm={() => {}}
      /> */}

      {/* <CreateClassModal
        isOpen={true}
        onClose={() => {}}
        onCreate={() => {}}
      /> */}

      {/* <EditClassModal
        isOpen={isEditModalOpen}
        classData={{
          name: "Kelas Tahsin 101",
          description: "Deskripsi awal",
          type: "book",
          image: "https://example.com/image.jpg",
        }}
        onClose={() => setIsEditModalOpen(false)}
        onUpdate={(payload) => {
          // payload handled: update logic executed — logging removed for production
          setIsEditModalOpen(false);
        }}
      /> */}

      <div className="mt-6">
        <EmptyStateWrapper
          icon={Book}
          title="Classroom"
          emptyTitle="Classroom"
          description="Draft tampilan komponen classroom UNLUPA untuk header, pencarian, CTA, dan kartu kelas."
          buttonText="Create Class"
          buttonIcon={CreateClassButton}
          onButtonClick={() => {}}
        />
      </div>
    </main>
  );
};

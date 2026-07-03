import { useState } from "react";
import { useNavigate } from "react-router";
import { Sidebar } from "@/components/ui/Sidebar";
import { TopNavigationBar } from "@/features/classroom/components/navigation/TopNavigationBar";
import HeaderSection from "@/features/classroom/components/shared/HeaderSection";
import DynamicBackgroundAtmosphere from "@/features/classroom/components/shared/DynamicBackgroundAtmosphere";
import BackgroundAmbience from "@/features/classroom/components/shared/BackgroundAmbience";
import MobileSidebarOverlay from "@/features/classroom/components/navigation/MobileSidebarOverlay";
import { ClassroomCard } from "@/features/classroom/components/dashboard/ClassroomCard";
import { EmptyStateWrapper } from "@/components/ui/EmptyStateWrapper";
import { Plus, School } from "lucide-react";
import { QuickAccessCard } from "@/features/classroom/components/dashboard/QuickAccessSection";
import { DailyReviewSection } from "@/components/ui/DailyReviewSection";
import JoinClassSection from "@/features/classroom/components/dashboard/JoinClassSection";
import { useMyJoinedClass } from "../hooks/useClassroom";
import type { ClassroomCardTone } from "../types";

export const StudentDashboard = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const { data: classes } = useMyJoinedClass();
  console.log("CLASSES", classes)
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

  return (
    <div className="min-h-screen bg-deep-universe text-white font-sans selection:bg-blue-500/30">
      {/* Background Ambience */}
      <BackgroundAmbience />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="min-h-screen relative rounded-3xl overflow-hidden selection:bg-blue-500/30">
          {/* --- Dynamic Background Atmosphere --- */}
          <DynamicBackgroundAtmosphere />

          {/* Sidebar */}
          <Sidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />

          {/* Overlay for mobile sidebar */}
          <MobileSidebarOverlay
            isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen}
          />

          <div className="p-4 sm:p-6 lg:p-8 animate-fadeIn max-w-400 mx-auto relative z-10">
            <TopNavigationBar
              info="Ruang Kelas"
              setIsSidebarOpen={setIsSidebarOpen}
            />

            <HeaderSection
              workspace="Dashboard Siswa"
              mainTitle="Ruang"
              secTitle="Kelas"
              subtitle="Akses jadwal belajar, bergabung dengan kelas, dan pantau progres hafalan harian secara real-time."
            />

            <div className="grid mt-6 grid-cols-2 gap-2">
              <QuickAccessCard
                title="Masuk Kelas"
                description="Masukkan kode untuk bergabung dengan kelas."
                href="#masuk-kelas"
                color="blue"
                icon={Plus}
              />
              <QuickAccessCard
                title="Kelas Saya"
                description="Kelas yang sudah Anda ikuti dan aktif saat ini."
                href="#kelas-saya"
                color="green"
                icon={School}
              />
            </div>

            <DailyReviewSection />

            <div id="masuk-kelas">
              <JoinClassSection />
            </div>

            <div id="kelas-saya">
              <EmptyStateWrapper
                // Header
                title="Kelas Saya"
                badge="Kelas"
                subtitle="Berikut adalah daftar kelas yang sudah anda ikuti. "
                // Empty State
                emptyTitle="Anda belum bergabung di kelas manapun"
                description="Yuk, cari dan bergabung dengan kelas yang sesuai minat dan level kemampuan Anda untuk memulai perjalanan belajar bersama!"
                // Icons
                icon={School}
                buttonIcon={Plus}
                // Action
                onButtonClick={() => {
                  // Debug log removed for production
                }}
                // Optional Styling
                mainBgColor="bg-[#020817]"
                wrapperGradient="bg-gradient-to-b from-[#081225] to-[#030712]"
                glowColor="bg-blue-500/10"
                borderColor="border-blue-500/10"
                // Optional Button Styling
                buttonClassName="hover:scale-[1.02]"
              >
                {classes && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                    {[...classes].reverse()?.map((item, index) => {
                      const toneIndex = index % tones.length;
                      return (
                        <ClassroomCard
                          key={item.id}
                          id={item.id}
                          title={item.name}
                          coverImage={item.cover_image}
                          memberCount={item.student_count}
                          bookCount={item.book_count}
                          tone={tones[toneIndex]}
                          description={item.description}
                          teacherName={item.owner_name}
                          onClick={() =>
                            navigate(`/dashboard/kelas/${item.id}`)
                          }
                        />
                      );
                    })}
                  </div>
                )}
              </EmptyStateWrapper>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

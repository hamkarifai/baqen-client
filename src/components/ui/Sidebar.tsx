import { useState } from "react";
import { useAuthStore } from "@/features/auth/stores/auth.store";
import { X } from "lucide-react";
import { SidebarRoleSwitcher } from "@/components/ui/SidebarRoleSwitcher";
import { DashboardSidebarFooter } from "@/components/ui/SidebarFooter";
import { LogoutConfirmModal } from "@/features/dashboard/components/LogoutConfirmModal";
import { SidebarNavItems } from "@/components/ui/SidebarNavItems";
import {
  sidebarClassItems,
  NavClassItem,
} from "@/components/ui/SidebarClassItems";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const role = useAuthStore((s) => s.user?.role);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  return (
    <>
      {/* SIDEBAR DRAWER */}
      <aside className={`sidebar ${isOpen ? "active" : ""}`}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded border border-amber-500/30 flex items-center justify-center bg-white/5 overflow-hidden">
              <img 
                src="/unlupa.logo.png" 
                alt="UNLUPA Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <span className="font-cinzel font-bold text-xl text-white tracking-widest">
              UNLUPA
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role Switcher */}
        {(role === "admin" || role === "teacher") && (
          <div className="mb-8">
            <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-2 px-1">
              Mode Akun
            </p>
            <SidebarRoleSwitcher onClose={onClose} />
          </div>
        )}

        {/* Navigasi */}
        <div className="mb-8">
          <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-2 px-1">
            Navigasi
          </p>
          <SidebarNavItems />
        </div>

        {/* Room Navigation */}
        <div className="flex-1 overflow-y-auto pr-2">
          <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-3 px-1">
            Ruang Belajar
          </p>

          {sidebarClassItems.map((item) => (
            <NavClassItem
              key={item.title}
              title={item.title}
              description={item.description}
              icon={item.icon}
              color={item.color}
              navClass={item.navClass}
              href={item.href}
              onClose={onClose}
            />
          ))}
        </div>

        {/* Sidebar Footer */}
        <DashboardSidebarFooter setShowLogoutConfirm={setShowLogoutConfirm} />
      </aside>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <LogoutConfirmModal setShowLogoutConfirm={setShowLogoutConfirm} />
      )}
    </>
  );
};

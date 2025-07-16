"use client";
import { BsPeople } from "react-icons/bs";
import { IoChatbubblesOutline } from "react-icons/io5";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { signOut } from "next-auth/react";
import Loading from "./loading";
import ChangePasswordPopup from "./profile/ChangePasswordPopup";
import PopupCustom from "./popupCustom";

const ProfilePopup = dynamic(() => import("./profile/ProfilePopup"), {
  ssr: false,
});

export default function Taskbar() {
  const [tab, setTab] = useState<string>("chat");
  const { user, refreshToken } = useSelector((state: RootState) => state.auth);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const menuItems = [
    {
      name: "Chat",
      icon: <IoChatbubblesOutline size={28} className="text-icon-background" />,
      activeIcon: <IoChatbubblesOutline size={28} className="text-white" />,
      href: "/apps/chats",
    },
    {
      name: "Friends",
      icon: <BsPeople size={28} className="text-icon-background" />,
      activeIcon: <BsPeople size={28} className="text-white" />,
      href: "/apps/friends",
    },
    // {
    //   name: "Notifications",
    //   icon: (
    //     <IoMdNotificationsOutline size={28} className="text-icon-background" />
    //   ),
    //   activeIcon: <IoMdNotificationsOutline size={28} className="text-white" />,
    //   href: "/apps/notifications",
    // },
  ];
  // const userItems = [
  //   {
  //     name: "Profile",
  //     icon: <FaRegUser size={28} className="text-icon-background" />,
  //     activeIcon: <FaRegUser size={28} className="text-white" />,
  //     href: "/apps/profile",
  //   },
  // ];
  const pathname = usePathname();

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      });
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsLoading(false);
    }
    await signOut({ callbackUrl: "/auth/login" });
    sessionStorage.clear();
  };

  return (
    <div className="h-full flex flex-col px-3 pt-[40px] border-r border-gray-200 bg-primary items-center">
      <Loading isLoading={isLoading} />
      {menuItems.map((item) => (
        <Link href={item.href} key={item.name}>
          <div
            className={`mt-4 p-[7px]  ${
              pathname.includes(item.href) &&
              "bg-icon-background/50 rounded-2xl"
            }`}
          >
            {pathname.includes(item.href) ? item.activeIcon : item.icon}
          </div>
        </Link>
      ))}
      <div className="mt-auto mb-7 flex flex-col items-center relative">
        {/* Avatar user */}
        <button
          className="focus:outline-none"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <img
            src={user?.avatar || "/images/default-avatar.jpg"}
            alt="avatar"
            className="w-12 h-12 rounded-full border-2 border-gray-300 bg-white object-scale-down shadow"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = "/images/default-avatar.jpg";
            }}
          />
        </button>
        {/* Dropdown menu */}
        {menuOpen && (
          <>
            {/* Overlay */}
            <div
              className="fixed inset-0 z-40 bg-black/30"
              onClick={() => setMenuOpen(false)}
            ></div>
            <div className="absolute left-5 bottom-full mb-3 z-50 bg-white rounded-md shadow-lg py-2 w-48 animate-fadeIn border">
              <button
                className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-800"
                onClick={() => {
                  setMenuOpen(false);
                  setProfileOpen(true);
                }}
              >
                Account information
              </button>
              <button
                className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-800"
                onClick={() => {
                  setMenuOpen(false);
                  setShowConfirm(true);
                }}
              >
                Change password
              </button>
              <button
                className="w-full text-left px-4 py-2 hover:bg-red-100 text-red-600 border-t"
                onClick={() => {
                  setMenuOpen(false);
                  handleLogout();
                }}
              >
                Logout
              </button>
            </div>
          </>
        )}
      </div>
      {/* Popup xác nhận đổi mật khẩu */}
      <PopupCustom
        isOpen={showConfirm}
        title="Confirm"
        message="Are you sure you want to change your password?"
        onConfirm={() => {
          setShowConfirm(false);
          setShowChangePassword(true);
        }}
        onCancel={() => setShowConfirm(false)}
      />
      {/* Popup đổi mật khẩu */}
      <ChangePasswordPopup
        isOpen={showChangePassword}
        onClose={() => setShowChangePassword(false)}
      />
      {/* Profile Popup luôn render ngoài menuOpen */}
      <ProfilePopup
        isOpen={profileOpen}
        onClose={() => setProfileOpen(false)}
      />
    </div>
  );
}

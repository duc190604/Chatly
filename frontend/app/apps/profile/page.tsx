"use client";
import { useState } from "react";
import { signOut } from "next-auth/react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

export default function ProfilePage() {
  const { user, refreshToken } = useSelector((state: RootState) => state.auth);
  const [editOpen, setEditOpen] = useState(false);
  const [editData, setEditData] = useState({
    username: user?.username || "",
    description: user?.description || "",
    avatar: user?.avatar || "",
    avatarFile: null as File | null,
    coverImage: user?.coverImage || "",
    coverFile: null as File | null,
    birthday: user?.birthday
      ? new Date(user.birthday).toISOString().slice(0, 10)
      : "",
  });
  const [previewAvatar, setPreviewAvatar] = useState(user?.avatar || "");
  const [previewCover, setPreviewCover] = useState(user?.coverImage || "");

  const handleLogout = async () => {
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
    }
    signOut({ callbackUrl: "/auth/login" });
    sessionStorage.clear();
  };

  if (!user) return null;

  // Xử lý chọn avatar mới
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEditData((prev) => ({ ...prev, avatarFile: file }));
      const reader = new FileReader();
      reader.onload = (ev) => {
        setPreviewAvatar(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Xử lý chọn cover mới
  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEditData((prev) => ({ ...prev, coverFile: file }));
      const reader = new FileReader();
      reader.onload = (ev) => {
        setPreviewCover(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Xử lý submit form chỉnh sửa
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEditOpen(false);
  };

  // Hàm xác định màu status
  const getStatusColor = (status?: string) => {
    if (!status) return "bg-gray-200 text-gray-600";
    if (status.toLowerCase() === "online")
      return "bg-green-100 text-green-700 border-green-300";
    return "bg-gray-200 text-gray-600 border-gray-300";
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white rounded-lg w-[400px] max-w-[95vw] shadow-xl h-[95%] overflow-auto">
        {/* Cover Image */}
        <div className="relative h-40 bg-gradient-to-br from-green-400 to-blue-500 rounded-t-lg">
          <img
            src={user.coverImage || "/images/background.png"}
            alt="cover"
            className="w-full h-full object-cover rounded-t-lg"
          />
          <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2">
            <img
              src={user.avatar || "/images/default-avatar.jpg"}
              alt="avatar"
              className="w-20 h-20 rounded-full border-4 border-white shadow-lg object-cover"
            />
          </div>
        </div>
        {/* User Info */}
        <div className="px-4 pt-14 pb-4">
          <div className="flex flex-col items-center mb-3 w-full justify-center">
            <h3 className="text-xl font-semibold text-center">
              {user.username}
            </h3>
            {user.status && (
              <span
                className={`px-2 py-1 text-xs rounded mt-2 border ${getStatusColor(
                  user.status
                )} font-medium`}
              >
                {user.status}
              </span>
            )}
          </div>
          {/* Description */}
          <div className="mb-4 text-center">
            <span className="text-gray-700 text-sm">
              {user.description || "No description"}
            </span>
          </div>
          {/* Contact Info */}
          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Email</span>
              <span className="text-sm font-medium break-all">
                {user.email}
              </span>
            </div>
            {user.birthday && (
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Birthday</span>
                <span className="text-sm text-gray-600">
                  {new Date(user.birthday).toLocaleDateString("vi-VN")}
                </span>
              </div>
            )}
            {user.createdAt && (
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-gray-600">Joined Chatly</span>
                <span className="text-sm text-gray-600">
                  {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                </span>
              </div>
            )}
          </div>
          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setEditOpen(true)}
              className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors font-medium shadow"
            >
              Edit information
            </button>
            <button
              onClick={handleLogout}
              className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-colors font-medium shadow"
            >
              Logout
            </button>
          </div>
        </div>
        {/* Popup chỉnh sửa */}
        {editOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-xl w-[350px] max-w-[90vw] shadow-2xl p-6 relative animate-fadeIn">
              <h2 className="text-lg font-semibold mb-4 text-center">
                Edit information
              </h2>
              <form onSubmit={handleEditSubmit} className="flex flex-col gap-4">
                {/* Cover Image */}
                <div className="flex flex-col items-center">
                  <label
                    htmlFor="cover-upload"
                    className="cursor-pointer w-full block mb-2"
                  >
                    <img
                      src={previewCover || "/images/background.png"}
                      alt="cover preview"
                      className="w-full h-24 object-cover rounded-lg border mb-2 hover:opacity-80 transition"
                    />
                  </label>
                  <input
                    id="cover-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleCoverChange}
                  />
                  <span className="text-xs text-gray-400">
                    Click on the image to change the cover
                  </span>
                </div>
                {/* Avatar */}
                <div className="flex flex-col items-center -mt-10">
                  <label htmlFor="avatar-upload" className="cursor-pointer">
                    <img
                      src={previewAvatar || "/images/default-avatar.jpg"}
                      alt="avatar preview"
                      className="w-20 h-20 rounded-full border-2 border-blue-400 object-cover mb-2 hover:opacity-80 transition"
                    />
                  </label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                  <span className="text-xs text-gray-400">
                    Click on the image to change the avatar
                  </span>
                </div>
                <input
                  type="text"
                  className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  placeholder="Display name"
                  value={editData.username}
                  onChange={(e) =>
                    setEditData((prev) => ({
                      ...prev,
                      username: e.target.value,
                    }))
                  }
                  required
                />
                <textarea
                  className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
                  placeholder="Description"
                  value={editData.description}
                  onChange={(e) =>
                    setEditData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  rows={3}
                />
                {/* Birthday */}
                <div className="flex flex-col gap-1">
                  <label htmlFor="birthday" className="text-sm text-gray-600">
                    Birthday
                  </label>
                  <input
                    id="birthday"
                    type="date"
                    className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    value={editData.birthday}
                    onChange={(e) =>
                      setEditData((prev) => ({
                        ...prev,
                        birthday: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="flex gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setEditOpen(false)}
                    className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Save
                  </button>
                </div>
              </form>
              <button
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl"
                onClick={() => setEditOpen(false)}
                aria-label="Close"
              >
                ×
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

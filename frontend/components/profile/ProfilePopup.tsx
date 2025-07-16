import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { FiEdit2 } from "react-icons/fi";
import {
  FaSmile,
  FaFrown,
  FaMeh,
  FaRegMeh,
  FaEyeSlash,
  FaAngry,
} from "react-icons/fa";
import axiosInstance from "@/lib/axiosInstance";
import uploadFile from "@/lib/uploadImage";
import { setUser } from "@/redux/features/authSlice";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import Loading from "../loading";

interface ProfilePopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export const STATUS_OPTIONS = [
  {
    value: "Happy",
    label: "Happy",
    icon: <FaSmile className="text-yellow-500" />,
    color: "bg-yellow-50 text-yellow-600 border-yellow-200",
  },
  {
    value: "Sad",
    label: "Sad",
    icon: <FaFrown className="text-blue-400" />,
    color: "bg-blue-50 text-blue-600 border-blue-200",
  },
  {
    value: "Bored",
    label: "Bored",
    icon: <FaMeh className="text-gray-400" />,
    color: "bg-gray-50 text-gray-500 border-gray-200",
  },
  {
    value: "Normal",
    label: "Normal",
    icon: <FaRegMeh className="text-green-400" />,
    color: "bg-green-50 text-green-600 border-green-200",
  },
  {
    value: "Angry",
    label: "Angry",
    icon: <FaAngry className="text-red-500" />,
    color: "bg-red-50 text-red-600 border-red-200",
  },
];

const ProfilePopup: React.FC<ProfilePopupProps> = ({ isOpen, onClose }) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const [isEdit, setIsEdit] = useState(false);
  const [isEditStatus, setIsEditStatus] = useState(false);
  const { data: session, update } = useSession();
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
  const [status, setStatus] = useState(user?.status || "Normal");
  const [previewAvatar, setPreviewAvatar] = useState(user?.avatar || "");
  const [previewCover, setPreviewCover] = useState(user?.coverImage || "");
  const [isLoading, setIsLoading] = useState(false);
  // Reset khi đóng popup hoặc khi user thay đổi
  useEffect(() => {
    if (!isOpen) {
      setIsEdit(false);
      setIsEditStatus(false);
      setEditData({
        username: user?.username || "",
        description: user?.description || "",
        avatar: user?.avatar || "",
        avatarFile: null,
        coverImage: user?.coverImage || "",
        coverFile: null,
        birthday: user?.birthday
          ? new Date(user.birthday).toISOString().slice(0, 10)
          : "",
      });
      setStatus(user?.status || "");
      setPreviewAvatar(user?.avatar || "");
      setPreviewCover(user?.coverImage || "");
    }
  }, [isOpen, user]);

  if (!isOpen || !user) return null;

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
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    let data: any = {
      username: editData.username,
      description: editData.description,
      birthday: editData.birthday,
    };
    try {
       if (editData.avatarFile) {
      const urlAvatar = await uploadFile(editData.avatarFile);
      data.avatar = urlAvatar.url;
    }
    if (editData.coverFile) {
      const urlCover = await uploadFile(editData.coverFile);
      data.coverImage = urlCover.url;
    }
    const response = await axiosInstance.put("/api/users/update", data);
    const newUser = response.data.data;
    dispatch(setUser(newUser));
    update({
      ...session,
      user: {
        ...session?.user,
        ...newUser,
      },
    });
    toast.success("Update information successfully");
    onClose();
    setIsEdit(false);
    setIsEditStatus(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.error?.message || "Update information failed");
    } finally {
      setIsLoading(false);
    }
  };
  const handleChangeStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await axiosInstance.post("/api/users/change-status", {
        status: status,
      });
      dispatch(setUser({
        ...user,
        status: status,
      }));
      update({
        ...session,
        user: {
          ...session?.user,
          status: status,
        },
      });
      toast.success("Update status successfully");
      setIsEditStatus(false);
    } catch (error: any) {
      setStatus(user?.status || "");
      toast.error(error?.response?.data?.error?.message || "Update status failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <Loading isLoading={isLoading} />
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose}></div>
      <div className="bg-white rounded-lg w-[400px] max-w-[95vw] shadow-xl h-auto overflow-auto relative animate-fadeIn">
        {/* Title */}
        <div className="pt-1 pb-1 ml-3 flex items-center">
          <h2 className="text-base font-medium text-gray-800">
            Account information
          </h2>
          <div className="flex items-center gap-2 flex-1">
            {!isEdit && (
              <button
                className="text-gray-500 hover:text-blue-500 text-lg ml-2 "
                onClick={() => setIsEdit(true)}
                title="Update information"
              >
                <FiEdit2 className="w-4 h-4" />
              </button>
            )}
            <button
              className="text-gray-400 hover:text-gray-700 text-2xl z-10 mr-3 ml-auto"
              onClick={onClose}
              aria-label="Close"
            >
              ×
            </button>
          </div>
        </div>
        {/* Content */}
        {!isEdit ? (
          <>
            {/* Cover Image */}
            <div className="relative h-40 bg-white border-1 border-gray-100">
              <img
                src={user.coverImage || "/images/default-avatar.jpg"}
                alt="cover"
                className="w-full h-full object-scale-down"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "/images/default-avatar.jpg";
                }}
              />
              <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2">
                <img
                  src={user.avatar || "/images/default-avatar.jpg"}
                  alt="avatar"
                  className="w-20 h-20 rounded-full border-1 border-gray-200 bg-white shadow-lg object-scale-down"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "/images/default-avatar.jpg";
                  }}
                />
              </div>
            </div>
            {/* User Info */}
            <div className="px-4 pt-14 pb-4">
              <div className="flex flex-col items-center mb-3 w-full justify-center">
                <h3 className="text-xl font-semibold text-center">
                  {user.username}
                </h3>
                {/* Status riêng */}
                <div className="flex items-center gap-2 mt-2 group relative w-full justify-center">
                  {!isEditStatus ? (
                    <>
                      {status ? (
                        <span
                          className={`px-2 py-1 text-xs rounded border font-medium flex items-center gap-1 transition-all duration-200 ${
                            STATUS_OPTIONS.find((s) => s.value === status)
                              ?.color ||
                            "bg-gray-100 text-gray-500 border-gray-300"
                          }`}
                        >
                          {STATUS_OPTIONS.find((s) => s.value === status)?.icon}
                          {status}
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs rounded border bg-gray-100 text-gray-400 border-gray-300 font-medium flex items-center gap-1 transition-all duration-200">
                          <FaRegMeh className="text-gray-300" /> No status
                        </span>
                      )}
                      <button
                        className="ml-1 text-gray-400 hover:text-blue-500 text-sm opacity-0 group-hover:opacity-100 transition-opacity absolute right-0 top-1/2 -translate-y-1/2"
                        onClick={() => setIsEditStatus(true)}
                        title="Edit status"
                        tabIndex={-1}
                      >
                        <FiEdit2 />
                      </button>
                    </>
                  ) : (
                    <form
                      onSubmit={handleChangeStatus}
                      className="flex items-center gap-2 w-full"
                    >
                      <select
                        className="border rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-300"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        autoFocus
                      >
                        {STATUS_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      {/* Preview icon + text */}
                      {status && (
                        <span
                          className={`px-2 py-1 text-xs rounded border font-medium flex items-center gap-1 ${
                            STATUS_OPTIONS.find((s) => s.value === status)
                              ?.color ||
                            "bg-gray-100 text-gray-500 border-gray-300"
                          }`}
                        >
                          {STATUS_OPTIONS.find((s) => s.value === status)?.icon}
                          {status}
                        </span>
                      )}
                      <div className="flex gap-1 ml-auto">
                        <button
                          type="submit"
                          className="text-blue-500 text-xs font-medium px-2 py-1 rounded hover:bg-blue-50 transition"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          className="text-gray-400 text-xs px-2 py-1 rounded hover:bg-gray-100 transition"
                          onClick={() => setIsEditStatus(false)}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>
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
                    <span className="text-sm text-gray-600">
                      Joined Chatly
                    </span>
                    <span className="text-sm text-gray-600">
                      {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <form
            onSubmit={handleEditSubmit}
            className="flex flex-col gap-4 px-4 pt-2 pb-4"
          >
            {/* Cover Image */}
            <div className="flex flex-col items-center">
              <label
                htmlFor="cover-upload"
                className="cursor-pointer w-full block mb-2"
              >
                <img
                  src={previewCover || "/images/default-avatar.jpg"}
                  alt="cover preview"
                  className="w-full h-30 object-scale-down rounded-lg border mb-2 hover:opacity-80 transition"
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
            <div className="flex flex-col items-center">
              <label htmlFor="avatar-upload" className="cursor-pointer">
                <img
                  src={previewAvatar || "/images/default-avatar.jpg"}
                  alt="avatar preview"
                  className="w-20 h-20 rounded-full border-2 border-blue-400 object-scale-down mb-2 hover:opacity-80 transition"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "/images/default-avatar.jpg";
                  }}
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
                setEditData((prev) => ({ ...prev, username: e.target.value }))
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
                  setEditData((prev) => ({ ...prev, birthday: e.target.value }))
                }
              />
            </div>
            <div className="flex gap-2 mt-2">
              <button
                type="button"
                onClick={() => setIsEdit(false)}
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
        )}
      </div>
    </div>
  );
};

export default ProfilePopup;

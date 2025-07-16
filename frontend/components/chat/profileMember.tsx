import React from "react";
import {
  X,
  Edit2,
  AlertTriangle,
  MessageCircle,
  Phone,
  UserPlus,
  UserCheck,
} from "lucide-react";
import { Request } from "@/types/request";
import { User } from "@/types/user";
import {
  FaSmile,
  FaFrown,
  FaMeh,
  FaRegMeh,
  FaEyeSlash,
  FaAngry,
} from "react-icons/fa";
import { STATUS_OPTIONS } from "@/components/profile/ProfilePopup";

type Prop = {
  friend: User | undefined;
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
};

export const ProfileMember = ({
  friend,
  isOpen,
  onClose,
  onDelete,
}: Prop) => {
  if (!isOpen || !friend) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-[400px] max-w-[90vw] shadow-xl h-[95%] overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h2 className="text-lg font-semibold">Account information</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        {/* Avatar and Cover */}
        <div className="relative h-40 bg-white">
          <img
            src={friend.coverImage || "/images/default-avatar.jpg"}
            alt="cover"
            className="w-full h-full object-scale-down bg-white border-1 border-gray-200"
          />
          <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2">
            <img
              src={friend.avatar || "/images/default-avatar.jpg"}
              alt="avatar"
              className="w-20 h-20 rounded-full  bg-white object-scale-down border-1 border-gray-200"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "/images/default-avatar.jpg";
              }}
            />
          </div>
        </div>

        {/* User Info */}
        <div className="px-4 pt-11 pb-4">
          <div className="flex flex-col items-center mb-3 w-full justify-center">
            <h3 className="text-xl font-semibold text-center">
              {friend.username}
            </h3>
            {friend.status && (
              <span
                className={`px-2 py-1 text-xs rounded mt-2 border mx-auto w-fit flex items-center gap-1 font-medium ${
                  STATUS_OPTIONS.find((s) => s.value === friend.status)
                    ?.color || "bg-gray-100 text-gray-500 border-gray-300"
                }`}
              >
                {STATUS_OPTIONS.find((s) => s.value === friend.status)?.icon}
                {friend.status}
              </span>
            )}
          </div>
          {/* Description */}
          <div className="mb-4 text-center">
            <span className="text-gray-700 text-sm">
              {friend.description || "Chưa có mô tả"}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mb-6 justify-center">
            <button
              onClick={onDelete}
              className="flex-1 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors"
            >
              Delete friend
            </button>
          </div>

          {/* Contact Info */}
          <div className="border-t pt-4">
            <h4 className="font-medium mb-3">Send friend request from email</h4>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Chatly name</span>
              <span className="text-sm font-medium">{friend.username}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Email</span>
              <span className="text-sm text-gray-600">{friend.email}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Birthday</span>
              <span className="text-sm text-gray-600">{new Date(friend.birthday).toLocaleDateString("vi-VN") || ""}</span>
            </div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm text-gray-600">Joined Chatly</span>
              <span className="text-sm text-gray-600">
                {new Date(friend.createdAt).toLocaleDateString("vi-VN") || ""}
              </span>
            </div>
          </div>
          {/* Block Option */}
          {/* <div className="border-t pt-4">
            <button className="flex items-center gap-2 text-gray-600 hover:text-gray-800">
              <div className="w-5 h-5 rounded-full border-2 border-gray-400 flex items-center justify-center">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              </div>
              <span className="text-sm">Chặn tin nhắn và cuộc gọi</span>
            </button>
          </div> */}
        </div>
      </div>
    </div>
  );
};

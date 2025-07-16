import React, { useState } from "react";
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
import axiosInstance from "@/lib/axiosInstance";
import { IoChatboxEllipsesOutline } from "react-icons/io5";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useRouter } from "next/navigation";

type Prop = {
  otherUser: User | undefined;
  isOpen: boolean;
  onClose: () => void;
  onSendRequest: (message: string, friendId: string) => void;
};
export const InfoUser = ({
  otherUser,
  isOpen,
  onClose,
  onSendRequest,
}: Prop) => {
  if (!isOpen || !otherUser) return null;
  const { user } = useSelector((state: RootState) => state.auth);
  const router = useRouter();

  const [message, setMessage] = useState(
    "Hello, I would like to add you as a friend so we can chat more."
  );
  const goToChat = async () => {
    if (!otherUser) return;
    try {
      const res = await axiosInstance.post(`/api/chats`, {
        members: [otherUser.id, user.id],
      });
      router.push(`/apps/chats/${res.data.data.id}`);
    } catch (error) {
      toast.error("Failed to create chat");
    }
  };
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
        <div className="relative h-40 bg-white border-1 border-gray-100">
          <img
            src={otherUser.coverImage || "/images/default-avatar.jpg"}
            alt="cover"
            className="w-full h-full object-scale-down"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = "/images/default-avatar.jpg";
            }}
          />
          <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2">
            <img
              src={otherUser.avatar || "/images/default-avatar.jpg"}
              alt="avatar"
              className="w-20 h-20 rounded-full border-4 border-white bg-white shadow-lg object-scale-down"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "/images/default-avatar.jpg";
              }}
            />
          </div>
        </div>

        {/* User Info */}
        <div className="px-4 pt-12 pb-4">
          <div className="flex items-center mb-3 w-full justify-center">
            <h3 className="text-xl font-semibold text-center ml-8">
              {otherUser.username}
            </h3>
            <button
              className=" text-white hover:bg-gray-100 rounded-full p-1 cursor-pointer ml-1"
              onClick={goToChat}
              title="Chat"
            >
              <IoChatboxEllipsesOutline className="text-blue-500" size={20} />
            </button>
          </div>
          <div className="mb-4 text-center">
            <span className="text-gray-700 text-sm">
              {otherUser.description || "No description yet"}
            </span>
          </div>
          {/* Warning */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4 flex items-center gap-2">
            <AlertTriangle size={16} className="text-yellow-600" />
            <span className="text-sm text-yellow-800">
              Be careful when making friends with strangers
            </span>
          </div>

          {/* Friend Request Message */}
          <div className="  w-full bg-white-foreground px-2 py-2 rounded-xl flex items-center justify-between mr-3">
            {/* <IoSearch size={24} className="text-gray-500" /> */}
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter your invitation..."
              className=" h-[70px] ml-1 outline-none text-base flex-1 mr-1 resize-none"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  onSendRequest(message, otherUser.id);
                }
              }}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-5">
            <button
              onClick={() => onSendRequest(message, otherUser.id)}
              className="cursor-pointer flex-1 bg-blue-200 text-white py-2 px-4 rounded-lg hover:bg-blue-500 transition-colors"
            >
              Add Friend
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

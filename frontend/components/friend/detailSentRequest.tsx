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
import { IoChatboxEllipsesOutline } from "react-icons/io5";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import axiosInstance from "@/lib/axiosInstance";
import { RootState } from "@/redux/store";
import { useSelector } from "react-redux";
import Loading from "../loading";

type Prop = {
  request: Request | undefined;
  isOpen: boolean;
  onClose: () => void;
  onRevoke: () => void;
};
export const DetailSentRequest = ({
  request,
  isOpen,
  onClose,
  onRevoke,
}: Prop) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const goToChat = async () => {
    if (!request) return;
    setIsLoading(true);
    try {
      const res = await axiosInstance.post(`/api/chats`, {
        members: [request.recipient.id, user.id],
      });
      router.push(`/apps/chats/${res.data.data.id}`);
    } catch (error) {
      toast.error("Failed to create chat");
    } finally {
      setIsLoading(false);
    }
  };
  if (!isOpen || !request) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <Loading isLoading={isLoading} />
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
            src={request.recipient.coverImage || "/images/default-avatar.jpg"}
            alt="cover"
            className="w-full h-full object-scale-down"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = "/images/default-avatar.jpg";
            }}
          />
          <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2">
            <img
              src={request.recipient.avatar || "/images/default-avatar.jpg"}
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
              {request.recipient.username}
            </h3>
            <button
              className=" text-white hover:bg-gray-100 rounded-full p-1 cursor-pointer ml-1"
              onClick={goToChat}
              title="Chat"
            >
              <IoChatboxEllipsesOutline className="text-blue-500" size={20} />
            </button>
          </div>

          {/* Friend Request Message */}
          <div className="bg-gray-100 rounded-lg p-3 mb-4">
            <p
              className={`text-sm leading-5 w-full ${
                !request.message ? "text-gray-600" : ""
              }`}
            >
              {request.message || "No message attached"}
            </p>
          </div>

          {/* Warning */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4 flex items-center gap-2">
            <AlertTriangle size={16} className="text-yellow-600" />
            <span className="text-sm text-yellow-800">
              Be careful when making friends with strangers
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={onRevoke}
              className="cursor-pointer flex-1 bg-red-200 text-white py-2 px-4 rounded-lg hover:bg-red-500 transition-colors"
            >
              Cancel request
            </button>
          </div>

          {/* Contact Info */}
          <div className="border-t pt-4">
            <h4 className="font-medium mb-3">Friend request sent from email</h4>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Chatly Name</span>
              <span className="text-sm font-medium">
                {request.recipient.username}
              </span>
            </div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm text-gray-600">Joined Chatly</span>
              <span className="text-sm text-gray-600">
                {new Date(request.recipient.createdAt).toLocaleDateString(
                  "en-US"
                ) || ""}
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

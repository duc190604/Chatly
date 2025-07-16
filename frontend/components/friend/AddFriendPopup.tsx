"use client";
import React, { useState } from "react";
import { IoSearch } from "react-icons/io5";
import { IoClose } from "react-icons/io5";
import axiosInstance from "@/lib/axiosInstance";
import { toast } from "sonner";
import { fetchOnServer } from "@/lib/fetchOnServer";
import { getInfo } from "@/actions/user/getInfo";
import { InfoUser } from "./infoUser";
import { User } from "@/types/user";
import Loading from "../loading";
import { RootState } from "@/redux/store";
import { useSelector } from "react-redux";

interface AddFriendPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddFriendPopup: React.FC<AddFriendPopupProps> = ({ isOpen, onClose }) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userSelected, setUserSelected] = useState<User | undefined>(undefined);
  const [isOpenInfoUser, setIsOpenInfoUser] = useState(false);
  const handleSearch = async () => {
    if (email === user.email) {
      toast.error("You cannot add yourself as a friend");
      return;
    }
    if (!email.trim()) {
      toast.error("Please enter an email to search");
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetchOnServer(() => getInfo(email));
      setUserSelected(response.data);
      setIsOpenInfoUser(true);
    } catch (error: any) {
      if (error.response?.status === 404) {
        toast.info("No user found with this email");
      } else {
        toast.error(error?.message || "An error occurred while searching");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendFriendRequest = async (message: string, friendId: string) => {
    setIsLoading(true);
    try {
      const res = await axiosInstance.post("/api/requests", {
        recipientId: friendId,
        message: message,
      });
      const request = res.data.data;
      handleClose();
      if (request.status === "pending") {
        toast.success("Friend request sent");
      }
      if (request.status === "accepted") {
        toast.success("You are now friends");
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.error?.message ||
          "An error occurred while sending the request"
      );
    } finally {
      setIsLoading(false);
    }
  };
  const handleClose = () => {
    setIsOpenInfoUser(false);
    setUserSelected(undefined);
    setEmail("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <InfoUser
        otherUser={userSelected}
        isOpen={isOpenInfoUser}
        onClose={() => setIsOpenInfoUser(false)}
        onSendRequest={(message, friendId) =>
          handleSendFriendRequest(message, friendId)
        }
      />
      <Loading isLoading={isLoading} />
      <div className="bg-white rounded-lg px-6 py-4 w-[400px] max-h-[600px] shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Add Friend</h2>
        </div>

        {/* Search Input */}
        <div className="flex items-center justify-between mt-5">
          <div className="  w-full bg-white-foreground px-2 py-2 rounded-xl flex items-center justify-between mr-3">
            {/* <IoSearch size={24} className="text-gray-500" /> */}
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="text"
              placeholder="Enter user's email..."
              className=" h-[20px] ml-1 outline-none text-base flex-1 mr-1"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
            />
          </div>
          <button
            onClick={handleSearch}
            className="bg-blue-500 text-white px-2 py-2 rounded-md text-sm"
          >
            <IoSearch size={16} className="text-white" />
          </button>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button
            onClick={handleClose}
            className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddFriendPopup;

"use client";
import { getFriends } from "@/actions/friend/getFriend";
import ListFriend from "@/components/friend/listFriend";
import { List } from "lucide-react";
import { HiOutlineUserGroup } from "react-icons/hi";
import { PiUserList, PiUserListThin } from "react-icons/pi";
import { TbUserShare } from "react-icons/tb";
import { useQuery } from "@tanstack/react-query";
import ReceivedRequests from "@/components/friend/receivedRequest";
import { useState } from "react";
import { RiUserReceivedLine } from "react-icons/ri";
import SentRequests from "@/components/friend/sentRequest";
export default function FriendPage() {
  const [tab, setTab] = useState<"friends" | "received-requests" | "sent-requests">("friends");
  return (
    <div className="w-full h-full flex">
      <div className="w-1/4 h-full border-r border-gray-200">
        <div className="w-full h-full flex flex-col bg-white px-0">
          <h1 className="text-2xl font-bold font-inter mt-3 mx-auto">Friends</h1>
          <div className="mt-4">
            <div
              className={`flex items-center py-[14px] pl-4 cursor-pointer ${tab === "friends" ? "bg-blue-50 font-bold" : ""
                }`}
              onClick={() => setTab("friends")}
            >
              <HiOutlineUserGroup className="w-7 h-7 mr-4" />
              <p className="text-[18px] font-medium mt-1">List friends</p>
            </div>
            <div
              className={`flex items-center pl-3.5 py-4 cursor-pointer ${tab === "sent-requests" ? "bg-blue-50 font-bold" : ""
                }`}
              onClick={() => setTab("sent-requests")}
            >
              <TbUserShare className="w-7 h-7 mr-4" />
              <p className="text-[18px] font-medium mt-1">Sent requests</p>
            </div>
             <div
              className={`flex items-center pl-3.5 py-4 cursor-pointer ${tab === "received-requests" ? "bg-blue-50 font-bold" : ""
                }`}
              onClick={() => setTab("received-requests")}
            >
              <RiUserReceivedLine className="w-7 h-7 mr-4" />
              <p className="text-[18px] font-medium mt-1">Received requests</p>
            </div>
          </div>
        </div>
      </div>
      <div className="w-3/4 h-full flex bg-gray-100">
        {tab === "friends" && <ListFriend />}
        {tab === "received-requests" && <ReceivedRequests />}
        {tab === "sent-requests" && <SentRequests />}
      </div>
    </div>
  );
}


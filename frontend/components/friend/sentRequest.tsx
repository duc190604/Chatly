"use client";
import React, { useEffect, useState } from "react";
import { IoSearch } from "react-icons/io5";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getFriends } from "@/actions/friend/getFriend";
import { fetchOnServer } from "@/lib/fetchOnServer";
import { User } from "@/types/user";
import { getReceiveRequests } from "@/actions/friend/getReceivedRequests";
import { Request } from "@/types/request";
import { Bitcoin } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { DetailSentRequest } from "./detailSentRequest";
import axiosInstance from "@/lib/axiosInstance";
import { toast } from "sonner";
import LoadingSpinner from "../ui/loadingSpinner";
export default function SentRequests() {
  const { user } = useSelector((state: RootState) => state.auth);
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [listRequest, setListRequest] = useState<Request[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<Request>();
  const [isOpenDetail, setIsOpenDetail] = useState(false);
  const {
    data: requests,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["requests"],
    queryFn: async () => {
      const res = await fetchOnServer(() => getReceiveRequests());
      return res.data;
    },
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    if (requests) {
      const list = requests.filter((req: Request) => req.sender.id === user.id);
      if (search) {
        const filteredRequests = list.filter((friend: any) =>
          friend.sender.username.toLowerCase().includes(search.toLowerCase())
        );
        setListRequest(
          filteredRequests.sort((a: Request, b: Request) =>
            a.recipient.username.localeCompare(b.sender.username)
          )
        );
      } else {
        setListRequest(
          list.sort((a: Request, b: Request) =>
            a.recipient.username.localeCompare(b.recipient.username)
          )
        );
      }
    }
  }, [requests, search]);
  const openDetail = (req: Request) => {
    setSelectedRequest(req);
    setIsOpenDetail(true);
  };
  const revokeReq = async (req: Request | undefined) => {
    if (!req) return;
    try {
      const res = await axiosInstance.delete(`/api/requests/${req.id}`);
      queryClient.setQueryData(["requests"], (old: Request[]) =>
        old.filter((r: Request) => r.id !== req.id)
      );
      setIsOpenDetail(false);
      setSelectedRequest(undefined);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.error.message ||
          "An error occurred, please try again later"
      );
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      <DetailSentRequest
        request={selectedRequest}
        isOpen={isOpenDetail}
        onClose={() => setIsOpenDetail(false)}
        onRevoke={() => revokeReq(selectedRequest)}
      />
      {/* Header */}
      <div className="py-4 bg-white w-full border-b border-gray-200 pl-[2.3%] flex-shrink-0">
        <h2 className="text-xl font-bold">Sent friend requests</h2>
      </div>

      {/* Content container */}
      {/* Search box */}
      <div className="flex items-center">
        <div className="mt-2 mb-2 w-1/3 ml-4   bg-white px-2 py-2 rounded-sm flex items-center flex-shrink-0 border border-gray-200">
          <IoSearch size={24} className="text-gray-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            type="text"
            placeholder="Search"
            className="h-[20px] ml-2 outline-none text-base bg-transparent flex-1"
          />
        </div>
        <div>
          <p className="text-sm font-medium ml-3">
            Sent requests ({listRequest.length})
          </p>
        </div>
      </div>
      {(isLoading || error) && (
        <div className="flex items-center justify-center mt-[2%] mb-[2%]">
          <LoadingSpinner isLoading={isLoading} />
          {error && (
            <p className="text-red-500">
              An error occurred, please try again
            </p>
          )}
        </div>
      )}

      {/* Scrollable friend list */}
      <div className="w-full grid grid-cols-3 gap-4 px-4 overflow-y-auto pb-3">
        {listRequest.map((request) => (
          <div
            key={request.id}
            className="bg-white cursor-pointer rounded-md py-3 px-4 h-fit"
            onClick={() => openDetail(request)}
          >
            {/* Header với avatar và thông tin người gửi */}
            <div className="h-[50px] flex items-center">
              <img
                src={request.recipient.avatar || "/images/default-avatar.jpg"}
                alt="profile"
                className="w-12 h-12 rounded-full flex-shrink-0 object-scale-down"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "/images/default-avatar.jpg";
                }}
              />
              <div className="flex flex-col ml-3 min-w-0 flex-1">
                <p className="text-lg font-medium font-inter truncate">
                  {request.recipient.username}
                </p>
                <p className="text-sm text-gray-500 -mt-1">
                  {new Date(request.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Message box với chiều cao cố định và CSS custom */}
            <div className="bg-gray-200 rounded-sm py-2 px-3 mt-3 border border-gray-400 h-[60px] flex items-start">
              <p
                className={`text-sm leading-5 w-full ${
                  !request.message ? "text-gray-600" : ""
                }`}
                style={{
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {request.message || "No message attached"}
              </p>
            </div>
            {/* Buttons */}
            <div className="mt-3 flex items-center justify-end gap-2">
              <button
                className="bg-red-500 text-white px-4 py-2 rounded-md text-sm hover:bg-red-600 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  revokeReq(request);
                }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

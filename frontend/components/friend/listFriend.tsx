"use client";
import React, { useEffect, useState } from "react";
import { IoSearch } from "react-icons/io5";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getFriends } from "@/actions/friend/getFriend";
import { fetchOnServer } from "@/lib/fetchOnServer";
import { User } from "@/types/user";
import { HiOutlineDotsHorizontal } from "react-icons/hi";
import { HiOutlineUserPlus } from "react-icons/hi2";
import { DetailFriend } from "./detailFriend";
import AddFriendPopup from "./AddFriendPopup";
import useClickOutside from "@/hooks/clickOutside";
import axiosInstance from "@/lib/axiosInstance";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import PopupCustom from "../popupCustom";
import Loading from "../loading";
import LoadingSpinner from "../ui/loadingSpinner";

export default function ListFriend() {
  const [search, setSearch] = useState("");
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);
  const [listFriend, setListFriend] = useState<User[]>([]);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [selectedFriend, setSelectedFriend] = useState<User | undefined>(
    undefined
  );
  const [isOpenDetail, setIsOpenDetail] = useState(false);
  const [isOpenAddFriend, setIsOpenAddFriend] = useState(false);
  const [isOpenConfirmDeleteFriend, setIsOpenConfirmDeleteFriend] = useState(false);
  const menuRef = useClickOutside<HTMLDivElement>(() => setOpenMenuId(null));
  const queryClient = useQueryClient();
  const {
    data: friends,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["friends"],
    queryFn: async () => {
      const res = await fetchOnServer(() => getFriends());
      return res.data;
    },
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
  useEffect(() => {
    if (friends) {
      if (search) {
        const filteredFriends = friends.filter((friend: any) =>
          friend.username.toLowerCase().includes(search.toLowerCase())
        );
        setListFriend(
          filteredFriends.sort((a: User, b: User) =>
            a.username.localeCompare(b.username)
          )
        );
      } else {
        setListFriend(
          friends.sort((a: User, b: User) =>
            a.username.localeCompare(b.username)
          )
        );
      }
    }
  }, [friends, search]);
  const goToChat = async (friend: User | undefined) => {
    if (!friend) return;
    try {
      const res = await axiosInstance.post(`/api/chats`, {
        members: [friend.id, user.id],
      });
      router.push(`/apps/chats/${res.data.data.id}`);
    } catch (error) {
      toast.error("An error occurred");
    }
  };
  const handleDeleteFriend = async (friend: User | undefined) => {
    setIsOpenConfirmDeleteFriend(false);
    if (!friend) return;
    try {
      await axiosInstance.delete(`/api/friends/${friend.id}`);
      toast.success("Delete friend successfully");
      setSelectedFriend(undefined);
      setIsOpenDetail(false);
      queryClient.invalidateQueries({ queryKey: ["friends"] });
    } catch (error: any) {
      toast.error(error?.response?.data?.error?.message || "An error occurred");
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      <DetailFriend
        friend={selectedFriend}
        isOpen={isOpenDetail}
        onClose={() => setIsOpenDetail(false)}
        goToChat={() => goToChat(selectedFriend)}
        onDelete={() => setIsOpenConfirmDeleteFriend(true)}
      />
      <AddFriendPopup
        isOpen={isOpenAddFriend}
        onClose={() => setIsOpenAddFriend(false)}
      />
      <PopupCustom
        isOpen={isOpenConfirmDeleteFriend}
        title="Confirm delete friend"
        message="Are you sure you want to delete this friend? This action cannot be undone."
        onConfirm={() => handleDeleteFriend(selectedFriend)}
        onCancel={() => setIsOpenConfirmDeleteFriend(false)}
      />

      {/* Header */}
      <div className="py-4 bg-white w-full border-b border-gray-200 pl-[2.3%] flex-shrink-0 flex items-center ">
        <h2 className="text-xl font-bold">List friend</h2>
        <button
          className="text-white rounded-md ml-3 hover:bg-gray-100 p-1 cursor-pointer"
          onClick={() => setIsOpenAddFriend(true)}
          title="Add friend"
        >
          <HiOutlineUserPlus className="text-blue-500 w-5 h-5" />
        </button>
      </div>

      {/* Content container */}
      <div className="flex-1 flex flex-col bg-white px-4 w-[96%] mx-auto mt-3 rounded-md overflow-hidden mb-2">
        {/* Search box */}
        <div className="mt-4 mb-4 w-1/3 bg-gray-100 px-2 py-2 rounded-sm flex items-center flex-shrink-0">
          <IoSearch size={24} className="text-gray-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            type="text"
            placeholder="Search"
            className="h-[20px] ml-2 outline-none text-base bg-transparent flex-1"
          />
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
        <div className="flex-1 overflow-y-auto pb-3">
          {listFriend.map((friend: User) => (
            <div
              key={friend.id}
              className="h-[70px] w-full bg-white flex items-center justify-center border-b border-gray-200"
            >
              <img
                src={friend.avatar || "/image/default-avatar.png"}
                alt="profile"
                className="w-12 h-12 rounded-full object-scale-down bg-white border-1 border-gray-200"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "/images/default-avatar.jpg";
                }}
              />
              <p className="text-lg font-medium font-inter ml-3">
                {friend.username}
              </p>
              <div className="relative ml-auto mr-3 items-center justify-center">
                <HiOutlineDotsHorizontal
                  className="ml-auto text-gray-500 w-6 h-6 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenMenuId(openMenuId === friend.id ? null : friend.id);
                  }}
                />
                {openMenuId === friend.id && (
                  <div
                    ref={menuRef}
                    className="absolute right-0 top-8 bg-white border border-gray-200 rounded shadow-md z-10 w-32"
                  >
                    <button
                      className="w-full text-left px-4 py-2 hover:bg-gray-100"
                      onClick={() => {
                        setSelectedFriend(friend);
                        setIsOpenDetail(true);
                        setOpenMenuId(null);
                      }}
                    >
                      Information
                    </button>
                    <button
                      className="w-full text-left px-4 py-2 hover:bg-gray-100"
                      onClick={() => {
                        goToChat(friend);
                        setOpenMenuId(null);
                      }}
                    >
                      Chat
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

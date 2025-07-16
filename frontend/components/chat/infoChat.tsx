"use client";
import { BsPersonCircle } from "react-icons/bs";
import { FaAngleRight, FaFileAlt, FaTrash } from "react-icons/fa";
import { IoSearch } from "react-icons/io5";
import { useEffect, useState } from "react";
import { PopupImage } from "../popupImage";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { getMessages } from "@/actions/message/getMessage";
import { fetchOnServer } from "@/lib/fetchOnServer";
import { Chat, Message } from "@/types";
import { toast } from "sonner";
import { downloadFile } from "@/lib/utils";
import { AssetChat } from "./assetChat";
import { ProfileMember } from "./profileMember";
import { User } from "@/types/user";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { FindMessages } from "./findMessages";
import axiosInstance from "@/lib/axiosInstance";
import Loading from "../loading";
import PopupCustom from "../popupCustom";
export default function InfoChat({ chat }: { chat: Chat }) {
  const { user } = useSelector((state: RootState) => state.auth);
  const queryClient = useQueryClient();
  const [isOpenMedia, setIsOpenMedia] = useState(false);
  const [urlMedia, setUrlMedia] = useState<string>("");
  const [nameTab, setNameTab] = useState("info");
  const [isOpenProfile, setIsOpenProfile] = useState(false);
  const [isFriend, setIsFriend] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpenConfirmDelete, setIsOpenConfirmDelete] = useState(false);
  const [isOpenConfirmDeleteFriend, setIsOpenConfirmDeleteFriend] = useState(false);
  const handleOpenMedia = (url: string) => {
    setUrlMedia(url);
    setIsOpenMedia(true);
  };
  const {
    data: data_images,
    fetchNextPage: fetchNextPageImages,
    hasNextPage: hasNextPageImages,
    isFetchingNextPage: isFetchingNextPageImages,
    isLoading: isLoadingImages,
    error: errorImages,
  } = useInfiniteQuery({
    queryKey: ["images", chat.id],
    queryFn: async ({ pageParam }) => {
      const cursor = pageParam as string | undefined;

      const dataRes = await fetchOnServer(
        () => getMessages(chat.id, 12, cursor, "image", false) // truyền cursor để phân trang
      );
      return dataRes; // { data: [...], pagination: {...} }
    },
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => {
      if (!lastPage.pagination?.hasNextPage) return undefined;
      return lastPage.pagination.nextCursor;
    },
    refetchOnWindowFocus: false,
  });
  const {
    data: data_files,
    fetchNextPage: fetchNextPageFiles,
    hasNextPage: hasNextPageFiles,
    isFetchingNextPage: isFetchingNextPageFiles,
    isLoading: isLoadingFiles,
    error: errorFiles,
  } = useInfiniteQuery({
    queryKey: ["files", chat.id],
    queryFn: async ({ pageParam }) => {
      const cursor = pageParam as string | undefined;

      const dataRes = await fetchOnServer(
        () => getMessages(chat.id, 12, cursor, "file", false) // truyền cursor để phân trang
      );
      return dataRes; // { data: [...], pagination: {...} }
    },
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => {
      if (!lastPage.pagination?.hasNextPage) return undefined;
      return lastPage.pagination.nextCursor;
    },
    refetchOnWindowFocus: false,
  });
  const images: Message[] =
    data_images?.pages.flatMap((page) => page.data) ?? [];
  const files: Message[] = data_files?.pages.flatMap((page) => page.data) ?? [];
  const deleteAllMessages = async () => {
    setIsLoading(true);
    try {
      const res = await axiosInstance.delete(`/api/messages/delete-all?chatId=${chat.id}`);
      setIsOpenConfirmDelete(false);
      await queryClient.invalidateQueries({ queryKey: ["images", chat.id] });
      await queryClient.invalidateQueries({ queryKey: ["files", chat.id] });
      await queryClient.invalidateQueries({ queryKey: ["messages", chat.id] });
      await queryClient.setQueryData(["chats"], (old: any) => {
        return old.map((chatItem: any) => {
          if (chatItem.id === chat.id) {
            return { ...chatItem, lastMessage: null };
          }
          return chatItem;
        });
      });
      toast.success("Delete all messages successfully");
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    if (errorImages) {
      toast.error("Error fetching images " + errorImages?.message);
    }
    if (errorFiles) {
      toast.error("Error fetching files " + errorFiles?.message);
    }
  }, [errorImages, errorFiles]);
  const handleCheckFriend = async () => {
    if (chat.isGroup) return;
    try {
      const res = await axiosInstance.post("/api/friends/check", {
        friendId: chat.members.find((member: User) => member.id !== user?.id)
          ?.id,
      });
      if (res.data.data.status === "accepted") {
        setIsFriend(true);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const handleDeleteFriend = async (friendId: string) => {
    setIsLoading(true);
    setIsOpenConfirmDeleteFriend(false);
    try {
      const res = await axiosInstance.delete(`/api/friends/${friendId}`);
      setIsFriend(false);
      setIsOpenProfile(false);
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    handleCheckFriend();
  }, []);
  if (nameTab === "media" || nameTab === "file")
    return (
      <div className="w-full h-full overflow-y-auto border-l-1 border-gray-200">
        <AssetChat chat={chat} tabName={nameTab} setTabName={setNameTab} />
      </div>
    );
  if (nameTab === "search")
    return (
      <div className="w-full h-full overflow-y-auto border-l-1 border-gray-200">
        <FindMessages chat={chat} tabName={nameTab} setTabName={setNameTab} />
      </div>
    );
  return (
    <>
      <ProfileMember
        friend={chat.members.find((member: User) => member.id !== user?.id)}
        isOpen={isOpenProfile}
        onClose={() => setIsOpenProfile(false)}
        onDelete={() => setIsOpenConfirmDeleteFriend(true)}
      />
      <PopupImage
        urlMedia={urlMedia}
        isOpen={isOpenMedia}
        onClose={() => setIsOpenMedia(false)}
      />
      <PopupCustom
        isOpen={isOpenConfirmDeleteFriend}
        title="Confirm delete friend"
        message="Are you sure you want to delete this friend? This action cannot be undone."
        onConfirm={() => handleDeleteFriend(chat.members.find((member: User) => member.id !== user?.id)?.id || "")}
        onCancel={() => setIsOpenConfirmDeleteFriend(false)}
      />
      <Loading isLoading={isLoading} />
      <PopupCustom
        isOpen={isOpenConfirmDelete} 
        title="Confirm delete all messages"
        message="Are you sure you want to delete all messages in this chat? This action cannot be undone."
        onConfirm={deleteAllMessages}
        onCancel={() => setIsOpenConfirmDelete(false)}
      />
      <div className="w-full h-full overflow-y-auto border-l-1 border-gray-200">
        <div className=" items-center justify-center flex flex-col bg-white pb-4">
          <img
            className="w-20 h-20 rounded-full mt-4 bg-white object-scale-down border-1 border-gray-200"
            src={chat.avatar || "/images/default-avatar.jpg"}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = "/images/default-avatar.jpg";
            }}
          />
          <p className="text-lg font-medium font-inter mt-1">{chat.name}</p>
          <div className="flex items-center justify-center gap-5 mt-2">
            {isFriend && (
              <div className="flex flex-col items-center justify-center group cursor-pointer">
                <div className="p-2 rounded-full bg-gray-200 group-hover:bg-gray-300 transition-all duration-200">
                  <BsPersonCircle
                    size={24}
                    className=""
                    onClick={() => setIsOpenProfile(true)}
                  />
                </div>
                <p className="text-xs font-light font-inter mt-1">Profile</p>
              </div>
            )}
            <div
              className="flex items-center justify-center flex-col group cursor-pointer"
              onClick={() => setNameTab("search")}
            >
              <div className="p-2 rounded-full bg-gray-200 group-hover:bg-gray-300 transition-all duration-200">
                <IoSearch size={24} className="" />
              </div>
              <p className="text-xs font-light font-inter mt-1">Search</p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center flex-col px-4 mt-3">
          <div
            className="flex items-center justify-between w-full px-1 cursor-pointer hover:opacity-80 transition-all duration-200"
            onClick={() => setNameTab("media")}
          >
            <p className="text-base font-medium font-inter mt-0">Media</p>
            <FaAngleRight size={24} className="text-gray-500" />
          </div>
          {images.length === 0 && (
            <p className="text-sm font-inter text-center mt-3 text-gray-400 ">
              No media found
            </p>
          )}
          <div className="grid grid-cols-3 gap-2">
            {images.slice(0, 6).map((image) => (
              <img
                key={image.id}
                className="cursor-pointer hover:scale-95 transition-all duration-200 rounded-md mt-2 object-cover w-full h-full border-3 border-gray-300"
                onClick={() => handleOpenMedia(image.content)}
                src={image.content}
                alt=""
              />
            ))}
          </div>
        </div>
        <div>
          <div
            className="flex items-center justify-between  px-4 mt-4  cursor-pointer hover:opacity-80 transition-all duration-200"
            onClick={() => setNameTab("file")}
          >
            <p className="text-base font-medium font-inter mt-1">Others file</p>
            <FaAngleRight size={24} className="text-gray-500" />
          </div>
          <div className="grid grid-cols-1 items-center justify-center flex-col px-4 mt-0">
            {files.length === 0 && (
              <p className="text-sm font-inter text-center mt-3 mb-2 text-gray-400 ">
                No files found
              </p>
            )}
            {files.slice(0, 3).map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-2 w-full border-b border-gray-200 py-[7px] cursor-pointer"
                onClick={() => {
                  downloadFile(
                    file.content.split(";")[0],
                    file.content.split(";")[1]
                  );
                }}
              >
                <div className="bg-gray-200 rounded-sm p-[10px]">
                  <FaFileAlt size={16} className="" />
                </div>
                <p className="text-base font-inter ml-[2px] w-full truncate text-ellipsis overflow-hidden ">
                  {file.content.split(";")[1]}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div
          className={`flex items-center justify-center  px-4 mt-[10px] ${
            files.length === 0 ? "mt-4" : ""
          } cursor-pointer hover:opacity-80 transition-all duration-200`}
          onClick={() => setIsOpenConfirmDelete(true)}
        >
          <FaTrash size={18} className="text-red-500" />
          <p className="text-base text-red-500 font-inter ml-2">
            Delete all messages
          </p>
        </div>
      </div>
    </>
  );
}

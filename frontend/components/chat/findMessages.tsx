"use client";
import { useEffect, useState } from "react";
import { FaAngleLeft } from "react-icons/fa";
import { GoChevronLeft } from "react-icons/go";
import { TiArrowLeft } from "react-icons/ti";
import { PopupImage } from "@/components/popupImage";
import { FaRegFileLines } from "react-icons/fa6";
import { FaFileAlt } from "react-icons/fa";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getMessages } from "@/actions/message/getMessage";
import { fetchOnServer } from "@/lib/fetchOnServer";
import { Message } from "@/types/messages";
import { Chat } from "@/types";
import { useInView } from "react-intersection-observer";
import LoadingSpinner from "../ui/loadingSpinner";
import { findMessages } from "@/actions/message/findMessages";
import Loading from "../loading";
import { toast } from "sonner";
import { IoSearch } from "react-icons/io5";

type Prop = {
  chat: Chat;
  tabName: string;
  setTabName: (name: string) => void;
};
export const FindMessages = ({ chat, tabName, setTabName }: Prop) => {
  const [isMedia, setIsMedia] = useState(tabName === "media" ? true : false);
  const [isOpenPopupImage, setIsOpenPopupImage] = useState(false);
  const [urlMedia, setUrlMedia] = useState("");
  const [listMessages, setListMessages] = useState<Message[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  async function handleSearch() {
    setListMessages([]);
    try {
      setIsLoading(true);
      const res = await fetchOnServer(() => findMessages(chat.id, search));
      if(res.data) {
        setListMessages(res.data);
      }
    } catch (error: any) {
      toast.error(error?.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }
  
  return (
    <div className="w-full h-full px-2 flex flex-col">
      <PopupImage
        urlMedia={urlMedia}
        isOpen={isOpenPopupImage}
        onClose={() => setIsOpenPopupImage(false)}
      />
      <div className="flex items-center mt-3">
        <div
          className="cursor-pointer hover:bg-gray-200 rounded-full p-1 transition-all duration-200"
          onClick={() => setTabName("info")}
        >
          <TiArrowLeft size={24} className="cursor-pointer" />
        </div>
        <p className="text-lg font-medium font-inter ml-4">Find Messages</p>
      </div>
      <div className="flex items-center justify-between mt-5 px-3">
        <div className="  w-full bg-white-foreground px-2 py-2 rounded-xl flex items-center justify-between mr-3">
          {/* <IoSearch size={24} className="text-gray-500" /> */}
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            type="text"
            placeholder="Search"
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
      <div className="mt-4 px-3">
        {isLoading && <LoadingSpinner isLoading={true} />}
        {listMessages.length === 0 && !isLoading && <p className="text-center text-gray-500">No messages found</p>}
        {listMessages.map((message) => (
          <div key={message.id} className="flex gap-2 mt-2">
            <img src={message.sender.avatar || "/default-avatar.jpg"} alt="" className="w-10 h-10 rounded-full mt-1 object-scale-down bg-white border-1 border-gray-200" />
            <div>
              <p className="font-medium">{message.sender.username}</p>
              <div className="flex items-center gap-1 -mt-1">
                <p className="text-base">{message.content}</p>
                <p className="text-gray-400 text-sm">{new Date(message.createdAt).toLocaleDateString("vi-VN")}</p>
              </div>
              
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

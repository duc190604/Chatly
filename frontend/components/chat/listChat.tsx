"use client";
import { IoSearch } from "react-icons/io5";
import ChatItem from "./chatItem";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axiosInstance";
import { useEffect, useState } from "react";
import Loading from "../loading";
import { Chat } from "@/types/chat";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { getChats } from "@/actions/chat/getChats";
import { fetchOnServer } from "@/lib/fetchOnServer";
import { usePathname } from "next/navigation";
import { useSocket } from "@/context/SocketContext";
import LoadingSpinner from "../ui/loadingSpinner";
export default function ListChat() {
  const { user, accessToken, refreshToken } = useSelector(
    (state: RootState) => state.auth
  );
  const {socket} = useSocket();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [chatsShow, setChatsShow] = useState<Chat[]>([]);

  const {
    data: listChat,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["chats"],
    queryFn: async () => {
      const response = await fetchOnServer(getChats);
      setChatsShow(response);
      return response;
    },
    staleTime: 0,      
    refetchOnMount: true,   
    refetchOnWindowFocus: true, 
  });
  useEffect(() => {
    if (listChat) {
      const sortedChats = listChat.sort((a: any, b: any) => {
        const aLastMessage = a.lastMessage || { createdAt: new Date(0) };
        const bLastMessage = b.lastMessage || { createdAt: new Date(0) };
        return new Date(bLastMessage.createdAt).getTime() - new Date(aLastMessage.createdAt).getTime();
      });
      if (search) {
        const filteredChats = sortedChats.filter((chat: any) =>
          chat.name.toLowerCase().includes(search.toLowerCase())
        );
        setChatsShow(filteredChats);
      } else {
        setChatsShow(sortedChats);
      }
    }
  }, [search, listChat]);
  
  useEffect(() => {
    if(!socket) return;
    socket.on("new_message", (res: any, ack: Function) => {
      ack({
        status: "success",
        message: "Message received",
      });
      queryClient.setQueryData(["chats"], (old: Chat[]) => old.map(item => item.id === res.data.chat ? { ...item, lastMessage: res.data } : item));
    });
    socket.on("message_revoked",(data:{messageId:string,chatId:string})=>{
      queryClient.setQueryData(["chats"], (old: Chat[]) => old.map(item => item.id === data.chatId ? { ...item, lastMessage: {...item.lastMessage,isRevoked:true,content:"This message is revoked"} } : item));
    })
    return () => {
      socket.off("new_message");
      socket.off("message_revoked");
    };
  }, [socket]);
  

  
  return (
    <div className="w-full h-full flex flex-col items-center bg-white border-r-1 border-gray-200">
      <h1 className="text-2xl font-bold font-inter mt-3">Messages</h1>
      <div className=" mt-4 mb-4  w-[92%] bg-white-foreground px-2 py-2 rounded-xl flex items-center">
        <IoSearch size={24} className="text-gray-500" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          type="text"
          placeholder="Search"
          className=" h-[20px] ml-2 outline-none text-base"
        />
      </div>
      {(isLoading || error)  && (
        <div className="flex items-center justify-center mt-[2%] mb-[2%] px-2">
          <LoadingSpinner isLoading={isLoading}/>
          {error && <p className="text-red-500">An error occurred, cannot load chats</p>}
        </div>
      )}
      
      {chatsShow.length === 0 && !isLoading && !error && (
        <div className="text-center text-gray-500">No chats found</div>
      )}
      {Array.isArray(chatsShow) &&
        chatsShow?.map((chat: any) => (
          <ChatItem
            key={chat.id}
            name={chat.name}
            chatId={chat.id}
            lastMessage={chat?.lastMessage || null}
            avatar={chat.avatar || null}
            isOnline={chat.isOnline || false}
            isTyping={chat.isTyping || false}
            isRead={chat.isRead || false}
          />
        ))}
    </div>
  );
}

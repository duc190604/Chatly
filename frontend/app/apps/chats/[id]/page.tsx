"use client";
import ListChat from "@/components/chat/listChat";
import ChatComponent from "@/components/chat/chatComponent";
import { Chat } from "@/types";
import InfoChat from "@/components/chat/infoChat";
import { AssetChat } from "@/components/chat/assetChat";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import axiosInstance from "@/lib/axiosInstance";
import  {useSelector}  from "react-redux";
import { RootState } from "@/redux/store";
import Loading from "@/components/loading";
import { useSocket } from "@/context/SocketContext";
import { useEffect } from "react";
import { toast } from "sonner";
import LoadingSpinner from "@/components/ui/loadingSpinner";
import { emitWithPromise } from "@/lib/emitWithPromise";
export default function ChatPage() {
  const { user } = useSelector((state: RootState) => state.auth);
  const { id } = useParams();
  const {socket} = useSocket();
  const { data: chat , isLoading, error } = useQuery({
    queryKey: ["chat", id],
    queryFn: async () => {
      const res = await axiosInstance.get(`/api/chats/${id}`);
      if(res.status === 200){
        const chat = res.data.data;
        let avatar;
        let name;
       if (!chat.isGroup) {
          const member = chat.members.find((item: any) => item.id != user?.id);
          avatar = member?.avatar;
          name = member?.username;
        } else {
          name = chat.name;
          avatar = chat.avatar;
        }
        return {
          ...chat,
          avatar,
          name,
          isOnline: false,
        };
      }
      return [];
    },
    refetchOnWindowFocus: false,
  });
 useEffect(() => {
   if (!socket || !id) return;
   const handleJoin = async () => {
    const res = await emitWithPromise(socket, "join_room", { chatId: id });
    if (res.status !== "success") {
      toast.error("Failed to join room");
    }
   };
   socket.on("connect", handleJoin);
   socket.on("reconnect", handleJoin); 
   handleJoin();

   return () => {
     if (socket) {
       socket.emit("leave_room", { chatId: id });
       socket.off("connect", handleJoin);
     }
   };
}, [socket, id]);

  
  return (
    <div className="w-full h-full flex">
      {(isLoading || error) ? (
        <div className="flex items-center justify-center w-full h-full">
          <LoadingSpinner isLoading={isLoading} />
          {error && (
            <p className="text-red-500">An error occurred, cannot load chat</p>
          )}
        </div>
      ) : (
        <div className="w-full h-full flex">
          <div className="w-full xl:w-2/3 h-full">
            {chat && <ChatComponent chat={chat} />}
          </div>
          <div className="hidden xl:block w-1/3 h-full">
            {chat && <InfoChat chat={chat} />}
          </div>
        </div>
      )}
    </div>
  );
}

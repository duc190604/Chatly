import { BsThreeDotsVertical } from "react-icons/bs";
import { useState, useEffect } from "react";   
import { PopupImage } from "../popupImage";
import useClickOutside from "../../hooks/clickOutside";
import { Message } from "@/types/messages";
import React, { useRef } from "react";
import { LuFileText } from "react-icons/lu";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import axiosInstance  from "@/lib/axiosInstance";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { setEditMessage } from "@/redux/features/chatSlice";
import { RootState } from "@/redux/store";
import { useSocket } from "@/context/SocketContext";
import { InfiniteData } from "@tanstack/react-query";
import { MdErrorOutline } from "react-icons/md";
import { downloadFile } from "@/lib/utils";
import { Chat } from "@/types/chat";
const MyMessage = React.memo(({message}:{message:Message}) => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const { isEditMessage } = useSelector((state: RootState) => state.chat);
  const [isOpenMenu, setIsOpenMenu] = useState(false);
  const [isOpenPopupImage, setIsOpenPopupImage] = useState(false);
  const [positionMenu, setPositionMenu] = useState<"top" | "bottom">("bottom");
  const ref = useClickOutside<HTMLDivElement>(() => setIsOpenMenu(false));
  const [isEdit, setIsEdit] = useState(false);
   const socket = useSocket()?.socket ?? null;
  const imageMessage = () => {
    if(message.type === "image"){
    return (message.status === "sending" || message.status === "error") ? (
      <div className="ml-1 w-fit py-4 px-3 bg-blue-200 rounded-xl rounded-br-sm rounded-tr-xl flex items-center gap-2 cursor-pointer hover:bg-blue-300 transition-all duration-200 max-w-[70%] ">
        <LuFileText className="text-gray-500 w-7 h-7 flex-shrink-0"  />
        <p
          className="w-fit text-black font-medium truncate"
          title={message.content}
        >
          {message.content}
        </p>
      </div>
    ) : (
      <>
        <div className="max-w-[40%] border-1 border-blue-400 rounded-xl" onClick={() => setIsOpenPopupImage(true)}>
          <img
            src={message.content}
            alt="imageMessage"
            className="w-full h-full object-scale-down rounded-xl cursor-pointer"
          />
        </div>
        <PopupImage
          urlMedia={message.content}
          isOpen={isOpenPopupImage}
          onClose={() => setIsOpenPopupImage(false)}
        />
      </>
    );
    }
  };
  const handleOpenMenu = () => {
    const rect = ref.current?.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    if(rect && rect.top > windowHeight-300){
      setPositionMenu("top");
    }else{
      setPositionMenu("bottom");
    }
    setIsOpenMenu(!isOpenMenu);
  }
  const deleteMessage = useMutation({
    mutationFn: async () => {
      await axiosInstance.delete(`/api/messages/${message.id}`);
    },
    onSuccess: () => {
      removeMessageFromList(message);
      // toast.success("Delete message successfully");
    },
    onError: (error) => {
      toast.error("Delete message failed");
    },
  });
  const revokeMessage = useMutation({
    mutationFn: async () => {
      await axiosInstance.delete(`/api/v1/message/${message.id}/revoke`);
    },
    onSuccess: () => {
      queryClient.setQueryData(["messages", message.chat], (old:Message[]) => old.map((msg) => msg.id === message.id ? {...msg, isRevoked: true} : msg));
      toast.success("Revoke message successfully");
    },
    onError: () => {
      toast.error("Revoke message failed");
    },
  });
  function removeMessageFromList(message: Message) {
    queryClient.setQueryData(
      ["messages", message.chat],
      (oldData: InfiniteData<{ data: Message[]; pagination: any }> | undefined) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page, index) => {
              return {
                ...page,
                data: page.data.filter((msg) => (msg.id !== message.id)), 
              };
          }),
        };
      }
    );
    deleteFileAndMedia(message);
  }
  function deleteFileAndMedia(message: Message) {
    if(message.type === "file"){
    queryClient.setQueryData(
      ["files", message.chat],
      (
        oldData: InfiniteData<{ data: Message[]; pagination: any }> | undefined
      ) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page, index) => {
            return {
              ...page,
              data: page.data.filter((msg) => msg.id !== message.id),
            };
          }),
        };
      }
    );
    }
    if(message.type === "image"){
       queryClient.setQueryData(
         ["images", message.chat],
         (
           oldData:
             | InfiniteData<{ data: Message[]; pagination: any }>
             | undefined
         ) => {
           if (!oldData) return oldData;
           return {
             ...oldData,
             pages: oldData.pages.map((page, index) => {
               return {
                 ...page,
                 data: page.data.filter((msg) => msg.id !== message.id),
               };
             }),
           };
         }
       );
    }
  }
  function modifyMessage(messageId: string, modify: Object) {
     queryClient.setQueryData(
      ["messages", message.chat],
      (oldData: InfiniteData<{ data: Message[]; pagination: any }> | undefined) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page, index) => {
              return {
                ...page,
                data: page.data.map((message) => (message.id === messageId ? {...message, ...modify} : message)), 
              };
          }),
        };
      }
    );
  }
  const handleRevokeMessage = () => {
    if(!socket?.connected){
      toast.error("Don't connect to server, please try again later.");
      return;
    }
    socket.emit("revoke_message", { messageId: message.id }, (res:any) => {
      if(res.status === "success"){
        modifyMessage(message.id, { isRevoked: true, content: "This message is revoked." });
        deleteFileAndMedia(message);
        queryClient.setQueryData(["chats"], (old: Chat[]) => old.map(item => item.id === message.chat && item.lastMessage?.id === message.id ? { ...item, lastMessage: {...item.lastMessage,isRevoked:true,content:"This message is revoked"} } : item));
        // toast.success("Revoke message successfully");
      }else{
        toast.error("Revoke message failed");
      }
    });
  }
  
  useEffect(() => {
    if(!isEditMessage && isEdit){
      setIsEdit(false);
    }
  }, [isEditMessage]);
  if(message.isRevoked){
    return (
      <div className="relative w-fit flex items-center justify-end group mt-2 pr-3 ml-auto">
        <p
          className="text-gray-500 font-light text-base pointer-events-none bg-gray-200 rounded-3xl rounded-br-sm rounded-tr-3xl p-2"
          style={{ userSelect: "none" }}
        >
          This message is revoked.
        </p>
      </div>
    );
  }
  return (
    <div className="w-full mt-2">
      {message.isEdited && (
        <div className="ml-auto w-fit mr-3">
          <p className="text-orange-400 text-xs w-fit">Message edited</p>
        </div>
      )}
      <div className=" relative w-[80%] flex items-center justify-end group pr-3 ml-auto">
        {message.status !== "error" ? (
          <div
            ref={ref}
            className={` relative ml-auto opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center ${
              isOpenMenu ? "opacity-100" : "opacity-0"
            }`}
          >
            {isOpenMenu && (
              <div
                className={` absolute ${
                  positionMenu === "top" ? "bottom-7" : "top-7"
                } right-5 w-34 z-100  bg-white rounded-lg shadow-2xl border border-gray-200 p-2   flex flex-col`}
              >
                <p
                  className=" cursor-pointer text-base font-medium text-slate-800 hover:bg-gray-100 rounded-md py-1 px-2 "
                  onClick={() => {
                    setIsOpenMenu(false);
                    deleteMessage.mutate();
                  }}
                >
                  Delete
                </p>
                <p
                  className="cursor-pointer text-base font-medium text-slate-800 hover:bg-gray-100 rounded-md p-1"
                  onClick={() => handleRevokeMessage()}
                >
                  Revoke
                </p>
                {message.type === "text" && !isEditMessage && (
                  <p
                    className="cursor-pointer text-base font-medium text-slate-800 hover:bg-gray-100 rounded-md p-1"
                    onClick={() => {
                      dispatch(
                        setEditMessage({
                          isEditMessage: true,
                          messageId: message.id,
                          content: message.content,
                        })
                      );
                      setIsOpenMenu(false);
                      setIsEdit(true);
                    }}
                  >
                    Edit
                  </p>
                )}
                {/* <p className="cursor-pointer text-base font-medium text-slate-800 hover:bg-gray-100 rounded-md p-1">
              Ghim
            </p> */}
              </div>
            )}
            <p
              className="text-gray-400 font-light text-xs pointer-events-none"
              style={{ userSelect: "none" }}
            >
              {new Date(message.createdAt).toLocaleTimeString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
            <BsThreeDotsVertical
              size={25}
              onClick={handleOpenMenu}
              className="text-gray-500 cursor-pointer hover:text-gray-700 hover:bg-gray-100 rounded-full p-1 active:scale-95 "
            />
          </div>
        ) : (
          <div className="flex items-center">
            <p className="text-red-500 mr-2">Message not sent !</p>
            <MdErrorOutline className="text-red-500 w-6 h-6 mr-1" />
          </div>
        )}

        {imageMessage()}
        {message.type === "text" && (
          <div
            className={`ml-1 w-fit py-2 px-3 bg-blue-400 rounded-3xl rounded-br-sm rounded-tr-3xl  ${
              message.status == "error" ? "bg-blue-300" : ""
            } ${isEdit ? "bg-gray-100 border-2 border-blue-400" : ""}`}
          >
            <p className={`w-fit ${isEdit ? "text-blue-400" : "text-white"}`}>
              {message.content}
            </p>
          </div>
        )}
        {message.type === "file" && (
          (message.status === "sending" || message.status === "error")  ? (
      <div className="ml-1 w-fit py-4 px-3 bg-blue-200 rounded-xl rounded-br-sm rounded-tr-xl flex items-center gap-2 cursor-pointer hover:bg-blue-300 transition-all duration-200 max-w-[70%] ">
        <LuFileText className="text-gray-500 w-7 h-7 flex-shrink-0"  />
        <p
          className="w-fit text-black font-medium truncate"
          title={message.content}
        >
          {message.content}
        </p>
      </div>
      ) : (
          <div
            className="ml-1 w-fit py-4 px-3 bg-blue-200 rounded-xl rounded-br-sm rounded-tr-xl flex items-center gap-2 cursor-pointer hover:bg-blue-300 transition-all duration-200 max-w-[70%]"
            onClick={() =>
              downloadFile(
                message.content.split(";")[0],
                message.content.split(";")[1]
              )
            }
          >
            <LuFileText className="text-gray-500 w-7 h-7 flex-shrink-0"  />
            <p
              className="w-fit text-black font-medium truncate"
              title={message.content.split(";")[1]}
            >
              {message.content.split(";")[1]}
            </p>
          </div>
        )
        )}
      </div>
      {message.status === "sending" && (
        <div className="ml-auto w-fit mr-3">
          <p className="text-gray-500 text-xs w-fit">Sending...</p>
        </div>
      )}
    </div>
  );
});
export default MyMessage;

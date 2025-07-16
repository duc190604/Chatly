import useClickOutside from "@/hooks/clickOutside";
import axiosInstance from "@/lib/axiosInstance";
import uploadFile from "@/lib/uploadImage";
import { RootState } from "@/redux/store";
import { Chat } from "@/types/chat";
import { Message } from "@/types/messages";
import {
  InfiniteData,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import EmojiPicker from "emoji-picker-react";
import { useEffect, useRef, useState } from "react";
import { BsSend } from "react-icons/bs";
import { FaRegFileLines } from "react-icons/fa6";
import { IoClose } from "react-icons/io5";
import { MdInsertEmoticon } from "react-icons/md";
import { RiAttachment2 } from "react-icons/ri";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import { setEditMessage } from "@/redux/features/chatSlice";
import { useSocket } from "@/context/SocketContext";
import { emitWithPromise } from "@/lib/emitWithPromise";
import Loading from "../loading";
export default function ChatInput({ chat }: { chat: Chat }) {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const { isEditMessage, messageId, content } = useSelector(
    (state: RootState) => state.chat
  );
  const [message, setMessage] = useState("");
  const queryClient = useQueryClient();
  const [files, setFiles] = useState<File[]>([]);
  const [isOpenEmoji, setIsOpenEmoji] = useState(false);
  const [loading, setLoading] = useState(false);
  const pickerRef = useClickOutside<HTMLDivElement>(() =>
    setIsOpenEmoji(false)
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const socket = useSocket()?.socket ?? null;
  const mutation = useMutation({
    mutationFn: async ({
      content,
      type,
    }: {
      content: string;
      type: string;
    }) => {
      const response = await axiosInstance.post(`/api/v1/message`, {
        content: content,
        chat: chat.id,
        sender: user.id,
        type: type,
      });
      if (response.status === 201) {
        return response.data;
      }
    },
    onSuccess: (data) => {
      setMessage("");
      setFiles([]);
      queryClient.setQueryData(["messages", chat.id], (old: Message[]) => [
        ...old,
        data,
      ]);
    },
    onError: (error) => {
      toast.error("Failed to send message");
      // throw error
    },
  });
  function addMessage(message: Message) {
    queryClient.setQueryData(
      ["messages", chat.id],
      (
        oldData: InfiniteData<{ data: Message[]; pagination: any }> | undefined
      ) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page, index) => {
            if (index === 0) {
              return {
                ...page,
                data: [message, ...page.data], // thêm vào đầu trang đầu
              };
            }
            return page;
          }),
        };
      }
    );
    
  }
  function addFileAndMedia(message: Message) {
if (message.type === "file") {
  queryClient.setQueryData(
    ["files", chat.id],
    (
      oldData: InfiniteData<{ data: Message[]; pagination: any }> | undefined
    ) => {
      if (!oldData) return oldData;
      return {
        ...oldData,
        pages: oldData.pages.map((page, index) => {
          if (index === 0) {
            return {
              ...page,
              data: [message, ...page.data], // thêm vào đầu trang đầu
            };
          }
          return page;
        }),
      };
    }
  );
}
if (message.type === "image") {
  queryClient.setQueryData(
    ["images", chat.id],
    (
      oldData: InfiniteData<{ data: Message[]; pagination: any }> | undefined
    ) => {
      if (!oldData) return oldData;
      return {
        ...oldData,
        pages: oldData.pages.map((page, index) => {
          if (index === 0) {
            return {
              ...page,
              data: [message, ...page.data], // thêm vào đầu trang đầu
            };
          }
          return page;
        }),
      };
    }
  );
}
  }
  function swapMessage(oldId: string, realMesage: Message) {
    queryClient.setQueryData(
      ["messages", chat.id],
      (
        oldData: InfiniteData<{ data: Message[]; pagination: any }> | undefined
      ) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page, index) => {
            if (index === 0) {
              return {
                ...page,
                data: page.data.map((message) =>
                  message.id === oldId ? realMesage : message
                ), // thêm vào đầu trang đầu
              };
            }
            return page;
          }),
        };
      }
    );
  }
  function changeStatusMessage(messageId: string, status: string) {
    queryClient.setQueryData(
      ["messages", chat.id],
      (
        oldData: InfiniteData<{ data: Message[]; pagination: any }> | undefined
      ) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page, index) => {
            if (index === 0) {
              return {
                ...page,
                data: page.data.map((message) =>
                  message.id === messageId ? { ...message, status } : message
                ),
              };
            }
            return page;
          }),
        };
      }
    );
  }
  function modifyMessage(messageId: string, modify: Object) {
    queryClient.setQueryData(
      ["messages", chat.id],
      (
        oldData: InfiniteData<{ data: Message[]; pagination: any }> | undefined
      ) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page, index) => {
            return {
              ...page,
              data: page.data.map((message) =>
                message.id === messageId ? { ...message, ...modify } : message
              ),
            };
          }),
        };
      }
    );
  }
  const handleSendMessage = async () => {
    if (message === "" && files.length === 0) {
      return;
    }
    if (!socket ) {
      toast.error(
        "You are not connected to the server, please try again later."
      );
      return;
    }
    let filesToUpload = files;
    setFiles([]);
    let messageToSend = message;
    setMessage("");

    if (filesToUpload.length > 0) {
      const uploadPromises = filesToUpload.map(async (file) => {
        let type = "file";
        if (file.type.includes("image")) {
          type = "image";
        }
        const tempId = crypto.randomUUID();
        const tempMessage = {
          id: tempId,
          chat: chat.id,
          content: file?.name || "",
          type: type,
          chatId: chat.id,
          sender: {
            id: user.id,
            username: user.username,
            avatar: user.avatar,
          },
          status: "sending",
          createdAt: new Date(),
          updatedAt: new Date(),
          isRevoked: false,
          isEdited: false,
        };
        addMessage(tempMessage);
        try {
          const res = await uploadFile(file);
          const resMess = (await emitWithPromise(socket, "send_message", {
            content: type === "file" ? `${res.url};${file.name}` : res.url,
            type: type,
            chatId: chat.id,
          })) as any;
          if (resMess.status == "success") {
            swapMessage(tempId, resMess.data);
            addFileAndMedia(resMess.data);
            queryClient.setQueryData(["chats"], (old: Chat[]) =>
              old.map((item) =>
                item.id === chat.id
                  ? { ...item, lastMessage: resMess.data }
                  : item
              )
            );
          } else {
            throw new Error(
              resMess?.error?.message || "Failed to send message"
            );
          }
          filesToUpload = filesToUpload.filter((f) => f !== file);
        } catch (error) {
          changeStatusMessage(tempId, "error");
          toast.error(`Failed to upload file ${file?.name}`);
        }
      });
      await Promise.all(uploadPromises);
    }
    if (messageToSend !== "") {
      const tempId = crypto.randomUUID();
      const tempMessage = {
        id: tempId,
        chat: chat.id,
        content: messageToSend,
        type: "text",
        chatId: chat.id,
        sender: {
          id: user.id,
          username: user.username,
          avatar: user.avatar,
        },
        status: "sending",
        createdAt: new Date(),
        updatedAt: new Date(),
        isRevoked: false,
        isEdited: false,
      };
      addMessage(tempMessage);
      try {
        const res = (await emitWithPromise(socket, "send_message", {
          content: messageToSend,
          type: "text",
          chatId: chat.id,
        })) as any;
        if (res.status == "success") {
          swapMessage(tempId, res.data);
          queryClient.setQueryData(["chats"], (old: Chat[]) =>
            old.map((item) =>
              item.id === chat.id ? { ...item, lastMessage: res.data } : item
            )
          );
        } else {
          changeStatusMessage(tempId, "error");
          // toast.error(res?.error?.message || "Failed to send message");
        }
      } catch (error) {
        changeStatusMessage(tempId, "error");
        // toast.error("Failed to send message");
      }
    }
  };
  const handleEditMessage = async () => {
    if (!socket || socket.disconnected) {
      toast.error(
        "You are not connected to the server, please try again later."
      );
      return;
    }
    try {
      setLoading(true);
      const res = (await emitWithPromise(socket, "edit_message", {
        newContent: content,
        messageId: messageId,
      })) as any;
      if (res?.status === "success") {
        modifyMessage(messageId, { content, isEdited: true });
        dispatch(
          setEditMessage({ isEditMessage: false, messageId: "", content: "" })
        );
      } else {
        toast.error("Failed to edit message");
      }
    } catch (error) {
      toast.error("Failed to edit message");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    localStorage.removeItem("reactEmojiPicker.recent");
  }, [isOpenEmoji]);
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
   if (event.target.files) {
     let selectedFiles = Array.from(event.target.files);
     if (selectedFiles.length  > 4) {
       selectedFiles = selectedFiles.slice(0, 4);
       toast.error("You can only select up to 4 files");
     }
     setFiles(selectedFiles);
     event.target.value = "";
   }
  };
  const handleRemoveFile = (file: File) => {
    setFiles(files.filter((f) => f !== file));
  };

  if (isEditMessage)
    return (
      <div className="Input shadow-lg border-t border-gray-300 bg-white pb-[2px]">
        <Loading isLoading={loading} />
        <div className="flex items-center justify-between">
          <p className="text-blue-500 text-base font-medium ml-4 mb-2">
            Edit message
          </p>
          <IoClose
            onClick={() =>
              dispatch(
                setEditMessage({
                  isEditMessage: false,
                  messageId: "",
                  content: "",
                })
              )
            }
            className="text-gray-500 cursor-pointer mr-2"
            size={24}
          />
        </div>
        <div className="flex bg-white items-center Input mt-auto mb-2 py-[6px]  rounded-2xl border border-gray-300 w-[95%] mx-auto">
          <input
            ref={inputRef}
            type="text"
            placeholder="Type something..."
            className="w-full h-full outline-none px-4"
            value={content}
            onChange={(e) =>
              dispatch(
                setEditMessage({
                  isEditMessage: true,
                  messageId: messageId,
                  content: e.target.value,
                })
              )
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") handleEditMessage();
            }}
          />

          <div className="flex items-center gap-2 mr-4 relative">
            <div className="w-[1.5px] h-6 bg-gray-400"></div>
            <div className="cursor-pointer hover:bg-gray-100 rounded-full p-[6px]">
              <BsSend
                onClick={() => handleEditMessage()}
                className="text-gray-500"
                size={20}
              />
            </div>
          </div>
        </div>
      </div>
    );

  return (
    <div className="Input py-[6px]  rounded-2xl border border-gray-300 w-[95%] mx-auto mt-3 mb-3  ">
      <div className="flex items-center  mx-3  overflow-x-auto">
        {files.map((file) => (
          <div
            key={file.name + file.lastModified}
            className="w-fit flex items-center gap-2 mr-2"
          >
            <div className="bg-gray-100 rounded-full p-2">
              <FaRegFileLines className="text-gray-500" size={24} />
            </div>
            <p className="text-base text-gray-500 font-inter -mt-1 ml-[2px] max-w-16 truncate text-ellipsis overflow-hidden ">
              {file.name}
            </p>
            <IoClose
              onClick={() => handleRemoveFile(file)}
              className="text-gray-500 cursor-pointer"
              size={24}
            />
          </div>
        ))}
      </div>
      <div className="flex items-center w-full">
        <input
          ref={inputRef}
          type="text"
          placeholder="Type something..."
          className="w-full h-full outline-none px-4"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSendMessage();
          }}
        />

        <div className="flex items-center gap-2 mr-4 relative">
          <div className="cursor-pointer hover:bg-gray-100 rounded-full p-1">
            <MdInsertEmoticon
              className="text-gray-500 "
              size={24}
              onClick={(e) => {
                e.stopPropagation();
                setIsOpenEmoji(!isOpenEmoji);
              }}
            />
          </div>

          {isOpenEmoji && (
            <div ref={pickerRef} className="absolute bottom-12 right-0 z-10">
              <EmojiPicker
                searchDisabled={false}
                previewConfig={{
                  showPreview: false,
                }}
                onEmojiClick={(emoji) => {
                  setMessage(message + emoji.emoji);
                }}
              />
            </div>
          )}
          <div className=" cursor-pointer hover:bg-gray-100 rounded-full p-1 relative">
            <RiAttachment2
              className="text-gray-500 pointer-events-none "
              size={24}
            />
            <input
              type="file"
              className=" absolute inset-0 opacity-0 w-6 h-6 hover:bg-gray-100 cursor-pointer z-10  "
              multiple
              max={4}
              onChange={handleFileChange}
            />
          </div>

          <div className="w-[1.5px] h-6 bg-gray-400"></div>
          <div className="cursor-pointer hover:bg-gray-100 rounded-full p-[6px]">
            <BsSend
              onClick={handleSendMessage}
              className="text-gray-500"
              size={20}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

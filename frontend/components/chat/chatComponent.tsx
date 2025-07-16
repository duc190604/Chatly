"use client";
import { Chat } from "@/types";
import { useEffect, useRef, useState } from "react";
import { MdInsertEmoticon } from "react-icons/md";
import { IoArrowDown, IoClose, IoMic } from "react-icons/io5";
import { RiAttachment2 } from "react-icons/ri";
import { BsSend } from "react-icons/bs";
import EmojiPicker from "emoji-picker-react";
import { FaRegFileLines } from "react-icons/fa6";
import MyMessage from "./myMessage";
import OtherMessage from "./otherMessage";
import useClickOutside from "@/hooks/clickOutside";
import {
  InfiniteData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import axiosInstance from "@/lib/axiosInstance";
import { Message } from "@/types/messages";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { toast } from "sonner";
import ChatInput from "./chatInput";
import { getMessages } from "@/actions/message/getMessage";
import { fetchOnServer } from "@/lib/fetchOnServer";
import { useInView } from "react-intersection-observer";
import { Loader } from "lucide-react";
import Loading from "../loading";
import LoadingSpinner from "../ui/loadingSpinner";
import { useSocket } from "@/context/SocketContext";
interface PaginatedMessageResponse {
  data: Message[];
  pagination?: {
    hasNextPage: boolean;
    nextCursor?: string;
  };
}

export default function ChatComponent({ chat }: { chat: Chat }) {
  const queryClient = useQueryClient();
  const { user } = useSelector((state: RootState) => state.auth);
  const listRef = useRef<HTMLDivElement>(null);
  const { ref: topRef, inView } = useInView();
  const { ref: bottomRef, inView: bottomInView } = useInView();
  const [loading, setLoading] = useState(false);
  const { socket } = useSocket();
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useInfiniteQuery({
    queryKey: ["messages", chat.id],
    queryFn: async ({ pageParam }) => {
      const cursor = pageParam as string | undefined;

      const dataRes = await fetchOnServer(
        () => getMessages(chat.id, 15, cursor) // truyền cursor để phân trang
      );
      return dataRes; // { data: [...], pagination: {...} }
    },
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => {
      if (!lastPage.pagination?.hasNextPage) return undefined;
      return lastPage.pagination.nextCursor;
    },
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
  const messages: Message[] = data?.pages.flatMap((page) => page.data) ?? [];
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
    if (message.type === "file") {
      queryClient.setQueryData(
        ["files", chat.id],
        (
          oldData:
            | InfiniteData<{ data: Message[]; pagination: any }>
            | undefined
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
          oldData:
            | InfiniteData<{ data: Message[]; pagination: any }>
            | undefined
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
  // useEffect(() => {
  //   if (listRef.current) {
  //     const list = listRef.current as HTMLDivElement
  //     list.scrollTop = list.scrollHeight
  //   }
  // }, [messages])
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
  function scrollToBottom() {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["messages", chat.id] });
  }, [socket]);
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage && !error) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);
  useEffect(() => {
    if (error) {
      toast.error("Error fetching messages " + error?.message);
    }
  }, [error]);
  useEffect(() => {
    if (!socket) return;
    socket.on(`new_message_${chat.id}`, (res: any, ack: Function) => {
      ack({
        status: "success",
        message: "Message received",
      });
      if (res.data.chat === chat.id) {
        addMessage(res.data);
      }
    });
    socket.on(`message_revoked_${chat.id}`, (res: { messageId: string }) => {
      modifyMessage(res.messageId, {
        isRevoked: true,
        content: "This message is revoked.",
      });
    });
    socket.on(`message_edited_${chat.id}`, (res: { messageId: string, newContent: string }) => {
      modifyMessage(res.messageId, {
        isEdited: true,
        content: res.newContent,
      });
    });

    socket.on(
      "change_status_message",
      (data: { messageId: string; status: string }) => {
        queryClient.setQueryData(
          ["messages", chat.id],
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
                  data: page.data.map((message) =>
                    message.id === data.messageId
                      ? { ...message, status: data.status }
                      : message
                  ),
                };
              }),
            };
          }
        );
      }
    );
    return () => {
      socket.off(`new_message_${chat.id}`);
      socket.off("change_status_message");
    };
  }, [socket, chat.id, queryClient]);

  return (
    <div className="w-full h-full flex flex-col border-solid relative">
      <div className="h-[70px] w-full bg-white flex items-center px-4 border-b-1 border-gray-200">
        <div className="flex items-center relative h-full">
          <img
            src={chat.avatar || "/images/default-avatar.jpg"}
            alt="profile"
            className="w-12 h-12 rounded-full object-scale-down bg-white border-1 border-gray-200"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = "/images/default-avatar.jpg";
            }}
          />
          {chat.isOnline && (
            <div className="w-2.5 h-2.5 bg-green-500 rounded-full absolute top-9 left-[30px]"></div>
          )}
        </div>
        <div className="ml-2">
          <p className="text-lg font-medium font-inter">{chat.name}</p>
          {chat.isOnline && (
            <p className="text-sm text-gray-500 font-inter -mt-1 ml-[2px] font-light ">
              Active
            </p>
          )}
        </div>
      </div>
      {!bottomInView && (
        <div className="absolute bottom-20 right-[50%] z-20">
          <button
            onClick={scrollToBottom}
            className="bg-gray-300 p-2 rounded-full hover:bg-gray-300 transition-all duration-300"
          >
            <IoArrowDown className="w-5 h-5 text-blue-500" />
          </button>
        </div>
      )}
      <div
        ref={listRef}
        className="Messages bg-gray-100 flex-1 overflow-y-auto pb-2 flex flex-col-reverse"
      >
        {messages.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 px-4">
            <img
              src="/icons/empty-chat.png"
              alt="No messages"
              className="w-24 h-24 mb-4"
            />
            <h2 className="text-xl font-semibold text-gray-700">
              Let’s start an interesting conversation!
            </h2>
            <p className="text-sm mt-2 mb-4">
              You haven’t sent any messages yet. Say hi and break the ice!
            </p>
          </div>
        )}

        <div className="min-h-[1px] w-2" ref={bottomRef}></div>
        {Array.isArray(messages) &&
          messages.map((message: Message, index: number) => {
            if (user.id === message.sender.id) {
              return <MyMessage key={message.id} message={message} />;
            } else {
              const beforeMessage = messages[index + 1] || null;
              const afterMessage = messages[index - 1] || null;
              if (afterMessage) {
                const timeDiff =
                  (new Date(afterMessage.createdAt).getTime() -
                    new Date(message.createdAt).getTime()) /
                  1000;
                if (
                  timeDiff > 2 * 60 ||
                  afterMessage.sender.id !== message.sender.id
                ) {
                  return (
                    <OtherMessage
                      key={message.id}
                      message={message}
                      showAvatar={true}
                    />
                  );
                } else {
                  return (
                    <OtherMessage
                      key={message.id}
                      message={message}
                      showAvatar={false}
                    />
                  );
                }
              }
              return (
                <OtherMessage
                  key={message.id}
                  message={message}
                  showAvatar={true}
                />
              );
            }
          })}
        <div className="min-h-[1px] w-2" ref={topRef}></div>

        {isFetchingNextPage && <LoadingSpinner isLoading={true} />}
      </div>
      {/* bottom */}
      <div className="">
        <ChatInput chat={chat} />
      </div>
    </div>
  );
}

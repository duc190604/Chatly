"use client";
import { usePathname, useRouter } from "next/navigation";
import { Message } from "@/types/messages";
type Props = {
  name: string;
  chatId: string;
  lastMessage: Message | null;
  avatar: string;
  isOnline?: boolean;
  isTyping?: boolean;
  isRead?: boolean;
};
export default function ChatItem({
  name,
  chatId,
  lastMessage,
  avatar,
  isOnline = false,
  isTyping = false,
  isRead = false,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const idSelected = pathname.split("/").filter(Boolean).pop();
  const content =
    lastMessage?.type === "text"
      ? lastMessage.content
      : lastMessage?.type === "image"
      ? "Sent an image"
      : lastMessage?.type === "audio"
      ? "Sent an audio"
      : lastMessage?.type === "video"
      ? "Sent a video"
      : lastMessage?.type === "file"
      ? "Sent a file"
      : lastMessage?.content;

  return (
    <div
      className={`w-full h-16 flex items-center cursor-pointer hover:bg-white-foreground/70 px-[4%] ${
        idSelected === chatId ? "bg-white-foreground/70" : ""
      }`}
      onClick={() => router.push(`/apps/chats/${chatId}`)}
    >
      <div className="flex relative">
        <img
          src={avatar || "/images/default-avatar.jpg"}
          alt="profile"
          className="w-14 h-14 rounded-full border-2 border-gray-200 object-scale-down"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = "/images/default-avatar.jpg";
          }}
        />
        {isOnline && (
          <div className="border-1 border-white w-3 h-3 bg-green-500 rounded-full absolute top-11 left-10"></div>
        )}
      </div>

      <div className="ml-2 flex-1 overflow-hidden">
        <p className="font-medium font-inter">{name}</p>
        <div className="flex items-center w-full">
          <p className="font-inter text-sm text-gray-500 ml-[2px] truncate overflow-hidden flex-row">
            {content || "No message yet"}
          </p>
          <p className="font-inter text-[14px] font-light text-gray-400 ml-[4px] flex-shrink-0 whitespace-nowrap">
            {lastMessage?.createdAt
              ? `- ${new Date(lastMessage.createdAt).toLocaleTimeString(
                  "vi-VN",
                  { hour: "2-digit", minute: "2-digit" }
                )}`
              : ""}
          </p>
        </div>
      </div>
    </div>
  );
}

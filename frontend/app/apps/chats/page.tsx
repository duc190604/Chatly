
import ListChat from "@/components/chat/listChat";
import ChatComponent from "@/components/chat/chatComponent";
import { Chat } from "@/types";
import InfoChat from "@/components/chat/infoChat";
import { AssetChat } from "@/components/chat/assetChat";

export default function ChatPage() {
  
  return (
    <div className="w-full h-full flex">
      <div className="flex flex-1 flex-col items-center justify-center bg-gray-100">
        <div className="flex flex-col items-center justify-center space-y-4 p-8 text-center">
          <div className="rounded-full bg-primary/10 p-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-10 w-10 text-primary"
            >
              <path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4c0-1.1.9-2 2-2h8a2 2 0 0 1 2 2v5Z" />
              <path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold">Welcome to Messenger</h1>
          <p className="text-muted-foreground">
            Select a conversation from the sidebar for start chatting
          </p>
          {/* <Button
            variant="outline"
            className="mt-4"
            onClick={() =>
              window.dispatchEvent(new CustomEvent("new-conversation"))
            }
          >
            Start a new conversation
          </Button> */}
        </div>
      </div>
    </div>
  );
}


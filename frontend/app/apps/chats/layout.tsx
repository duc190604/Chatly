import ListChat from "@/components/chat/listChat";

export default function ChatLayout({ children }: { children: React.ReactNode }) {
    return (
      <div className="w-full h-full flex">
        <div className="w-1/4 h-full">
          <ListChat />
        </div>
        <div className="w-3/4 h-full flex">
         {children}
        </div>
      </div>
    );
}

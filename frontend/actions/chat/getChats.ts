"use server";

import { AxiosError, AxiosResponse } from "axios";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { error } from "console";
import { createServerAxios } from "@/lib/createServerAxios";

export async function getChats(): Promise<any> {
  try{
    const session = await getServerSession(authOptions);
    const user= session?.user
    const axiosServer = await createServerAxios();
    const response = await axiosServer.get("/api/chats");
    if (response.status === 200) {
      const data = response.data.data.sort((a: any, b: any) => {
        const aLastMessage = a.lastMessage || { createdAt: new Date(0) };
        const bLastMessage = b.lastMessage || { createdAt: new Date(0) };
        return (
          new Date(bLastMessage.createdAt).getTime() -
          new Date(aLastMessage.createdAt).getTime()
        );
      });

      const format = data.map((chat: any) => {
        let avatar;
        let name;
        if(chat.lastMessage?.usersDeleted?.includes(user?.id)){
          chat.lastMessage = null;
        }
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
      });
      return format;
    }
    return [];
  }
  catch(err:any)
  {
    return {
      error: err
    };
  }
  
}

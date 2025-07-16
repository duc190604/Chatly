"use server";

import { createServerAxios } from "@/lib/createServerAxios";

export async function getMessages(chatId: string,limit?:number,lastMessageId?:string, type?:string, getRevoked?:boolean): Promise<any> {
  try{
    const temp = getRevoked === false ? false : true
    const axiosServer = await createServerAxios();
    const response = await axiosServer.get(`/api/messages?chatId=${chatId}${limit ? `&limit=${limit}` : ''}${lastMessageId ? `&lastMessageId=${lastMessageId}` : ''}${type ? `&type=${type}` : ''}&getRevoked=${temp}`);
    if (response.status === 200) {
      const data = response.data;
      return data;
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

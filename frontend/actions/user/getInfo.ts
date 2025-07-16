"use server";

import { AxiosError, AxiosResponse } from "axios";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { error } from "console";
import { createServerAxios } from "@/lib/createServerAxios";

export async function getInfo(
  email: string
): Promise<any> {
  try {
    const axiosServer = await createServerAxios();
    const response = await axiosServer.get(
      `/api/friends/info?email=${email}`
    );
    const data = response.data;
    return data;
  } catch (err: any) {
    return {
      error: err,
    };
  }
}

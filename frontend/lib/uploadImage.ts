import axios from "axios";
import { toast } from "sonner";
export default async function uploadFile(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  try {
    const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/uploads/file`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data.data;
  } catch (error) {
    throw error
  }
}



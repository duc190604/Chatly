"use client";
import { useEffect, useState } from "react";
import { FaAngleLeft } from "react-icons/fa";
import { GoChevronLeft } from "react-icons/go";
import { TiArrowLeft } from "react-icons/ti";
import { PopupImage } from "@/components/popupImage";
import { FaRegFileLines } from "react-icons/fa6";
import { FaFileAlt } from "react-icons/fa";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getMessages } from "@/actions/message/getMessage";
import { fetchOnServer } from "@/lib/fetchOnServer";
import { Message } from "@/types/messages";
import { Chat } from "@/types";
import { useInView } from "react-intersection-observer";
import LoadingSpinner from "../ui/loadingSpinner";
import { downloadFile } from "@/lib/utils";

type Prop = {
  chat: Chat,
  tabName: string,
  setTabName: (name: string) => void,
};
export const AssetChat = ({ chat, tabName, setTabName }: Prop) => {
  const [isMedia, setIsMedia] = useState(tabName === "media" ? true : false);
  const [isOpenPopupImage, setIsOpenPopupImage] = useState(false);
  const [urlMedia, setUrlMedia] = useState("");
  const { ref: downRefImages, inView: inViewImages } = useInView();
  const { ref: downRefFiles, inView: inViewFiles } = useInView();
  const { data: data_images, fetchNextPage: fetchNextPageImages,
    hasNextPage: hasNextPageImages,
    isFetchingNextPage: isFetchingNextPageImages,
    isLoading: isLoadingImages,
    error: errorImages, } = useInfiniteQuery({
      queryKey: ["images", chat.id],
      queryFn: async ({ pageParam }) => {
        const cursor = pageParam as string | undefined;

        const dataRes = await fetchOnServer(() =>
          getMessages(chat.id, 9, cursor, "image", Boolean(false)) // truyền cursor để phân trang
        );
        return dataRes; // { data: [...], pagination: {...} }
      },
      initialPageParam: undefined,
      getNextPageParam: (lastPage) => {
        if (!lastPage.pagination?.hasNextPage) return undefined;
        return lastPage.pagination.nextCursor;
      },
      refetchOnWindowFocus: false,
    });
  const { data: data_files, fetchNextPage: fetchNextPageFiles,
    hasNextPage: hasNextPageFiles,
    isFetchingNextPage: isFetchingNextPageFiles,
    isLoading: isLoadingFiles,
    error: errorFiles, } = useInfiniteQuery({
      queryKey: ["files", chat.id],
      queryFn: async ({ pageParam }) => {
        const cursor = pageParam as string | undefined;

        const dataRes = await fetchOnServer(() =>
          getMessages(chat.id, 6, cursor, "file", Boolean(false)) // truyền cursor để phân trang
        );
        return dataRes; // { data: [...], pagination: {...} }
      },
      initialPageParam: undefined,
      getNextPageParam: (lastPage) => {
        if (!lastPage.pagination?.hasNextPage) return undefined;
        return lastPage.pagination.nextCursor;
      },
      refetchOnWindowFocus: false,
    });
  const images: Message[] = data_images?.pages.flatMap((page) => page.data) ?? [];
  const files: Message[] = data_files?.pages.flatMap((page) => page.data) ?? [];
  const handleOpenPopupImage = async (url: string) => {
    setUrlMedia(url);
    setIsOpenPopupImage(true);
  };
  useEffect(() => {
    if (inViewImages && hasNextPageImages && !isFetchingNextPageImages && !errorImages) {
      fetchNextPageImages();
    }
  }, [inViewImages, hasNextPageImages, isFetchingNextPageImages, fetchNextPageImages]);
  useEffect(() => {
    if (inViewFiles && hasNextPageFiles && !isFetchingNextPageFiles && !errorFiles) {
      fetchNextPageFiles();
    }
  }, [inViewFiles, hasNextPageFiles, isFetchingNextPageFiles, fetchNextPageFiles]);
  return (
    <div className="w-full h-full px-2 flex flex-col">
      <PopupImage
        urlMedia={urlMedia}
        isOpen={isOpenPopupImage}
        onClose={() => setIsOpenPopupImage(false)}
      />
      <div className="flex items-center mt-3">
        <div
          className="cursor-pointer hover:bg-gray-200 rounded-full p-1 transition-all duration-200"
          onClick={() => setTabName("info")}
        >
          <TiArrowLeft size={24} className="cursor-pointer" />
        </div>
        <p className="text-lg font-medium font-inter ml-4">Media & Files</p>
      </div>
      <div className="flex items-center w-full mt-5 ml-2">
        <div
          className={` cursor-pointer w-fit px-4  ${
            isMedia
              ? "border-b-3 border-blue-500 text-blue-500"
              : "text-gray-500"
          }`}
          onClick={() => setIsMedia(true)}
        >
          <p>Media</p>
        </div>
        <div
          className={`cursor-pointer w-fit px-4 ${
            isMedia
              ? "text-gray-500"
              : " border-b-3 border-blue-500 text-blue-500"
          }`}
          onClick={() => setIsMedia(false)}
        >
          <p>Files</p>
        </div>
      </div>
      {isMedia ? (
        <div>
          {images.length === 0 && <p className="text-center text-gray-500 w-full mt-6">No media found</p>}
          <div className="grid grid-cols-3 gap-2 mt-3 px-2 overflow-y-auto py-2 pb-4">
            {images.map((item) => (
              <img
                key={item.id}
                onClick={() => handleOpenPopupImage(item.content)}
                className="cursor-pointer active:scale-98 rounded-md object-cover w-full h-full border-2 border-gray-300"
                src={item.content}
                alt=""
                style={{
                  aspectRatio: "1/1",
                }}
              />
            ))}
            <div className="min-h-[1px] w-2" ref={downRefImages}></div>
            {isFetchingNextPageImages && <LoadingSpinner isLoading={true} />}
          </div>
        </div>
      ) : (
        <div className="overflow-y-auto mt-3 pb-4">
          {files.length === 0 && <p className="text-center text-gray-500 w-full mt-6">No files found</p>}
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center gap-2 mx-4 border-b border-gray-200 pb-3 mt-3 cursor-pointer"
              onClick={() => {
                downloadFile(file.content.split(";")[0], file.content.split(";")[1]);
              }}
            >
              <div className="bg-gray-200 rounded-sm p-3">
                <FaFileAlt size={16} className="" />
              </div>
              <p className="text-lg font-inter  ml-[2px] w-full truncate text-ellipsis overflow-hidden ">
                {file.content.split(";")[1]}
              </p>
            </div>
          ))}
          <div className="min-h-[1px] w-2" ref={downRefFiles}></div>
          {isFetchingNextPageFiles && <LoadingSpinner isLoading={true} />}
        </div>
      )}
    </div>
  );
};

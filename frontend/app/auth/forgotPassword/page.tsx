"use client";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { useState } from "react";
import { BiUser } from "react-icons/bi";
import { FaGoogle, FaRegUser } from "react-icons/fa";
import { IoArrowBack } from "react-icons/io5";
import { MdOutlineMail } from "react-icons/md";
import { RiLock2Line } from "react-icons/ri";
import { TbFileDescription, TbLockPassword } from "react-icons/tb";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import Loading from "@/components/loading";
import { useRouter } from "next/navigation";
export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { mutate: sendVerifyEmail } = useMutation({
    mutationFn: async () => {
      try {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/auth/send-reset-password`,
          {
            email,
          }
        );
        return response.data;
      } catch (error: any) {
        throw error;
      }
    },
    onMutate: () => {
      setIsLoading(true);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.error?.message || "An error occurred");
    },
    onSuccess: (data) => {
      toast.success(data.data.message || "Email sent successfully");
      sessionStorage.setItem("email", email);
      setStep(2);
    },
    onSettled: () => {
      setIsLoading(false);
    },
  });
  const verifyEmail = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/verify-email`,
        {
          email,
          code,
        }
      );
      if (response.status === 200) {
        setToken(response.data.data.token);
        sessionStorage.setItem("token", response.data.data.token);
        toast.success("Verify email success");
        setStep(3);
      }
    } catch (error: any) {
      toast.error(
        error.response.data.error.message ||
          "An error occurred, please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };
  const changePassword = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/reset-password`,
        {
          email,
          newPassword: password,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.status === 201) {
        toast.success("Reset password success");
        router.replace("/auth/login");
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.error?.message ||
          "An error occurred, please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="h-full w-full flex justify-center items-center">
      <div className="bg-white w-[400px] py-5 rounded-lg shadow-lg my-auto border-1 border-gray-200">
        <Loading isLoading={isLoading}/>
        <div className="flex flex-col items-center h-full">
          {step !== 1 && (
            <IoArrowBack
              onClick={() => setStep(step - 1)}
              className="text-gray-400 mr-auto mb-[-20px] ml-5  hover:text-gray-500 transition-all duration-200 cursor-pointer"
              size={20}
            />
          )}
          <h1 className="text-3xl mx-auto text-black font-pomp">Forgot Password</h1>

          {step === 1 && (
            <div className="h-full w-full items-center justify-center flex flex-col ">
              <p className="text-gray-500 text-sm mt-0">
                We will send code to your email
              </p>
              <form className="flex flex-col  justify-center w-[80%] mt-2"
              onSubmit={(e) => {
                e.preventDefault();
                sendVerifyEmail();
              }}
              >
                <p className="text-black text-sm ml-2">
                  Please enter your email
                </p>
                <div className="bg-[#edf2ff] w-full h-[50px] rounded-2xl mt-1 border-none flex items-center justify-center px-3">
                  <MdOutlineMail className="text-slate-700" size={28} />
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    placeholder="Email"
                    autoComplete="email"
                    className="w-full h-full rounded-2xl border-none text-black outline-none ml-2  font-light"
                  />
                </div>

                <button
                  type="submit"
                  className="mx-auto bg-blue-500 text-white  w-[100px]  h-[40px] rounded-2xl mt-4 border-none hover:bg-blue-600 transition-all duration-200 cursor-pointer active:scale-95"
                >
                  Next
                </button>
              </form>
              <p className="text-gray-500 text-sm mt-2">
                Already have an account?{" "}
                <Link
                  href="/auth/login"
                  className="text-blue-500 hover:text-blue-600 active:scale-95 transition-all duration-200"
                >
                  Login
                </Link>
              </p>
            </div>
          )}
          {/* step2 */}
          {step === 2 && (
            <div className="h-full w-full items-center justify-center flex flex-col ">
              <p className="text-gray-500 text-sm mt-0">
                We sent code to your email
              </p>
              <form className="flex flex-col  justify-center w-[80%] mt-2"
              onSubmit={(e) => {
                e.preventDefault();
                verifyEmail();
              }}
              >
                <p className="text-black text-sm ml-2">Please enter the code</p>
                <div className="bg-[#edf2ff] w-full h-[50px] rounded-2xl mt-1 border-none flex items-center justify-center px-3">
                  <TbLockPassword className="text-slate-700" size={28} />
                  <input
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    type="text"
                    placeholder="Code"
                    autoComplete="off"
                    className="w-full h-full rounded-2xl border-none text-black outline-none ml-2  font-light"
                  />
                </div>

                <button
                  type="submit"
                  className="mx-auto bg-blue-500 text-white  w-[100px]  h-[40px] rounded-2xl mt-4 border-none hover:bg-blue-600 transition-all duration-200 cursor-pointer active:scale-95"
                >
                  Verify
                </button>
              </form>
              <p className="text-gray-500 text-sm mt-2">
                Already have an account?{" "}
                <Link
                  href="/auth/login"
                  className="text-blue-500 hover:text-blue-600 active:scale-95 transition-all duration-200"
                >
                  Login
                </Link>
              </p>
            </div>
          )}
          {step === 3 && (
            <div className="h-full w-full items-center justify-center flex flex-col ">
              <p className="text-gray-500 text-sm mt-0">
                Please set your new password
              </p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  changePassword();
                }}
                className="flex flex-col  justify-center w-[80%]"
              >
                <div className="bg-[#edf2ff] w-full h-[50px] rounded-2xl mt-4 border-none flex items-center justify-center px-3">
                  <RiLock2Line className="text-slate-700" size={28} />
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type="password"
                    placeholder="New Password"
                    autoComplete="new-password"
                    className=" text-base w-full h-full rounded-2xl border-none text-black outline-none ml-2  font-light "
                  />
                </div>
                <div className="bg-[#edf2ff] w-full h-[50px] rounded-2xl mt-4 border-none flex items-center justify-center px-3">
                  <RiLock2Line className="text-slate-700" size={28} />
                  <input
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    type="password"
                    autoComplete="off"
                    placeholder="Confirm Password"
                    className="w-full h-full rounded-2xl border-none text-black outline-none ml-2  font-light"
                  />
                </div>
                <div className="flex items-center space-x-2 mt-3 ml-2">
                  <Checkbox
                    id="terms"
                    className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500 border-gray-300"
                  />
                  <label
                    htmlFor="terms"
                    className="text-sm text-gray-500 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Logout all devices
                  </label>
                </div>

                <button
                  type="submit"
                  className="mx-auto bg-blue-500 text-white  w-[100px]  h-[40px] rounded-2xl mt-4 border-none hover:bg-blue-600 transition-all duration-200 cursor-pointer active:scale-95"
                >
                  Save
                </button>
              </form>
              <p className="text-gray-500 text-sm mt-2">
                Already have an account?{" "}
                <Link
                  href="/auth/login"
                  className="text-blue-500 hover:text-blue-600 active:scale-95 transition-all duration-200"
                >
                  Login
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

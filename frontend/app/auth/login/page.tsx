"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { MdOutlineMail } from "react-icons/md";
import { RiLock2Line } from "react-icons/ri";
import { toast } from "sonner";
import { getSession, signIn } from "next-auth/react";
import Loading from "@/components/loading";
import { useDispatch } from "react-redux";
import { setSession } from "@/redux/features/authSlice";
export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();
  const login = async () => {
    setIsLoading(true);
    if(!email || !password) {
      toast.error("Email and password are required");
      setIsLoading(false);
      return;
    }
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setIsLoading(false);
    if (res?.error) {
      toast.error("Email or password is incorrect");
    } else {
      const session = await getSession();
      if (session?.user) {
        dispatch(setSession(session.user));
      }
      router.replace("/apps/chats");
      toast.success("Login success");
    }
  };
  return (
    <div className="h-full w-full flex flex-col">
      <Loading isLoading={isLoading} />
      <img
        src="/images/logo.png"
        alt="login"
        width={140}
        className="ml-5 mt-3"
      />
      <div className="bg-white w-[420px] h-[500px] mx-auto mt-[10%]">
        <div className="flex flex-col items-center h-full">
          <h1 className="text-5xl text-black mt-4 font-pomp">Login</h1>
          <p className="text-gray-500 text-base">Please access your account</p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              login();
            }}
            className="flex flex-col items-center justify-center w-[80%] mt-2"
          >
            <div className="bg-[#edf2ff] w-full h-[50px] rounded-2xl mt-3 border-none flex items-center justify-center px-3">
              <MdOutlineMail className="text-slate-700" size={28} />
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="Email"
                autoComplete="email"
                className="w-full h-full rounded-2xl border-none text-black outline-none ml-2 font-light focus:ring-0 focus-within:ring-0"
                onFocus={(e) =>
                  e.target.parentElement?.classList.add(
                    "ring-2",
                    "ring-blue-400"
                  )
                }
                onBlur={(e) =>
                  e.target.parentElement?.classList.remove(
                    "ring-2",
                    "ring-blue-400"
                  )
                }
              />
            </div>

            <div className="bg-[#edf2ff] w-full h-[50px] rounded-2xl mt-5 border-none flex items-center justify-center px-3">
              <RiLock2Line className="text-slate-700" size={28} />
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                autoComplete="current-password"
                placeholder="Password"
                className="w-full h-full rounded-2xl border-none text-black outline-none ml-2 font-light focus:ring-0 focus-within:ring-0"
                onFocus={(e) =>
                  e.target.parentElement?.classList.add(
                    "ring-2",
                    "ring-blue-400"
                  )
                }
                onBlur={(e) =>
                  e.target.parentElement?.classList.remove(
                    "ring-2",
                    "ring-blue-400"
                  )
                }
              />
            </div>
            <Link
              href="/auth/forgotPassword"
              className="text-gray-500 text-sm ml-auto mr-2 mt-1 cursor-pointer hover:text-gray-400"
            >
              Forgot your password ?
            </Link>
            <button className="bg-blue-500 text-white  w-[100px]  h-[40px] rounded-2xl mt-4 border-none hover:bg-blue-600 transition-all duration-200 cursor-pointer active:scale-95">
              Login
            </button>
          </form>
          <div className="flex items-center justify-center mt-4">
            <p className="text-gray-500 text-[12px]">Don't have an account ?</p>
            <Link
              href="/auth/register"
              className="text-blue-500 text-[12px] ml-1 cursor-pointer hover:text-blue-400"
            >
              Sign up
            </Link>
          </div>
         
        </div>
      </div>
    </div>
  );
}

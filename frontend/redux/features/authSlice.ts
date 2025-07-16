import { User } from "@/types/user";
import { createSlice } from "@reduxjs/toolkit";
export interface AuthState {
    user: User
    accessToken: string;
    refreshToken: string;
}
const initialState: AuthState = {
    user: {
        id: "",
        username: "",
        email: "",
        avatar: "",
        description: "",
        coverImage: "",
        status: "",
        birthday: new Date(),
        createdAt: new Date(),
        userBlocked: [],
        chatBlocked: [],
        lastSeen: ""
    },
    accessToken: "",
    refreshToken: "",
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setUser: (state, action) => {
            state.user = action.payload;
        },
        setAccessToken: (state, action) => {
            state.accessToken = action.payload;
        },
        setRefreshToken: (state, action) => {
            state.refreshToken = action.payload;
        },
        setSession: (state, action) => {
            state.user = { id: action.payload.id,
                username: action.payload.username,
                email: action.payload.email,
                avatar: action.payload.avatar,
                description: action.payload.description,
                coverImage: action.payload.coverImage || "",
                status: action.payload?.status || "",
                userBlocked: action.payload.userBlocked || [],
                chatBlocked: action.payload.chatBlocked || [],
                lastSeen: action.payload.lastSeen || "",
                birthday: action.payload.birthday || new Date(),
                createdAt: action.payload.createdAt || new Date()
            };
            state.accessToken = action.payload.accessToken;
            state.refreshToken = action.payload.refreshToken;
        },
        logout: (state) => {
            console.log("logout abahbxahbjk bshsbahdbd ádbkádkjádm ạkdhạkdhạkđá ádjkábdakjsdsada sdấd ádsadsađasad");
            state = {
    user: {
        id: "",
        username: "",
        email: "",
        avatar: "",
        description: "",
        coverImage: "",
        status: "",
        birthday: new Date(),
        createdAt: new Date(),
        userBlocked: [],
        chatBlocked: [],
        lastSeen: ""
    },
    accessToken: "",
    refreshToken: "",
};
        },
    },
});
export const { setUser, setAccessToken, setRefreshToken, setSession, logout } = authSlice.actions;
export default authSlice.reducer;


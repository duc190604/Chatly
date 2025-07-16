import { createSlice } from "@reduxjs/toolkit";
const initialState = {
    isEditMessage: false,
    messageId: "",
    content: "",
};

const chatSlice = createSlice({
    name: "chat",
   initialState,
    reducers: {
        setEditMessage: (state, action) => {
            state.isEditMessage = action.payload.isEditMessage;
            state.messageId = action.payload.messageId;
            state.content = action.payload.content;
        },
        setMessageId: (state, action) => {
            state.messageId = action.payload;
        },
        logout: (state) => {
            state= initialState;
        }
    },
});

export const { setEditMessage, setMessageId } = chatSlice.actions;
export default chatSlice.reducer;


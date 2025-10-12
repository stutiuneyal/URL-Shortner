import { create } from "zustand";

const LOCAL_KEY = "auth-v1";

export const useAuthStore = create((set) => ({
    user:null,
    token:null,
    init: () => {
        try{
            const raw = localStorage.getItem(LOCAL_KEY);
            if(raw){
                const {user,token} = JSON.parse(raw);
                set({user,token});
            }
        }catch{}
    },
    login: ({user,tokens}) => {
        const accessToken = tokens.accessToken;
        set({user,token: accessToken});
        localStorage.setItem(LOCAL_KEY,JSON.stringify({user,token: accessToken}))
    },
    logout: () => {
        set({user:null,token:null});
        localStorage.removeItem(LOCAL_KEY);
    }
}));
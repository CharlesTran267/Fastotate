import { create } from 'zustand';
import axios from 'axios';

export type UserSessionStore = {
    user_email: string | null;
    session_token: string | null;
    actions: {
        login: (email: string, password: string) => Promise<void>;
        logout: () => void;
    };
};

export const useUserSessionStore = create<UserSessionStore>((set, get) => {
    const backendURL = process.env.NEXT_PUBLIC_API_URL;
    return {
        user_email: null,
        session_token: null,
        actions: {
            login: async (email: string, password: string) => {
                const formData = new FormData();
                formData.append('email', email);
                formData.append('password', password);
                try {
                    const response = await axios.post(
                        `${backendURL}/login`,
                        formData,
                    );
                    if (response.data.status !== 200) {
                        console.error('Failed to login');
                        return;
                    }
                    const session_token = response.data.data;
                    set({ user_email: email, session_token });
                } catch (error) {
                    console.error(error);
                }
            },
            logout: async () => {
                const session_token = get().session_token;
                if (session_token === null) {
                    console.error('No session token');
                    return;
                }
                try {
                    const response = await axios.post(`${backendURL}/logout`, {
                        session_token,
                    });
                    if (response.data.status !== 200) {
                        console.error('Failed to logout');
                        return;
                    }
                    set({ user_email: null, session_token: null });
                } catch (error) {
                    console.error(error);
                }
            },
        },
    };
});

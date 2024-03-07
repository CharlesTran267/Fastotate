import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import axios, { Axios, AxiosResponse } from 'axios';

export type ProjectSummary = {
  project_id: string;
  name: string;
  classes: string[];
  default_class: string;
  num_images: number;
};

export type UserSessionStore = {
  user_email: string | null;
  session_token: string | null;
  actions: {
    login: (
      email: string,
      password: string,
    ) => Promise<any> | AxiosResponse<any, any> | null;
    logout: () => void;
    getProjectsSummary: () => ProjectSummary[] | null;
    deleteProject: (project_id: string) => void;
    changeProjectName: (project_id: string, newName: string) => void;
  };
};

export const useUserSessionStore = create<UserSessionStore>()(
  persist(
    (set, get) => {
      const backendURL = process.env.NEXT_PUBLIC_API_URL;
      return {
        user_email: null,
        session_token: null,
        actions: {
          login: async (email: string, password: string) => {
            const form = new FormData();
            form.append('email', email);
            form.append('password', password);
            try {
              const response = await axios.post(`${backendURL}/login`, form);
              if (response.data.status === 200) {
                set({
                  user_email: email,
                  session_token: response.data.data,
                });
              }
              return response.data;
            } catch (error) {
              console.error(error);
            }
            return null;
          },
          logout: async () => {
            if (get().session_token === null) return;
            try {
              await axios.post(`${backendURL}/logout`, {
                token: get().session_token,
              });
              set({ user_email: null, session_token: null });
            } catch (error) {
              console.error(error);
            }
          },
          getProjectsSummary: async () => {
            if (get().session_token === null) return null;
            try {
              const response = await axios.get(
                `${backendURL}/get-projects-summary?session_token=${get().session_token}`,
              );
              return response.data.data as ProjectSummary[];
            } catch (error) {
              console.error(error);
            }
            return null;
          },
          deleteProject: async (project_id: string) => {
            if (get().session_token === null) return;
            try {
              await axios.post(`${backendURL}/delete-project`, {
                project_id: project_id,
                token: get().session_token,
              });
            } catch (error) {
              console.error(error);
            }
          },
          changeProjectName: async (project_id: string, newName: string) => {
            if (get().session_token === null) return;
            try {
              await axios.post(`${backendURL}/change-project-name`, {
                project_id: project_id,
                name: newName,
                token: get().session_token,
              });
            } catch (error) {
              console.error(error);
            }
          },
        },
      };
    },
    {
      name: 'user-session-storage',
      storage: createJSONStorage(() => sessionStorage),
      partialize: ({ actions, ...rest }: any) => rest,
    },
  ),
);

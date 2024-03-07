import { create } from 'zustand';

interface ErrorStore {
  message: string;
  getMessage: () => string;
}

const useErrorStore = create<ErrorStore>((set, get) => ({
  message: '',
  getMessage: () => {
    const error = get().message;
    set(() => ({ message: '' }));

    return error;
  },
}));

export { useErrorStore };

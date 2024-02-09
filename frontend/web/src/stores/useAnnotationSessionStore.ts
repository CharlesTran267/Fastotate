import { AnnotationMode } from '@/types/AnnotationMode';
import { create } from 'zustand';

type AnntationSessionStore = {
  annotationMode: AnnotationMode | null;
  actions: {
    setAnnotationMode: (mode: AnnotationMode) => void;
  };
};

export const useAnnotationSessionStore = create<AnntationSessionStore>(
  (set) => ({
    annotationMode: null,
    actions: {
      setAnnotationMode: (mode: AnnotationMode) =>
        set(() => ({ annotationMode: mode })),
    },
  }),
);

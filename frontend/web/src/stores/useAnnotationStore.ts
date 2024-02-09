import { create } from 'zustand';
import { Annotation, Category, Image } from '@/types/Annotations';

type AnnotationStore = {
  annotations: Annotation[];
  categories: Category[];
  images: Image[];
  actions: {};
};

export const useAnnotationStore = create<AnnotationStore>((set) => ({
  annotations: [],
  categories: [],
  images: [],
  actions: {},
}));

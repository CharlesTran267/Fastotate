import { AnnotationMode } from '@/types/AnnotationMode';
import { create } from 'zustand';
import { defaultProjectConfig } from '@/app.config';
import { createJSONStorage, persist } from 'zustand/middleware';
import test_image from '@/resources/test.jpg';
import { merge } from 'lodash';

export class Annotation {
  id: number;
  points: number[];
  isFinished: boolean;
  className: string;

  constructor() {
    this.id = Math.random();
    this.points = [];
    this.className = '';
    this.isFinished = false;
  }

  setClassName(name: string) {
    this.className = name;
  }

  addPoint(point: number) {
    this.points.push(point);
  }

  reset() {
    this.points = [];
    this.className = '';
    this.isFinished = false;
  }
}

export class ImageAnnotation {
  id: number;
  file_name: string;
  width: number;
  height: number;
  annotations: Annotation[];
  file_src: string;

  constructor(data: ImageAnnotation);
  constructor(data_or_file_src: string, width: number, height: number);
  constructor(
    data_or_file_src: string | ImageAnnotation,
    width?: number,
    height?: number,
  ) {
    if (data_or_file_src instanceof ImageAnnotation) {
      this.id = data_or_file_src.id;
      this.annotations = data_or_file_src.annotations;
      this.file_src = data_or_file_src.file_src;
      this.width = data_or_file_src.width;
      this.height = data_or_file_src.height;
      this.file_name = data_or_file_src.file_name;
      return;
    } else {
      this.id = Math.random();
      this.file_name = data_or_file_src.split('/').pop()!;
      this.width = width!;
      this.height = height!;
      this.annotations = [];
      this.file_src = data_or_file_src;
    }
  }

  addAnnotation(annotation: Annotation) {
    this.annotations.push(annotation);
  }

  removeAnnotation(annotation_id: number) {
    this.annotations = this.annotations.filter((a) => a.id !== annotation_id);
  }

  reset() {
    this.annotations.forEach((annotation) => annotation.reset());
  }
}

export class Project {
  id: number;
  project_name: string;
  classes: string[];
  default_class: string;
  images: ImageAnnotation[];

  constructor();
  constructor(data: Project);
  constructor(data?: Project) {
    if (data) {
      this.id = data.id;
      this.project_name = data.project_name;
      this.classes = data.classes;
      this.default_class = data.default_class;
      this.images = data.images;
    } else {
      this.id = Math.random();
      this.project_name = defaultProjectConfig.name;
      this.classes = defaultProjectConfig.classes;
      this.default_class = defaultProjectConfig.defaultClass;
      this.images = [
        new ImageAnnotation(
          test_image.src,
          test_image.width,
          test_image.height,
        ),
      ];
    }
  }

  setProjectName(name: string) {
    this.project_name = name;
  }

  addClass(name: string) {
    this.classes.push(name);
  }

  removeClass(name: string) {
    this.classes = this.classes.filter((c) => c !== name);
  }

  setDefaultClass(name: string) {
    this.classes.map((c) => {
      if (c === name) {
        this.default_class = name;
      }
    });
  }

  addImage(image: ImageAnnotation) {
    this.images.push(image);
  }

  removeImage(image_id: number) {
    this.images = this.images.filter((i) => i.id !== image_id);
  }

  reset() {
    this.images.forEach((image) => image.reset());
  }
}

type AnntationSessionStore = {
  annotationMode: AnnotationMode | null;
  selectedImageID: number | null;
  selectedAnnotationID: number | null;
  project: Project;
  zoomLevel: number;
  zoomCenter: { x: number; y: number };
  actions: {
    setAnnotationMode: (mode: AnnotationMode) => void;
    setProject: (project: Project) => void;
    setSelectedAnnotation: (annotation: Annotation) => void;
    getSelectedAnnotation: () => Annotation | null;
    setSelectedImage: (imageAnnotation: ImageAnnotation) => void;
    getSelectedImage: () => ImageAnnotation | null;
    deleteSelectedImage: () => void;
    deleteSelectedAnnotation: () => void;
  };
};

export const useAnnotationSessionStore = create<AnntationSessionStore>()(
  persist(
    (set, get) => ({
      annotationMode: null,
      selectedImageID: null,
      selectedAnnotationID: null,
      project: new Project(),
      zoomLevel: 1,
      zoomCenter: { x: 0, y: 0 },
      actions: {
        setAnnotationMode: (mode: AnnotationMode) =>
          set(() => ({ annotationMode: mode })),
        setProject(newProject: Project) {
          set(() => ({ project: newProject }));
        },
        setSelectedImage(imageAnnotation: ImageAnnotation) {
          let newProject = new Project(get().project);
          let found = false;
          newProject.images.map((image) => {
            if (image.id === imageAnnotation.id) {
              image = imageAnnotation;
              found = true;
            }
          });
          if (!found) {
            newProject.addImage(imageAnnotation);
          }
          set(() => ({
            selectedImageID: imageAnnotation?.id,
            project: newProject,
          }));
        },
        getSelectedImage() {
          return (
            get().project.images.find(
              (i: ImageAnnotation) => i.id === get().selectedImageID,
            ) || null
          );
        },
        setSelectedAnnotation(annotation: Annotation | null) {
          let newProject = new Project(get().project);
          newProject.images.forEach((image) => {
            if (image.id === get().selectedImageID) {
              const foundAnnotation = image.annotations.find(
                (a) => a.id === annotation?.id,
              );
              if (foundAnnotation) {
                Object.assign(foundAnnotation, annotation);
              }
            }
          });
          set(() => ({
            selectedAnnotationID: annotation?.id,
            project: newProject,
          }));
        },
        getSelectedAnnotation() {
          let selectedImage = get().project.images.find(
            (i: ImageAnnotation) => i.id === get().selectedImageID,
          );
          return (
            selectedImage?.annotations.find(
              (a: Annotation) => a.id === get().selectedAnnotationID,
            ) || null
          );
        },
        deleteSelectedImage() {
          if (!get().selectedImageID) return;
          let newProject = new Project(get().project);
          newProject.removeImage(get().selectedImageID!);
          set(() => ({
            selectedImageID: null,
            project: newProject,
          }));
        },
        deleteSelectedAnnotation() {
          if (!get().selectedAnnotationID) return;
          let newProject = new Project(get().project);
          newProject.images.forEach((image) => {
            if (image.id === get().selectedImageID) {
              image.removeAnnotation(get().selectedAnnotationID!);
            }
          });
          set(() => ({
            selectedAnnotationID: null,
            project: newProject,
          }));
        },
        setZoomLevel: (level: number) => set(() => ({ zoomLevel: level })),
        setZoomCenter: (center: { x: number; y: number }) =>
          set(() => ({ zoomCenter: center })),
      },
    }),
    {
      name: 'annotation-session-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: ({ actions, ...rest }: any) => rest,
      merge: (persisted, current) => {
        return merge({}, current, persisted);
      },
    },
  ),
);

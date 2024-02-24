import { AnnotationMode } from '@/types/AnnotationMode';
import { create } from 'zustand';
import { defaultProjectConfig } from '@/app.config';
import { createJSONStorage, persist } from 'zustand/middleware';
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
  annotations: Annotation[];
  db_key: IDBValidKey | null;

  constructor(data: ImageAnnotation);
  constructor(db_key: IDBValidKey, file_name: string);
  constructor(data_or_key: IDBValidKey | ImageAnnotation, file_name?: string) {
    if (data_or_key instanceof ImageAnnotation) {
      this.id = data_or_key.id;
      this.db_key = data_or_key.db_key;
      this.file_name = data_or_key.file_name;
      this.annotations = data_or_key.annotations;
    } else {
      this.id = Math.random();
      this.db_key = data_or_key!;
      this.file_name = file_name!;
      this.annotations = [];
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
      this.images = [];
    }
  }

  setProjectName(name: string) {
    this.project_name = name;
  }

  addClass(name: string) {
    if (this.classes.includes(name)) return;
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
    addImage: (image: ImageAnnotation) => void;
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
          if (!found) return;
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
              image.annotations = image.annotations.filter(
                (a) => a.id !== get().selectedAnnotationID,
              );
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
        addImage: (image: ImageAnnotation) => {
          let newProject = new Project(get().project);
          newProject.addImage(image);
          set(() => ({ project: newProject }));
        },
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

import { AnnotationMode } from '@/types/AnnotationMode';
import { create } from 'zustand';
import axios from 'axios';
import { socket } from '@/utils/socket';

export class Annotation {
  annotation_id: string;
  points: number[];
  className: string;
  isFinished: boolean;

  constructor();
  constructor(data: any);
  constructor(data?: any) {
    if (!data) {
      this.annotation_id = '';
      this.points = [];
      this.className = '';
      this.isFinished = false;
      return;
    }
    this.annotation_id = data.annotation_id;
    this.points = data.points;
    this.className = data.className;
    this.isFinished = true;
  }
}

export class ImageAnnotation {
  image_id: string;
  file_name: string;
  image: string;
  annotations: Annotation[];

  constructor(data: any) {
    this.image_id = data.image_id;
    this.file_name = data.file_name;
    this.image = data.image;
    this.annotations = data.annotations.map(
      (annotation: any) => new Annotation(annotation),
    );
  }
}

export class Project {
  project_id: string;
  name: string;
  classes: string[];
  default_class: string;
  imageAnnotations: ImageAnnotation[];

  constructor(data: any) {
    this.project_id = data.project_id;
    this.name = data.name;
    this.classes = data.classes;
    this.default_class = data.default_class;
    this.imageAnnotations = data.imageAnnotations.map((image: any) => {
      // const imageInDB = await getImage(image.image_id);
      // if (imageInDB == null) {
      //   await addImage(hexStringToFile(image.image, image.file_name), image.image_id);
      // }
      const newImage = new ImageAnnotation(image);
      return newImage;
    });
  }
}

type AnntationSessionStore = {
  annotationMode: AnnotationMode | null;
  selectedImageID: string | null;
  selectedAnnotationID: string | null;
  project: Project | null;
  zoomLevel: number;
  zoomCenter: { x: number; y: number };
  actions: {
    createProject: () => string | Promise<string> | null;
    updateProject: (project_id: string) => void;
    setAnnotationMode: (mode: AnnotationMode) => void;
    setSelectedImageID: (imageID: string) => void;
    setSelectedAnnotationID: (annotationID: string) => void;
    uploadImage: (image: File, project_id: string) => void;
    addAnnotation: (points: number[], className: string) => void;
    addAnnotations: (
      annotations: { points: number[]; className: string }[],
    ) => void;
    removeSelectedAnnotation: () => void;
    removeSelectedImage: () => void;
    getSelectedImage: () => ImageAnnotation | null;
    getSelectedAnnotation: () => Annotation | null;
    modifySelectedAnnotation: (
      points: number[],
      className: string,
      annotation_id: string,
    ) => void;
    changeProjectName: (name: string) => void;
    changeDefaultClass: (className: string) => void;
    addClass: (className: string) => void;
    setZoomLevel: (zoomLevel: number) => void;
    setZoomCenter: (x: number, y: number) => void;
    setMagicImage: (image_id: string) => void;
    setMagicPoints: (points: number[], labels: number[]) => void;
  };
};

export const useAnnotationSessionStore = create<AnntationSessionStore>(
  (set, get) => {
    const backendURL = 'http://localhost:5000/api';

    socket.on('connect', () => {
      console.log('Connected to server');
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    socket.on('get_project', (data: any) => {
      set(() => ({ project: new Project(data.data) }));
    });

    socket.on('add_annotation', (data: any) => {
      set(() => ({ project: new Project(data.data) }));
    });

    socket.on('delete_annotation', (data: any) => {
      set(() => ({ project: new Project(data.data) }));
    });

    socket.on('delete_image', (data: any) => {
      set(() => ({ project: new Project(data.data) }));
    });

    socket.on('modify_annotation', (data: any) => {
      set(() => ({ project: new Project(data.data) }));
    });

    socket.on('change_project_name', (data: any) => {
      set(() => ({ project: new Project(data.data) }));
    });

    socket.on('set_default_class', (data: any) => {
      set(() => ({ project: new Project(data.data) }));
    });

    socket.on('add_class', (data: any) => {
      set(() => ({ project: new Project(data.data) }));
    });

    socket.on('add_annotations', (data: any) => {
      set(() => ({ project: new Project(data.data) }));
    });

    return {
      annotationMode: AnnotationMode.SELECT,
      selectedImageID: null,
      selectedAnnotationID: null,
      project: null,
      zoomLevel: 1,
      zoomCenter: { x: 0, y: 0 },
      actions: {
        createProject: async () => {
          try {
            const response = await axios.post(`${backendURL}/create-project`);
            set(() => ({ project: new Project(response.data.data) }));
            return response.data.data.project_id;
          } catch (error) {
            console.error('Error creating project:', error);
            return null;
          }
        },
        updateProject: (project_id: string) => {
          socket.emit('get_project', { project_id: project_id });
        },
        setAnnotationMode: (mode: AnnotationMode) =>
          set(() => ({ annotationMode: mode })),
        setSelectedAnnotationID: (annotationID: string) =>
          set(() => ({ selectedAnnotationID: annotationID })),
        setSelectedImageID: (imageID: string) =>
          set(() => ({ selectedImageID: imageID })),
        uploadImage: async (image: File, project_id: string) => {
          const formData = new FormData();
          formData.append('image', image);
          formData.append('project_id', project_id);
          formData.append('file_name', image.name);
          try {
            // Send a POST request with the formData
            const response = await axios.post(
              `${backendURL}/add-image`,
              formData,
              {
                headers: {
                  // Inform the server about the multipart/form-data content type
                  'Content-Type': 'multipart/form-data',
                },
              },
            );
            console.log('Server Response:', response.data);
            get().actions.updateProject(project_id);
          } catch (error) {
            console.error('Error uploading image:', error);
          }
        },
        addAnnotation: (points: number[], className: string) => {
          const project_id = get().project?.project_id;
          if (!project_id) return;

          socket.emit('add_annotation', {
            project_id: project_id,
            image_id: get().selectedImageID,
            points: JSON.stringify(points),
            class_name: className,
          });
        },
        removeSelectedAnnotation: () => {
          const project_id = get().project?.project_id;
          if (!project_id) return;

          socket.emit('delete_annotation', {
            project_id: project_id,
            image_id: get().selectedImageID,
            annotation_id: get().selectedAnnotationID,
          });
        },
        removeSelectedImage: async () => {
          const project_id = get().project?.project_id;
          if (!project_id) return;

          socket.emit('delete_image', {
            project_id: project_id,
            image_id: get().selectedImageID,
          });
        },
        getSelectedImage: () => {
          if (get().selectedImageID) {
            const selectedImage = get().project?.imageAnnotations.find(
              (image) => image.image_id === get().selectedImageID,
            );
            return selectedImage || null;
          }
          return null;
        },
        getSelectedAnnotation: () => {
          if (get().selectedAnnotationID) {
            const selectedImage = get().actions.getSelectedImage();
            const selectedAnnotation = selectedImage?.annotations.find(
              (annotation) =>
                annotation.annotation_id === get().selectedAnnotationID,
            );
            return selectedAnnotation || null;
          }
          return null;
        },
        modifySelectedAnnotation: (
          points: number[],
          className: string,
          annotation_id: string,
        ) => {
          const project_id = get().project?.project_id;
          if (!project_id) return;

          socket.emit('modify_annotation', {
            project_id: project_id,
            image_id: get().selectedImageID,
            annotation_id: annotation_id,
            points: JSON.stringify(points),
            class_name: className,
          });
        },
        changeProjectName: (name: string) => {
          const project_id = get().project?.project_id;
          if (!project_id) return;

          socket.emit('change_project_name', {
            project_id: project_id,
            name: name,
          });
        },
        changeDefaultClass: (className: string) => {
          const project_id = get().project?.project_id;
          if (!project_id) return;

          socket.emit('set_default_class', {
            project_id: project_id,
            class_name: className,
          });
        },
        addClass: (className: string) => {
          const project_id = get().project?.project_id;
          if (!project_id) return;

          socket.emit('add_class', {
            project_id: project_id,
            class_name: className,
          });
        },
        setZoomLevel: (zoomLevel: number) => set(() => ({ zoomLevel })),
        setZoomCenter: (x: number, y: number) =>
          set(() => ({ zoomCenter: { x, y } })),
        setMagicImage: (image_id: string) => {
          console.log('Setting magic image:', image_id);
          const project_id = get().project?.project_id;
          if (!project_id) return;

          socket.emit('set_magic_image', {
            project_id: project_id,
            image_id: image_id,
          });
        },
        setMagicPoints: (points: number[], labels: number[]) => {
          const project_id = get().project?.project_id;
          if (!project_id) return;

          socket.emit('set_magic_points', {
            project_id: project_id,
            image_id: get().selectedImageID,
            points: JSON.stringify(points),
            labels: JSON.stringify(labels),
          });
        },
        addAnnotations: (
          annotations: { points: number[]; className: string }[],
        ) => {
          const project_id = get().project?.project_id;
          if (!project_id) return;

          socket.emit('add_annotations', {
            project_id: project_id,
            image_id: get().selectedImageID,
            annotations: JSON.stringify(annotations),
          });
        },
      },
    };
  },
);

'use client';
import ImageTable from './ImageTable';
import { AnnotationEditor } from './AnnotationEditor';
import { ProjectNameEditor } from './ProjectNameEditor';
import { useRef } from 'react';
import { addImage, deleteImage } from '@/stores/imageDatabase';
import {
  useAnnotationSessionStore,
  ImageAnnotation,
} from '@/stores/useAnnotationSessionStore';

export default function ProjectSideBar() {
  const sessionActions = useAnnotationSessionStore((state) => state.actions);
  const selectedImage = sessionActions.getSelectedImage();

  const handledeleteImage = () => {
    if (selectedImage) {
      deleteImage(selectedImage.db_key!);
      sessionActions.deleteSelectedImage();
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleFileInputChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = e.target.files;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        const db_key = await addImage(files[i]);
        const newImage = new ImageAnnotation(db_key, files[i].name);
        sessionActions.addImage(newImage);
      }
    }
  };

  return (
    <aside className="flex h-full w-60 flex-col bg-neutral">
      <ProjectNameEditor />
      <div className="flex h-2/3 flex-col justify-between border-b-4 border-base-100">
        <div className="max-h-full overflow-y-auto border-b-2 border-base-100">
          <ImageTable />
        </div>
        <div className="mb-3 mt-5 flex justify-evenly">
          <input
            type="file"
            className="hidden"
            onChange={handleFileInputChange}
            ref={fileInputRef}
            multiple
            accept="image/*"
          ></input>
          <button
            className="btn btn-accent p-1"
            onClick={() => fileInputRef.current?.click()}
          >
            Upload
          </button>
          <button className="btn btn-error p-1" onClick={handledeleteImage}>
            Delete
          </button>
        </div>
      </div>
      <AnnotationEditor />
      <div className="mb-3 mt-5 flex justify-evenly">
        <button className="btn btn-success p-1">Save Project</button>
        <button className="btn btn-warning p-1">Export</button>
      </div>
    </aside>
  );
}
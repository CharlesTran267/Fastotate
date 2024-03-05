'use client';
import ImageTable from './ImageTable';
import { AnnotationEditor } from './AnnotationEditor';
import { ProjectNameEditor } from './ProjectNameEditor';
import { useEffect, useRef, useState } from 'react';
import { useAnnotationSessionStore } from '@/stores/useAnnotationSessionStore';
import { useParams } from 'next/navigation';
import { LoadingModal } from '@/components/LoadingModal';

export default function ProjectSideBar() {
  const projectId = useParams().project_id as string;

  const sessionActions = useAnnotationSessionStore((state) => state.actions);
  const selectedImageID = useAnnotationSessionStore(
    (state) => state.selectedImageID,
  );
  const [downloadLoading, setDownloadLoading] = useState(false);

  const handledeleteImage = () => {
    if (selectedImageID) {
      sessionActions.removeSelectedImage();
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        sessionActions.uploadImage(files[i], projectId);
      }
    }
  };
  const handleExportProject = async () => {
    setDownloadLoading(true);
    const exportedData = await sessionActions.getProjectCOCOformat();
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(exportedData),
    )}`;
    const link = document.createElement('a');
    link.href = jsonString;
    link.setAttribute('download', `${projectId}-annotations.coco.json`); // Set the file name
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setDownloadLoading(false);
  };

  useEffect(() => {
    const modal = document.getElementById(
      'exporting_modal',
    ) as HTMLDialogElement;
    if (modal == null) return;

    if (downloadLoading) {
      modal.showModal();
    } else {
      if (modal.open) modal.close();
    }
  }, [downloadLoading]);

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
        <button className="btn btn-warning p-1" onClick={handleExportProject}>
          Export
        </button>
      </div>
      <LoadingModal
        modal_id="exporting_modal"
        modal_title="Exporting Annotations"
        modal_message="Exporting Project Annotations to COCO format"
      />
    </aside>
  );
}

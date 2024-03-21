'use client';
import ImageTable from './ImageTable';
import { AnnotationEditor } from './AnnotationEditor';
import { ProjectNameEditor } from './ProjectNameEditor';
import { useEffect, useRef, useState } from 'react';
import { useAnnotationSessionStore } from '@/stores/useAnnotationSessionStore';
import { useParams } from 'next/navigation';
import { LoadingModal } from '@/components/Modals/LoadingModal';
import { useUserSessionStore } from '@/stores/useUserSessionStore';

export default function ProjectSideBar() {
  const projectId = useParams().project_id as string;

  const userSessionActions = useUserSessionStore((state) => state.actions);
  const session_token = useUserSessionStore((state) => state.session_token);

  const sessionActions = useAnnotationSessionStore((state) => state.actions);
  const selectedImageID = useAnnotationSessionStore(
    (state) => state.selectedImageID,
  );
  const selectedVideoID = useAnnotationSessionStore(
    (state) => state.selectedVideoID,
  );
  const [loading, setLoading] = useState(false);

  const handledeleteImage = () => {
    if (selectedVideoID) {
      sessionActions.removeSelectedVideo();
    } else if (selectedImageID) {
      sessionActions.removeSelectedImage();
    }
  };

  const [extractingFrames, setExtractingFrames] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleFileInputChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = e.target.files;
    if (files === null) return;
    const totalSize = Array.from(files).reduce(
      (acc, file) => acc + file.size,
      0,
    );
    if (totalSize > 1024 * 1024 * 10) {
      alert('Total size of files should be less than 10MB');
      return;
    }

    setUploading(true);
    if (files) {
      for (let i = 0; i < files.length; i++) {
        const fileType = files[i].type.split('/')[0];
        if (fileType === 'video') {
          await sessionActions.uploadVideo(files[i], projectId);
        } else {
          await sessionActions.uploadImage(files[i], projectId);
        }
      }
    }
    setUploading(false);
  };
  const handleExportProject = async () => {
    setLoading(true);
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
    setTimeout(() => {
      setLoading(false);
    }, 500);
  };

  const handleSaveProject = async () => {
    if (session_token === null) {
      const modal = document.getElementById(
        'save_project_warning_modal',
      ) as HTMLDialogElement;
      if (modal == null) return;
      modal.showModal();
      return;
    }
    const modal = document.getElementById('saving_modal') as HTMLDialogElement;
    if (modal == null) return;
    modal.showModal();
    await userSessionActions.saveProject(projectId);
    setTimeout(() => {
      modal.close();
    }, 500);
  };

  const handleOpenLoginModal = () => {
    const modal = document.getElementById('login_modal') as HTMLDialogElement;
    if (modal == null) return;
    modal.showModal();

    // Close current modal
    const cur_modal = document.getElementById(
      'save_project_warning_modal',
    ) as HTMLDialogElement;
    if (cur_modal == null) return;
    cur_modal.close();
  };

  const handleOpenSignUpModal = () => {
    const modal = document.getElementById('signup_modal') as HTMLDialogElement;
    if (modal == null) return;
    modal.showModal();

    // Close current modal
    const cur_modal = document.getElementById(
      'save_project_warning_modal',
    ) as HTMLDialogElement;
    if (cur_modal == null) return;
    cur_modal.close();
  };

  useEffect(() => {
    const modal = document.getElementById(
      'exporting_modal',
    ) as HTMLDialogElement;
    if (modal == null) return;

    if (loading) {
      modal.showModal();
    } else {
      if (modal.open) modal.close();
    }
  }, [loading]);

  useEffect(() => {
    const modal = document.getElementById(
      'uploading_modal',
    ) as HTMLDialogElement;
    if (modal == null) return;

    if (uploading) {
      modal.showModal();
    } else {
      if (modal.open) modal.close();
    }
  }, [uploading]);

  return (
    <aside className="flex h-full w-60 flex-col bg-neutral">
      <ProjectNameEditor />
      <div className="flex h-2/3 flex-col justify-between border-b-4 border-base-100">
        <div className="overflow-y-auto border-b-2 border-base-100">
          <ImageTable />
        </div>
        <div className="my-3 flex items-center justify-evenly">
          <input
            type="file"
            className="hidden"
            onChange={handleFileInputChange}
            ref={fileInputRef}
            multiple
            accept="image/*, video/*"
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
        <button className="btn btn-success p-1" onClick={handleSaveProject}>
          Save Project
        </button>
        <button className="btn btn-warning p-1" onClick={handleExportProject}>
          Export
        </button>
      </div>
      <LoadingModal
        modal_id="exporting_modal"
        modal_title="Exporting Annotations"
        modal_message="Exporting Project Annotations to COCO format"
      />
      <LoadingModal
        modal_id="saving_modal"
        modal_title="Saving Project"
        modal_message="Saving Project To Persisted Database"
      />
      <LoadingModal
        modal_id="uploading_modal"
        modal_title="Uploading Files"
        modal_message="Extracting frames and uploading files to Server"
      />
      <dialog id="save_project_warning_modal" className="modal">
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
        <div className="modal-box">
          <h3 className="mb-3 text-lg font-bold">Save Project</h3>
          <p> You need to login to save the project. </p>
          <div className="modal-action">
            <button
              className="btn btn-success mx-2 py-1"
              onClick={handleOpenLoginModal}
            >
              Login
            </button>
            <button
              className="btn btn-error py-1"
              onClick={handleOpenSignUpModal}
            >
              Sign Up
            </button>
          </div>
        </div>
      </dialog>
    </aside>
  );
}

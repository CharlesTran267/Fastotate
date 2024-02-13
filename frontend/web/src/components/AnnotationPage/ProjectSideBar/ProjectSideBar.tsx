'use client';
import ImageTable from './ImageTable';
import { AnnotationEditor } from './AnnotationEditor';
import { ProjectNameEditor } from './ProjectNameEditor';
import { useRef } from 'react';

export default function ProjectSideBar() {
  const handledeleteImage = () => {
    // let newProject = {...project};
    // newProject.project_name = 'new Name';
    // sessionActions.setProject(newProject as Project);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.files);
  };

  return (
    <aside className="flex h-full w-60 flex-col bg-neutral">
      <ProjectNameEditor />
      <div className="flex h-4/6 flex-col justify-between border-b-4 border-base-100">
        <div className="max-h-full overflow-y-auto border-b-2 border-base-100">
          <ImageTable />
        </div>
        <div className="mb-3 mt-5 flex justify-evenly">
          <input type='file' className='hidden' onChange={handleFileInputChange} ref={fileInputRef} multiple accept='image/*'></input>
          <button className="btn btn-accent p-1" onClick={()=>fileInputRef.current?.click()}>Upload</button>
          <button className="btn btn-error p-1" onClick={handledeleteImage}>
            Delete
          </button>
        </div>
      </div>
      <AnnotationEditor />
    </aside>
  );
}

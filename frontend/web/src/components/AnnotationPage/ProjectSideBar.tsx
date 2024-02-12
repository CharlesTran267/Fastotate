'use client';
import { FaEdit } from 'react-icons/fa';
import {
  Project,
  useAnnotationSessionStore,
} from '@/stores/useAnnotationSessionStore';
import { useEffect } from 'react';

export default function ProjectSideBar() {
  const project = useAnnotationSessionStore((state) => state.project);
  const sessionActions = useAnnotationSessionStore((state) => state.actions);
  const selectedAnnotation = sessionActions.getSelectedAnnotation();

  const handleProjectNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newProject = project;
    newProject.project_name = e.target.value;
    sessionActions.setProject(newProject);
  };

  const handleAddClass = () => {
    let newProject = { ...project };
    newProject.classes.push('New Class');
    sessionActions.setProject(newProject as Project);
  };

  const handledeleteImage = () => {
    // let newProject = {...project};
    // newProject.project_name = 'new Name';
    // sessionActions.setProject(newProject as Project);
  };

  return (
    <aside className="flex h-full w-60 flex-col bg-neutral">
      <div className="flex items-center justify-center border-b-4 border-base-100">
        <h2 className="text-xl font-bold text-base-100">
          {project.project_name}
        </h2>
        <button className="btn btn-ghost p-2">
          <FaEdit size={20} color="#151726" />
        </button>
      </div>
      <div className="flex h-4/6 flex-col justify-between border-b-4 border-base-100">
        <div className="max-h-full overflow-y-auto border-b-2 border-base-100">
          <table className="table table-pin-rows table-pin-cols text-base-100">
            <thead className="font-black">
              <tr>
                <th className="w-3/5">File Name</th>
                <th className="w-2/5 p-1">Annotations</th>
              </tr>
            </thead>
            <tbody>
              {[...Array(10)].map((_, i) => (
                <tr className="bg-neutral hover:bg-slate-500" key={i}>
                  <td className="h-10 whitespace-nowrap">
                    File {i} fdsafsdfsdfsdfsf
                  </td>
                  <th className="bg-neutral text-center">{i}</th>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mb-3 mt-5 flex justify-evenly">
          <button className="btn btn-accent p-1">Upload</button>
          <button className="btn btn-error p-1" onClick={handledeleteImage}>
            Delete
          </button>
        </div>
      </div>
      <div className="flex h-full flex-col items-center">
        <h1 className="mt-3 text-xl font-bold text-base-100">
          Annotation Editor
        </h1>
        <div className="flex h-full flex-col justify-evenly">
          <div>
            <h2 className="font-bold text-base-100">Class Name:</h2>
            <select
              defaultValue="Class Name"
              className="select select-bordered w-full border-2 border-base-100 bg-neutral text-base-100"
              disabled={selectedAnnotation === null}
            >
              {project.classes.map((c) => (
                <option key={c}>{c}</option>
              ))}
              <option onClick={handleAddClass}>+ Add new option</option>
            </select>
          </div>
          <div>
            <h2 className="font-bold text-base-100">Default Class:</h2>
            <select
              defaultValue="Default Class"
              className="select select-bordered w-full border-2 border-base-100 bg-neutral text-base-100"
            >
              {project.classes.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </aside>
  );
}
